import React from 'react'
import { useAccessibility } from '@/context/AccessibilityContext'

export default function FAQ() {
    const { t, language } = useAccessibility()

    const faqs = [
        {
            question: t('faq.q1'),
            answer: t('faq.a1')
        },
        {
            question: t('faq.q2'),
            answer: t('faq.a2')
        },
        {
            question: t('faq.q3'),
            answer: t('faq.a3')
        },
        {
            question: t('faq.q4'),
            answer: t('faq.a4')
        },
        {
            question: t('faq.q5'),
            answer: t('faq.a5')
        }
    ]

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
            }
        }))
    }

    return (
        <section className="py-12 bg-gray-50">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('faq.title')}</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <h3 className="font-semibold text-lg text-gray-900 mb-2">{faq.question}</h3>
                            <p className="text-gray-600 text-sm">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
