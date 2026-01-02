'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import UploadBox from '@/components/UploadBox'
import DepartmentList from '@/components/DepartmentList'
import TopBar from '@/components/TopBar'
import Logo from '@/components/Logo'
import HowItWorks from '@/components/HowItWorks'
import SupportedDocs from '@/components/SupportedDocs'
import FAQ from '@/components/FAQ'
import { departments, getService } from '@/lib/departments'
import { useAccessibility } from '@/context/AccessibilityContext'

export default function HomePage({ params: { lang } }: { params: { lang: 'en' | 'hi' } }) {
  const router = useRouter()
  const { t } = useAccessibility()
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

      router.push(`/${lang}/processing?${queryParams.toString()}`)
    } catch (error) {
      alert('Failed to upload file. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <header className="border-b-4 border-b-saffron-500 bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3" aria-label="Main navigation">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href={`/${lang}`} className="flex items-center space-x-4">
                <Logo className="w-14 h-14" />
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold text-primary-600 tracking-tight leading-none">SarkariDoc</h1>
                  <span className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-widest mt-0.5">{t('topbar.utility_name')}</span>
                </div>
              </a>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 focus:outline-none">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block bg-primary-50 border border-primary-200 text-primary-800 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            {t('hero.badge')}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            {t('hero.title_part1')} <span className="text-primary-600">{t('hero.title_part2')}</span>
          </h2>
          <p
            className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t('hero.description') }}
          />
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
                  {t('common.upload_for')} {(() => {
                    const lang = (useAccessibility() as any).language;
                    return lang === 'hi' && selectedService.name_hi ? selectedService.name_hi : selectedService.name;
                  })()}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {t('common.requirements')}: {t('departments.max_size')} {selectedService.rules.maxSizeKB}KB • {selectedService.rules.orientation} • {selectedService.rules.allowedFormats.join(', ')}
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
                    {t('common.target_size')}
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
                    {t('common.leave_empty')} ({selectedService.rules.maxSizeKB} KB)
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
                    {t('common.analyzing')}
                  </span>
                ) : (
                  t('common.analyze_fix')
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* SEO Content Sections */}
      <HowItWorks />
      <SupportedDocs />
      <FAQ />
    </div>
  )
}

