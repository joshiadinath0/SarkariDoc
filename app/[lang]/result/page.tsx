'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useParams } from 'next/navigation'
import { ValidationResult } from '@/types'

function ResultContent() {
  const searchParams = useSearchParams()
  const params = useParams()
  const lang = params.lang as string
  const fileId = searchParams.get('fileId')

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!fileId) {
      setError('File ID is missing')
      setLoading(false)
      return
    }

    const purpose = searchParams.get('purpose')
    loadResult(fileId, purpose)
  }, [fileId, searchParams])

  const loadResult = async (fileId: string, purpose: string | null) => {
    try {
      // Get validation results
      const validationUrl = purpose
        ? `/api/validate?fileId=${fileId}&purpose=${purpose}`
        : `/api/validate?fileId=${fileId}`

      const validationResponse = await fetch(validationUrl)
      if (!validationResponse.ok) {
        throw new Error('Failed to load validation results')
      }
      const validation = await validationResponse.json()
      setValidationResult(validation)

      // Get preview
      const previewResponse = await fetch(`/api/download/${fileId}?preview=true`)
      if (previewResponse.ok) {
        const blob = await previewResponse.blob()
        const blobUrl = URL.createObjectURL(blob)
        setPreviewUrl(blobUrl)

        // Determine preview type from content type
        const contentType = previewResponse.headers.get('content-type') || ''
        if (contentType.includes('pdf')) {
          setPreviewType('pdf')
        } else if (contentType.includes('image')) {
          setPreviewType('image')
        } else {
          // Fallback: check file extension from URL or assume image
          setPreviewType('image')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!fileId) return
    window.location.href = `/api/download/${fileId}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href={`/${lang}`}
            className="inline-block bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {validationResult?.passed ? 'Document Ready!' : 'Review Required'}
          </h1>
          <p className="text-gray-600">
            {validationResult?.passed
              ? 'Your document has been processed and validated successfully.'
              : 'Please review the validation results below.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Preview</h2>
            {previewUrl ? (
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                {previewType === 'pdf' ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-96"
                    title="Document Preview"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Document Preview"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                )}
              </div>
            ) : (
              <div className="border-2 border-gray-200 rounded-lg h-96 flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Preview not available</p>
              </div>
            )}
          </div>

          {/* Validation Results */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Validation Results</h2>

            {validationResult && (
              <div className="space-y-4">
                {/* Overall Status */}
                <div
                  className={`p-4 rounded-lg ${validationResult.passed
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-yellow-50 border border-yellow-200'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    {validationResult.passed ? (
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                    <span
                      className={`font-semibold ${validationResult.passed ? 'text-green-800' : 'text-yellow-800'
                        }`}
                    >
                      {validationResult.passed
                        ? 'All checks passed!'
                        : 'Some checks need attention'}
                    </span>
                  </div>
                </div>

                {/* Individual Checks */}
                <div className="space-y-2">
                  {validationResult.checks.map((check, index) => (
                    <div
                      key={index}
                      className={`flex items-start space-x-3 p-3 rounded-lg ${check.passed
                        ? 'bg-green-50'
                        : check.severity === 'error'
                          ? 'bg-red-50'
                          : 'bg-yellow-50'
                        }`}
                    >
                      {check.passed ? (
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <div className="flex-1">
                        <p className={`font-medium ${check.passed ? 'text-green-800' : 'text-red-800'
                          }`}>
                          {check.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">{check.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Suggestions */}
                {validationResult.suggestions.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Suggestions:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                      {validationResult.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 space-y-3">
              {validationResult?.passed ? (
                <button
                  onClick={handleDownload}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download Fixed Document</span>
                </button>
              ) : (
                <button
                  onClick={() => window.location.href = `/${lang}/processing?fileId=${fileId}&purpose=${searchParams.get('purpose')}&mode=fix`}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Fix Document</span>
                </button>
              )}
            </div>

            {/* Back Button */}
            <div className="mt-4">
              <a
                href={`/${lang}`}
                className="block text-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                Fix Another Document
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  )
}
