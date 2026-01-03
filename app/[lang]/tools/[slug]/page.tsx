'use client'

import { notFound } from 'next/navigation'
import { examTools } from '@/lib/exam-data'
import TopBar from '@/components/TopBar'
import { useAccessibility } from '@/context/AccessibilityContext'

export default function ExamToolPage({ params: { lang, slug } }: { params: { lang: 'en' | 'hi', slug: string } }) {
    const tool = examTools.find((t) => t.slug === slug)
    const { t, language } = useAccessibility()

    if (!tool) {
        notFound()
    }

    // Map to internal purpose ID (simplification)
    const mapTypeToPurpose = (type: string) => {
        if (type === 'signature') return 'bank_kyc'
        if (type === 'document') return 'aadhar'
        return 'pan'
    }

    const title = language === 'hi' && tool.title_hi ? tool.title_hi : tool.title
    const description = language === 'hi' && tool.description_hi ? tool.description_hi : tool.description
    const examName = language === 'hi' && tool.examName_hi ? tool.examName_hi : tool.examName
    const organization = language === 'hi' && tool.organization_hi ? tool.organization_hi : tool.organization

    return (
        <div className="min-h-screen bg-gray-50">
            <TopBar />
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center space-x-4">
                        <img
                            src="/images/official-logo.png"
                            alt="SarkariDoc"
                            className="h-16 md:h-20 w-auto object-contain"
                        />
                    </div>
                </nav>
                <div className="h-1 md:h-1.5 w-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#FF9933_36.5%,#e0e0e0,#138808_63.5%)]"></div>
                    <div className="absolute inset-0 shadow-[inset_0_-1px_0_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)]"></div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Breadcrumb */}
                <div className="text-sm text-gray-500 mb-6">
                    <a href={`/${lang}`} className="hover:text-primary-600">{t('common.home')}</a> &gt; <span className="text-gray-900">{title}</span>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                        {title}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {description}
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-10 border border-gray-100">
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100 flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-blue-900">{t('common.requirements')} {t('common.upload_for')} {examName}</h3>
                            <ul className="text-sm text-blue-800 mt-1 space-y-1">
                                <li>• {t('departments.max_size')}: <strong>{tool.rules.maxSizeKB} KB</strong></li>
                                {tool.rules.minSizeKB && <li>• Min Size: {tool.rules.minSizeKB} KB</li>}
                                {tool.rules.width && <li>• Dimensions: {tool.rules.width} x {tool.rules.height} px</li>}
                                <li>• {t('common.formats')}: {tool.rules.format.join(', ').toUpperCase()}</li>
                            </ul>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✅ {language === 'hi' ? '2024 के लिए सत्यापित' : 'Validated for 2024'}
                            </span>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="mb-6 text-gray-600">
                            {language === 'hi'
                                ? `अपने ${tool.type === 'photo' ? 'फोटो' : 'दस्तावेज़'} को ठीक करने के लिए तैयार हैं?`
                                : `Ready to fix your ${tool.type}?`}
                        </p>
                        <a
                            href={`/?service=${mapTypeToPurpose(tool.type)}&size=${tool.rules.maxSizeKB}`}
                            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 md:text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                        >
                            {language === 'hi' ? 'अपलोड करें' : 'Upload'} {tool.type === 'photo' ? (language === 'hi' ? 'फोटो' : 'Photo') : (language === 'hi' ? 'दस्तावेज़' : 'Document')}
                        </a>
                        <p className="mt-3 text-xs text-gray-400">
                            {language === 'hi' ? 'हमारे सुरक्षित प्रोसेसिंग इंजन पर रिडायरेक्ट करता है' : 'Redirects to our secure processing engine'}
                        </p>
                    </div>
                </div>

                {/* Content for SEO */}
                <article className="prose prose-blue max-w-none bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3>{language === 'hi' ? `${examName} के लिए SarkariDoc का उपयोग क्यों करें?` : `Why use SarkariDoc for ${examName}?`}</h3>
                    <p>
                        {language === 'hi'
                            ? `${organization} द्वारा संचालित ${examName} के लिए आवेदन करने के लिए सख्त छवि दिशानिर्देशों के पालन की आवश्यकता होती है।`
                            : `Applying for ${examName} handled by ${organization} requires strict adherence to image guidelines.`}
                        {language === 'hi'
                            ? `यदि आपकी ${tool.type === 'photo' ? 'फोटो' : 'दस्तावेज़'} बिल्कुल ${tool.rules.maxSizeKB}KB की नहीं है या सही आयाम ${tool.rules.width ? `(${tool.rules.width}x${tool.rules.height})` : ''} नहीं है, तो आपका आवेदन खारिज किया जा सकता है।`
                            : `If your ${tool.type} is not exactly ${tool.rules.maxSizeKB}KB or doesn't have the right dimensions ${tool.rules.width ? `(${tool.rules.width}x${tool.rules.height})` : ''}, your application might be rejected.`}
                    </p>
                    <p>
                        {language === 'hi' ? 'हमारा टूल स्वचालित रूप से:' : 'Our tool automatically:'}
                    </p>
                    <ul>
                        <li>{language === 'hi' ? 'आपकी छवि को आवश्यक आकार में कंप्रेस करता है।' : 'Compresses your image to the exact required size.'}</li>
                        <li>{language === 'hi' ? 'आधिकारिक सूचनाओं के अनुसार आयाम बदलता है।' : 'Resizes dimensions to match official notifications.'}</li>
                        <li>{language === 'hi' ? 'स्कैनिंग छाया हटाता है (अस्वीकृति का सामान्य कारण)।' : 'Removes scanning shadows (common reason for rejection).'}</li>
                        <li>{language === 'hi' ? `${tool.rules.format[0].toUpperCase()} फॉर्मेट में बदलता है।` : `Converts to ${tool.rules.format[0].toUpperCase()} format.`}</li>
                    </ul>
                </article>
            </main>
        </div>
    )
}

