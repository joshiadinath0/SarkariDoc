'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import UploadBox from '@/components/UploadBox'
import DepartmentList from '@/components/DepartmentList'
import HowItWorks from '@/components/HowItWorks'
import SupportedDocs from '@/components/SupportedDocs'
import FAQ from '@/components/FAQ'
import { departments, getService } from '@/lib/departments'
import { useAccessibility } from '@/context/AccessibilityContext'

export default function HomePage({ params: { lang } }: { params: { lang: 'en' | 'hi' } }) {
  const router = useRouter()
  const { t, language } = useAccessibility()
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [customSizeKB, setCustomSizeKB] = useState<number | ''>('')
  const [darkenSignature, setDarkenSignature] = useState(false)
  const [autoCrop, setAutoCrop] = useState(false)
  const [targetDPI, setTargetDPI] = useState<number>(300)
  const [pdfPassword, setPdfPassword] = useState('')
  const [signatureFile, setSignatureFile] = useState<File | null>(null)
  const [selfAttest, setSelfAttest] = useState(false)

  const selectedService = selectedServiceId ? getService(selectedServiceId) : null
  const isGeneralTool = departments.find(d => d.id === 'general_tools')?.services.some(s => s.id === selectedServiceId)
  const isSignature = selectedServiceId?.includes('sign') || selectedServiceId === 'signature'
  const isPDF = file?.type === 'application/pdf' || file?.name.toLowerCase().endsWith('.pdf')

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
      let sigId = null

      // Upload signature if needed
      if (selfAttest && signatureFile) {
        const sigFormData = new FormData()
        sigFormData.append('file', signatureFile)
        sigFormData.append('purpose', 'signature')

        const sigUploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: sigFormData,
        })
        if (sigUploadRes.ok) {
          const sigData = await sigUploadRes.json()
          sigId = sigData.fileId
        }
      }

      // Navigate to processing page - Pass custom size if set
      const queryParams = new URLSearchParams({
        fileId,
        purpose: selectedServiceId,
      })

      if (customSizeKB) {
        queryParams.append('maxSizeKB', customSizeKB.toString())
      }
      if (darkenSignature) queryParams.append('darkenSignature', 'true')
      if (autoCrop) queryParams.append('autoCrop', 'true')
      if (targetDPI) queryParams.append('dpi', targetDPI.toString())
      if (pdfPassword && isPDF) queryParams.append('password', pdfPassword)
      if (sigId) queryParams.append('sigId', sigId)

      router.push(`/${lang}/processing?${queryParams.toString()}&mode=fix`)
    } catch (error) {
      alert('Failed to upload files. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <div key="homepage-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 focus:outline-none">
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

            // Auto-toggle relevant features for specific tools
            if (id === 'self_attestation') setSelfAttest(true)
            else if (id === 'signature_fixer') setDarkenSignature(true)
            else if (id === 'auto_crop') setAutoCrop(true)
            else if (id === 'pdf_unlocker' || id === 'aadhaar_masker') {
              // These specific tools auto-configure themselves in the backend
            }

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
                {t('common.upload_for')} {language === 'hi' && selectedService.name_hi ? selectedService.name_hi : selectedService.name}
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

            {/* Advanced Sarkari Tools */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
                <svg className="w-4 h-4 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                {t('advanced.title')}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bulk Self-Attestation (World First) */}
                {!isSignature && (
                  <div className="col-span-1 md:col-span-2 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selfAttest}
                        onChange={(e) => setSelfAttest(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <div>
                        <span className="text-sm font-bold text-indigo-900 leading-none">{t('advanced.self_attest')}</span>
                        <p className="text-[10px] text-indigo-700 mt-0.5">{t('advanced.self_attest_desc')}</p>
                      </div>
                    </label>

                    {selfAttest && (
                      <div className="mt-4 animate-slide-up space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-indigo-900 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            {t('advanced.upload_signature')}
                          </p>
                          <span className="text-[9px] bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">Pro Feature</span>
                        </div>

                        <div className={`relative border-2 border-dashed rounded-xl transition-all ${signatureFile ? 'border-green-300 bg-green-50' : 'border-indigo-200 bg-white hover:border-indigo-400'}`}>
                          {signatureFile ? (
                            <div className="p-4 flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white rounded-lg border flex items-center justify-center p-1">
                                  <img src={URL.createObjectURL(signatureFile)} alt="Signature" className="max-w-full max-h-full object-contain" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-900 truncate max-w-[150px]">{signatureFile.name}</p>
                                  <p className="text-[10px] text-gray-500">{(signatureFile.size / 1024).toFixed(1)} KB</p>
                                </div>
                              </div>
                              <button
                                onClick={() => setSignatureFile(null)}
                                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center">
                              <UploadBox
                                file={signatureFile}
                                onFileSelect={setSignatureFile}
                                acceptedFormats={['image/jpeg', 'image/png']}
                              />
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-indigo-600/70 text-center italic leading-tight">
                          Magic: Your signature will be digitally stamped on all pages automatically.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Signature Darkener */}
                {isSignature && (
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={darkenSignature}
                        onChange={(e) => setDarkenSignature(e.target.checked)}
                      />
                      <div className={`w-10 h-6 rounded-full transition-colors ${darkenSignature ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${darkenSignature ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{t('advanced.darken_signature')}</span>
                  </label>
                )}

                {/* Auto-Crop */}
                {!isPDF && (
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={autoCrop}
                        onChange={(e) => setAutoCrop(e.target.checked)}
                      />
                      <div className={`w-10 h-6 rounded-full transition-colors ${autoCrop ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${autoCrop ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{t('advanced.auto_crop')}</span>
                  </label>
                )}

                {/* Target DPI */}
                {!isPDF && (
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-semibold text-gray-500">{t('advanced.dpi_label')}</label>
                    <select
                      value={targetDPI}
                      onChange={(e) => setTargetDPI(Number(e.target.value))}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 bg-white text-gray-900 border"
                    >
                      <option value={72}>72 DPI (Web)</option>
                      <option value={200}>200 DPI (Standard)</option>
                      <option value={300}>300 DPI (Strict Govt)</option>
                      <option value={600}>600 DPI (High Res)</option>
                    </select>
                  </div>
                )}

                {/* PDF Password */}
                {isPDF && (
                  <div className="col-span-1 md:col-span-2 flex flex-col space-y-1 mt-2">
                    <label className="text-xs font-semibold text-gray-500">{t('advanced.pdf_password')}</label>
                    <input
                      type="password"
                      value={pdfPassword}
                      onChange={(e) => setPdfPassword(e.target.value)}
                      placeholder={t('advanced.pdf_password_placeholder')}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2.5 bg-white text-gray-900 border"
                    />
                    <p className="text-[10px] text-gray-500 mt-1 italic">Note: Password is used only to unlock for processing. We never store it.</p>
                  </div>
                )}
              </div>
            </div>

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

      {/* SEO Content Sections */}
      <HowItWorks />
      <SupportedDocs />
      <FAQ />
    </div>
  )
}

