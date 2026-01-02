'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ProcessingStatus } from '@/types'

function ProcessingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const fileId = searchParams.get('fileId')
  const purpose = searchParams.get('purpose')

  const [status, setStatus] = useState<ProcessingStatus>({
    step: 'Initializing',
    progress: 0,
    message: 'Starting document processing...',
  })

  const mode = searchParams.get('mode')

  useEffect(() => {
    if (!fileId || !purpose) {
      router.push('/')
      return
    }

    if (mode === 'fix') {
      processDocument(fileId, purpose)
    } else {
      // Analyze mode (default)
      analyzeDocument()
    }
  }, [fileId, purpose, mode, router])

  const analyzeDocument = async () => {
    setStatus({
      step: 'Validation',
      progress: 0,
      message: 'Analyzing document...',
    })

    // Simulate analysis delay (real analysis happens on result page via API)
    await new Promise(resolve => setTimeout(resolve, 1500))

    setStatus({
      step: 'Final Check',
      progress: 100,
      message: 'Analysis complete',
    })

    setTimeout(() => {
      router.push(`/result?fileId=${fileId}&purpose=${purpose}`)
    }, 500)
  }

  const processDocument = async (fileId: string, purpose: string) => {
    try {
      setStatus({
        step: 'Uploading',
        progress: 10,
        message: 'File uploaded successfully',
      })

      // Start processing
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId,
          purpose,
          maxSizeKB: searchParams.get('maxSizeKB') ? Number(searchParams.get('maxSizeKB')) : undefined
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = 'Processing failed'
        try {
          const error = JSON.parse(errorText)
          errorMessage = error.message || error.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const stream = response.body
      if (!stream) {
        throw new Error('No response stream')
      }

      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.trim() && line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.error) {
                throw new Error(data.error)
              }

              setStatus(prev => ({
                step: data.step || prev.step,
                progress: data.progress !== undefined ? data.progress : prev.progress,
                message: data.message || prev.message,
              }))

              if (data.complete) {
                // Navigate to result page
                setTimeout(() => {
                  router.push(`/result?fileId=${fileId}&purpose=${purpose}`)
                }, 1000)
                return
              }
            } catch (e: any) {
              if (e.message && e.message.includes('error')) {
                throw e
              }
              // Ignore parse errors for malformed JSON
            }
          }
        }
      }
    } catch (error: any) {
      setStatus({
        step: 'Error',
        progress: 0,
        message: error.message || 'An error occurred during processing',
        error: error.message,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            {status.error ? (
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : status.progress === 100 ? (
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {status.error ? 'Processing Failed' : status.progress === 100 ? 'Processing Complete!' : 'Processing Document'}
          </h2>
          <p className="text-gray-600">{status.message}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{status.step}</span>
            <span>{status.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${status.progress}%` }}
            />
          </div>
        </div>

        {/* Error Message */}
        {status.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">{status.error}</p>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-3">
          {[
            { name: 'Upload', key: 'upload' },
            { name: 'Validation', key: 'validation' },
            { name: 'Processing', key: 'processing' },
            { name: 'Optimization', key: 'optimization' },
            { name: 'Final Check', key: 'final' },
          ].map((step, index) => {
            const stepProgress = (index + 1) * 20
            const isActive = status.progress >= stepProgress
            const isCurrent = status.progress >= stepProgress - 20 && status.progress < stepProgress + 20

            return (
              <div
                key={step.key}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${isActive ? 'bg-green-50' : isCurrent ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isActive
                    ? 'bg-green-500 text-white'
                    : isCurrent
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                    }`}
                >
                  {isActive ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </div>
                <span className={`text-sm ${isActive ? 'text-green-700 font-medium' : isCurrent ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>
                  {step.name}
                </span>
              </div>
            )
          })}
        </div>

        {status.error && (
          <button
            onClick={() => router.push('/')}
            className="w-full mt-6 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        )}
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
