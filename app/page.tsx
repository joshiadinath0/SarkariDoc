'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import UploadBox from '@/components/UploadBox'
import DepartmentList from '@/components/DepartmentList'
import { departments, getService } from '@/lib/departments'

export default function HomePage() {
  const router = useRouter()
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [customSizeKB, setCustomSizeKB] = useState<number | ''>('')

  const selectedService = selectedServiceId ? getService(selectedServiceId) : null
  const isGeneralTool = departments.find(d => d.id === 'general_tools')?.services.some(s => s.id === selectedServiceId)

  const handleFixDocument = async () => {
    if (!file || !selectedServiceId) {
      return
    }

    setIsProcessing(true)

    try {
      // Upload file
      const formData = new FormData()
      formData.append('file', file)
      formData.append('purpose', selectedServiceId)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Upload failed')
      }

      const { fileId } = await uploadResponse.json()

      // Navigate to processing page - Pass custom size if set
      const queryParams = new URLSearchParams({
        fileId,
        purpose: selectedServiceId,
      })

      if (customSizeKB) {
        queryParams.append('maxSizeKB', customSizeKB.toString())
      }

      router.push(`/processing?${queryParams.toString()}`)
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" aria-label="Main navigation">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                <span className="text-white font-bold text-xl">DF</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">DocFix India</h1>
                <p className="text-xs text-gray-500">Resize & Compress for Govt Portals</p>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Resize & Compress Documents
            <span className="block text-blue-600">For Indian Govt Portals</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Free tool to <strong>resize, compress, and fix</strong> PDF & Images for Income Tax, Aadhaar, Passport, and Bank KYC uploads. 100% compliant and secure.
          </p>
        </div>

        {/* Department Selection */}
        <div className="mb-12">
          <DepartmentList
            departments={departments}
            onSelectService={(id) => {
              setSelectedServiceId(id)
              setCustomSizeKB('') // Reset custom size on change
              // Scroll to upload section
              document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })
            }}
          />
        </div>

        {/* Upload Section - Only shown when service selected */}
        {selectedService && (
          <div id="upload-section" className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6 animate-slide-up ring-1 ring-blue-100">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Upload for {selectedService.name}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Requirements: Max {selectedService.rules.maxSizeKB}KB • {selectedService.rules.orientation} • {selectedService.rules.allowedFormats.join(', ')}
                </p>
              </div>

              {/* Upload Box */}
              <div>
                <UploadBox
                  file={file}
                  onFileSelect={setFile}
                  acceptedFormats={selectedService.rules.allowedFormats}
                />
              </div>

              {/* Custom Size Input for General Tools */}
              {isGeneralTool && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    Target File Size (KB)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={customSizeKB}
                      onChange={(e) => setCustomSizeKB(Number(e.target.value) || '')}
                      placeholder={selectedService.rules.maxSizeKB.toString()}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 bg-white text-gray-900"
                    />
                    <span className="text-sm text-gray-500">KB</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Leave empty to use default ({selectedService.rules.maxSizeKB} KB)
                  </p>
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={handleFixDocument}
                disabled={!file || !selectedServiceId || isProcessing}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  'Analyze & Fix'
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

