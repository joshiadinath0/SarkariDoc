import React from 'react'

const faqs = [
    {
        question: "How do I resize a photo for PAN card application?",
        answer: "For PAN card, your photo must be 3.5cm x 2.5cm, 200 DPI, and under 50KB. Upload your image to SarkariDoc, select 'PAN Card', and we automatically crop, resize, and compress it to the exact NSDL/UTIITSL requirements."
    },
    {
        question: "Can I compress a PDF to 200KB for SBI KYC?",
        answer: "Yes. Select 'Bank KYC' or 'General', upload your PDF, and SarkariDoc will compress it to under 200KB while keeping the text readable. Perfect for SBI, HDFC, and ICICI portal uploads."
    },
    {
        question: "How to remove shadows from a document photo?",
        answer: "Our tool has a built-in 'Shadow Remover'. When you upload a photo (like Aadhaar or Voter ID), our AI automatically whitens the background and enhances the text contrast."
    },
    {
        question: "Is it safe to upload documents here?",
        answer: "Yes, absolutely. SarkariDoc processes files locally in your browser/server session and deletes them automatically after 1 hour. We do not store your documents permanently."
    },
    {
        question: "What is the size limit for UPSC photo and signature?",
        answer: "UPSC requires photos between 20KB-300KB and signatures between 10KB-20KB. Our 'General' tool allows you to set a custom size target to meet these exact limits."
    }
]

export default function FAQ() {
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
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
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
