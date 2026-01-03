'use client'

import Link from 'next/link'
import { useParams, notFound } from 'next/navigation'
import { serviceGuides } from '@/lib/guide-data'
import { useAccessibility } from '@/context/AccessibilityContext'

export default function ServiceGuidePage() {
    const { lang, slug } = useParams()
    const { t } = useAccessibility()

    const guide = serviceGuides.find(s => s.slug === slug)
    if (!guide) return notFound()

    const currentLang = (lang as 'en' | 'hi') || 'en'

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-gray-500 mb-8 space-x-2">
                <Link href={`/${lang}`} className="hover:text-blue-600 transition-colors">Home</Link>
                <span>/</span>
                <Link href={`/${lang}/guides`} className="hover:text-blue-600 transition-colors">Guides</Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">{guide.name[currentLang]}</span>
            </nav>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-8 md:p-12 border-b bg-gradient-to-br from-white to-gray-50">
                    <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-4">
                        {guide.category} Checklist
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
                        {guide.name[currentLang]}
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 font-medium">
                        {guide.description[currentLang]}
                    </p>
                    <a
                        href={guide.officialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 font-bold hover:underline"
                    >
                        Official Application Link
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>

                <div className="p-8 md:p-12">
                    <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center">
                        <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center mr-3 text-sm">✓</span>
                        Required Documents Checklist
                    </h2>

                    <div className="space-y-6">
                        {guide.documents.map((doc, idx) => (
                            <div key={idx} className="group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-blue-200 transition-all duration-300">
                                <div className="mb-4 md:mb-0">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{doc.name}</h3>
                                    <p className="text-gray-500 text-sm mb-2">{doc.description}</p>
                                    {doc.specs && (
                                        <div className="flex flex-wrap gap-2">
                                            {doc.specs.sizeLimit && (
                                                <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-[10px] font-bold">MAX {doc.specs.sizeLimit}</span>
                                            )}
                                            {doc.specs.dimensions && (
                                                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">{doc.specs.dimensions}</span>
                                            )}
                                            {doc.specs.format && (
                                                <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-bold">FORMAT: {doc.specs.format}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <Link
                                    href={`/${lang}${doc.toolLink}`}
                                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-95"
                                >
                                    🚀 Fix Document
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Safety Tips */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-2">💡 Submission Tip</h4>
                    <p className="text-sm text-gray-600">Always scan documents in color at 300 DPI for best results on government portals.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-2">🔒 Privacy First</h4>
                    <p className="text-sm text-gray-600">SarkariDoc processes all files locally on your device. Your sensitive data never leaves your computer.</p>
                </div>
            </div>

            <footer className="py-12 text-center text-gray-400 text-sm">
                <p>© 2024 SarkariDoc • Document Preparation Hub</p>
            </footer>
        </div>
    )
}
