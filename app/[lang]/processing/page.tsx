'use client'

import { useEffect, useState, Suspense, useCallback, useRef } from 'react'
import { useSearchParams, useRouter, useParams } from 'next/navigation'
// Use the legacy build for better Node compatibility if needed, 
// but in 'use client' we usually want the standard one. 
// However, the issue might be the way the stream is parsed.
import { ProcessingStatus } from '@/types'

function ProcessingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams()
  const lang = params.lang as string
  const fileIdsParam = searchParams.get('fileId')
  const purpose = searchParams.get('purpose')

  // Parse file IDs (comma separated)
  const fileIds = fileIdsParam ? fileIdsParam.split(',').filter(Boolean) : []
  const isBatch = fileIds.length > 1

  // State to track status of EACH file
  const [statuses, setStatuses] = useState<Record<string, ProcessingStatus>>({})

  // Track overall completion to redirect
  const [completedCount, setCompletedCount] = useState(0)

  // Use a ref to prevent double-firing in Strict Mode
  const processedIdsRef = useRef<Set<string>>(new Set())

  // Initialize statuses
  useEffect(() => {
    const initialStatuses: Record<string, ProcessingStatus> = {}
    fileIds.forEach(id => {
      if (!statuses[id]) {
        initialStatuses[id] = {
          step: 'Initializing',
          progress: 0,
          message: 'Waiting to start...',
          fileId: id
        }
      }
    })
    if (Object.keys(initialStatuses).length > 0) {
      setStatuses(prev => ({ ...prev, ...initialStatuses }))
    }
  }, [fileIdsParam]) // Re-run if params change

  const updateStatus = useCallback((id: string, update: Partial<ProcessingStatus>) => {
    setStatuses(prev => {
      const current = prev[id] || { step: 'Init', progress: 0, message: '' }
      return {
        ...prev,
        [id]: { ...current, ...update }
      }
    })
  }, [])

  const processSingleFile = useCallback(async (id: string) => {
    if (processedIdsRef.current.has(id)) return
    processedIdsRef.current.add(id)

    try {
      updateStatus(id, { step: 'Initializing', progress: 5, message: 'Starting...' })

      // Extract options
      const maxSizeKB = searchParams.get('maxSizeKB')
      const password = searchParams.get('password')
      const dpi = searchParams.get('dpi')
      const darkenSignature = searchParams.get('darkenSignature')
      const autoCrop = searchParams.get('autoCrop')
      const sigId = searchParams.get('sigId')

      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: id,
          purpose,
          maxSizeKB: maxSizeKB ? Number(maxSizeKB) : undefined,
          password,
          dpi: dpi ? Number(dpi) : undefined,
          darkenSignature: darkenSignature === 'true',
          autoCrop: autoCrop === 'true',
          selfAttestSignatureId: sigId,
        }),
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (value) {
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || !trimmed.startsWith('data: ')) continue
            try {
              const data = JSON.parse(trimmed.slice(6))
              if (data.error) throw new Error(data.error)

              updateStatus(id, {
                step: data.step,
                progress: data.progress,
                message: data.message
              })

              if (data.complete) {
                updateStatus(id, { progress: 100, step: 'Complete', message: 'Done' })
                setCompletedCount(c => c + 1)
                return
              }
            } catch (e) { console.warn('SSE Parse Error', e) }
          }
        }

        if (done) break
      }
    } catch (error: any) {
      console.error('Processing error for', id, error)
      updateStatus(id, {
        step: 'Error',
        progress: 0,
        message: 'Failed',
        error: error.message
      })
      // Even if error, we count as "handled" to allow flow to finish? 
      // Or maybe just let it sit there.
    }
  }, [purpose, searchParams, updateStatus])

  // Trigger processing
  useEffect(() => {
    if (!fileIds.length || !purpose) return

    const mode = searchParams.get('mode')
    if (mode === 'fix') {
      fileIds.forEach(id => processSingleFile(id))
    } else {
      // Analyze mode mock
      fileIds.forEach(id => {
        updateStatus(id, { step: 'Analysis', progress: 100, message: 'Analyzed' })
        setCompletedCount(c => c + 1)
      })
    }
  }, [fileIdsParam, purpose, searchParams, processSingleFile, updateStatus])

  // Redirect when ALL complete
  useEffect(() => {
    if (fileIds.length > 0 && completedCount === fileIds.length && completedCount > 0) {
      const timeout = setTimeout(() => {
        // Redirect to result page
        // Note: Result page also needs to support batch IDs!
        router.push(`/${lang}/result?fileId=${fileIds.join(',')}&purpose=${purpose}`)
      }, 1000)
      return () => clearTimeout(timeout)
    }
  }, [completedCount, fileIds, lang, purpose, router])

  if (!fileIdsParam || !purpose) {
    return null // Or redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isBatch ? `Processing ${fileIds.length} Files` : 'Processing Document'}
          </h2>
          <p className="text-gray-600">
            {completedCount === fileIds.length ? 'All finished! Redirecting...' : 'Please wait while we optimize your documents.'}
          </p>
        </div>

        <div className="space-y-6">
          {fileIds.map((id, index) => {
            const s = statuses[id] || { step: 'Waiting', progress: 0, message: 'Pending...' }
            return (
              <div key={id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${s.error ? 'bg-red-100 text-red-600' :
                        s.progress === 100 ? 'bg-green-100 text-green-600' :
                          'bg-blue-100 text-blue-600'
                      }`}>
                      {s.error ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      ) : s.progress === 100 ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">File {index + 1}</p>
                      <p className="text-xs text-gray-500">{s.message}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-700">{Math.round(s.progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${s.error ? 'bg-red-500' : 'bg-blue-600'}`}
                    style={{ width: `${s.progress}%` }}
                  />
                </div>
                {s.error && <p className="text-xs text-red-500 mt-1">{s.error}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ProcessingContent />
    </Suspense>
  )
}
