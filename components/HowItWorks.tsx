import React from 'react'

const steps = [
    {
        title: "1. Select Document Type",
        description: "Choose what you are applying for (PAN, Aadhaar, Passport, SBI KYC, etc.). We have pre-set rules for each.",
        icon: "📄"
    },
    {
        title: "2. Upload File",
        description: "Upload your photo, signature, or PDF. We accept JPG, PNG, and PDF formats up to 10MB.",
        icon: "upload"
    },
    {
        title: "3. Auto-Processing",
        description: "Our AI automatically resizes to cm/mm, compresses to KB, removes shadows, and fixes DPI.",
        icon: "⚙️"
    },
    {
        title: "4. Download",
        description: "Get a verified file that is 100% compliant with the government portal's upload rules.",
        icon: "✅"
    }
]

export default function HowItWorks() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How to Resize Documents for Indian Government Portals',
        step: steps.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.title,
            text: step.description,
        }))
    }

    return (
        <section className="py-16 bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900">How to Resize Your Documents</h2>
                    <p className="mt-4 text-lg text-gray-600">Follow these simple steps to fix your documents in seconds.</p>
                </div>

                <div className="grid gap-8 md:grid-cols-4">
                    {steps.map((step, index) => (
                        <div key={index} className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-white p-6 rounded-lg leading-none flex flex-col items-center text-center h-full">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                                    {index + 1}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
