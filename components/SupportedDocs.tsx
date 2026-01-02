import React from 'react'
import { useAccessibility } from '@/context/AccessibilityContext'

export default function SupportedDocs() {
    const { t } = useAccessibility()

    const categories = [
        {
            name: t('supported_docs.cat1'),
            items: ["PAN Card (NSDL/UTIITSL)", "Aadhaar Card Update", "Voter ID Card", "Driving License", "Indian Passport Seva"]
        },
        {
            name: t('supported_docs.cat2'),
            items: ["UPSC (IAS/IPS)", "SSC (CGL/CHSL)", "IBPS PO/Clerk", "RRB (Railways)", "GATE 2024", "JEE Main/Advanced", "NEET UG"]
        },
        {
            name: t('supported_docs.cat3'),
            items: ["SBI KYC Update", "HDFC Bank Document Upload", "ICICI Bank Form", "Income Tax Return (ITR)", "GST Registration"]
        },
        {
            name: t('supported_docs.cat4'),
            items: ["MahaDBT", "SSO Rajasthan", "Seva Sindhu", "E-District Delhi", "MP Online"]
        }
    ]

    return (
        <section className="py-12 bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center sm:text-left">{t('supported_docs.title')}</h2>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {categories.map((category, idx) => (
                        <div key={idx}>
                            <h3 className="font-semibold text-blue-600 mb-3 uppercase tracking-wider text-sm">{category.name}</h3>
                            <ul className="space-y-2">
                                {category.items.map((item, i) => (
                                    <li key={i} className="text-gray-600 text-sm hover:text-gray-900 transition-colors cursor-default">
                                        • {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
