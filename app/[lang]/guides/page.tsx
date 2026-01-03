'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { serviceGuides } from '@/lib/guide-data'
import { useAccessibility } from '@/context/AccessibilityContext'

export default function GuideHubPage() {
    const { lang } = useParams()
    const { t } = useAccessibility()

    const categories = [
        { id: 'identity', name: 'Identity & Citizenship', icon: '👤' },
        { id: 'travel', name: 'Passport & Travel', icon: '✈️' },
        { id: 'banking', name: 'Banking & Finance', icon: '🏦' },
        { id: 'exams', name: 'Exam & Jobs', icon: '🎓' },
    ]

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                    Master Document Guide
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
                    Find the exact document requirements for every Indian government portal.
                </p>
            </div>

            {categories.map((cat) => {
                const catServices = serviceGuides.filter(s => s.category === cat.id)
                if (catServices.length === 0) return null

                return (
                    <section key={cat.id} className="mb-12">
                        <div className="flex items-center space-x-3 mb-6">
                            <span className="text-2xl">{cat.icon}</span>
                            <h2 className="text-2xl font-bold text-gray-800">{cat.name}</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {catServices.map((service) => (
                                <Link
                                    key={service.id}
                                    href={`/${lang}/guides/${service.slug}`}
                                    className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                        {service.name[lang as 'en' | 'hi'] || service.name.en}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                                        {service.description[lang as 'en' | 'hi'] || service.description.en}
                                    </p>
                                    <div className="flex items-center text-blue-600 text-sm font-bold uppercase tracking-wider">
                                        <span>View Checklist</span>
                                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )
            })}

            {/* Note about official sources */}
            <div className="mt-16 bg-blue-50/50 p-8 rounded-3xl border border-blue-100/50 text-center max-w-3xl mx-auto">
                <p className="text-sm text-blue-800 font-medium">
                    <span className="font-bold">Disclaimer:</span> While we strive for 100% accuracy, official requirements can change. Always verify with the respective government portal for the most critical applications.
                </p>
            </div>

            <footer className="border-t py-12 bg-white text-center">
                <p className="text-gray-500 text-sm">© 2024 SarkariDoc • Proudly Made in India 🇮🇳</p>
            </footer>
        </div>
    )
}
