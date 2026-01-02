import { Department } from '@/types'

export const departments: Department[] = [
    {
        id: 'income_tax',
        name: 'Income Tax Department',
        logo: '/images/income_tax.png',
        color: 'bg-orange-50 border-orange-200 text-orange-800',
        services: [
            {
                id: 'pan_card',
                name: 'PAN Card Application',
                description: 'Complete form + ID proofs. Clubbed PDF.',
                rules: {
                    maxSizeKB: 2048, // Verified: 2 MB limit for clubbed documents
                    minDPI: 200, // Verified: 200 DPI recommended
                    backgroundColor: '#FFFFFF',
                    orientation: 'portrait',
                    allowedFormats: ['.pdf'],
                    removeShadows: true,
                },
            },
            {
                id: 'pan_photo',
                name: 'PAN Application Photo',
                description: '3.5x2.5cm photo for PAN application.',
                rules: {
                    maxSizeKB: 50, // Verified: 50 KB limit
                    minDPI: 200,
                    backgroundColor: '#FFFFFF',
                    orientation: 'portrait',
                    aspectRatio: { width: 25, height: 35 }, // 2.5cm x 3.5cm
                    allowedFormats: ['.jpg', '.jpeg'], // JPEG only
                    removeShadows: true,
                    faceDetection: true,
                },
            },
            {
                id: 'itr_upload',
                name: 'ITR / Statutory Forms',
                description: 'General attachments for e-Filing portal.',
                rules: {
                    maxSizeKB: 5120, // Verified: 5 MB limit
                    minDPI: 300,
                    orientation: 'portrait',
                    allowedFormats: ['.pdf', '.zip'],
                    removeShadows: false,
                },
            },
        ],
    },
    {
        id: 'uidai',
        name: 'Aadhaar (UIDAI)',
        logo: '/images/aadhaar.png',
        color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        services: [
            {
                id: 'aadhaar_update',
                name: 'Identity/Address Proof',
                description: 'For online Aadhaar update (PoI/PoA).',
                rules: {
                    maxSizeKB: 2048, // Verified: 2 MB limit
                    minDPI: 300,
                    backgroundColor: '#FFFFFF',
                    orientation: 'portrait',
                    allowedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
                    removeShadows: true,
                },
            },
        ],
    },
    {
        id: 'state_services',
        name: 'State Gov Services',
        logo: '/images/state_emblem.png',
        color: 'bg-green-50 border-green-200 text-green-800',
        services: [
            {
                id: 'caste_cert',
                name: 'Caste Certificate',
                description: 'MahaOnline/State portal uploads.',
                rules: {
                    maxSizeKB: 256, // Common state portal limit is often low (~256KB-500KB)
                    minDPI: 200,
                    orientation: 'portrait',
                    allowedFormats: ['.jpg', '.jpeg', '.pdf'], // Many state portals prefer JPEG
                    removeShadows: true,
                },
            },
            {
                id: 'income_cert',
                name: 'Income Certificate',
                description: 'Income proof documents.',
                rules: {
                    maxSizeKB: 500,
                    minDPI: 200,
                    orientation: 'portrait',
                    allowedFormats: ['.pdf', '.jpg'],
                    removeShadows: true,
                },
            },
        ],
    },
    {
        id: 'passport_seva',
        name: 'Passport Seva',
        logo: '/images/passport.png',
        color: 'bg-blue-50 border-blue-200 text-blue-800',
        services: [
            {
                id: 'passport_photo',
                name: 'Passport Photo',
                description: '35x45mm (or 2x2 inch). JPEG Only.',
                rules: {
                    maxSizeKB: 100, // Verified: 20KB-100KB range
                    minDPI: 300,
                    backgroundColor: '#FFFFFF',
                    orientation: 'portrait',
                    aspectRatio: { width: 35, height: 45 }, // Standard Indian Passport size
                    allowedFormats: ['.jpg', '.jpeg'], // JPEG only
                    removeShadows: true,
                    faceDetection: true,
                },
            },
            {
                id: 'passport_docs',
                name: 'Supporting Documents',
                description: 'Address proof, Birth proof, etc.',
                rules: {
                    maxSizeKB: 500, // Typically 500KB per page/doc
                    minDPI: 200,
                    orientation: 'portrait',
                    allowedFormats: ['.pdf'],
                    removeShadows: true,
                },
            },
        ],
    },
    {
        id: 'banking',
        name: 'Bank KYC',
        logo: '/images/banking.png',
        color: 'bg-indigo-50 border-indigo-200 text-indigo-800',
        services: [
            {
                id: 'kyc_docs',
                name: 'KYC Documents',
                description: 'PAN/Aadhaar/Voter ID for Banks (SBI, HDFC, ICICI).',
                rules: {
                    maxSizeKB: 500, // Verified: SBI/ICICI specify 500KB
                    minDPI: 200,
                    backgroundColor: '#FFFFFF',
                    orientation: 'landscape',
                    allowedFormats: ['.pdf', '.jpg', '.jpeg'],
                    removeShadows: true,
                },
            },
            {
                id: 'kyc_signature',
                name: 'Signature',
                description: 'Cropped signature on white paper.',
                rules: {
                    maxSizeKB: 50, // Signatures are usually small (20-50KB)
                    minDPI: 300,
                    backgroundColor: '#FFFFFF',
                    orientation: 'landscape',
                    allowedFormats: ['.jpg', '.jpeg'],
                    removeShadows: true,
                    requireSignature: true,
                },
            },
        ],
    },
    {
        id: 'general_tools',
        name: 'General Tools',
        logo: '🛠️',
        color: 'bg-gray-50 border-gray-200 text-gray-800',
        services: [
            {
                id: 'compress_pdf',
                name: 'Compress PDF',
                description: 'Reduce PDF size while maintaining quality.',
                rules: {
                    maxSizeKB: 500, // Standard compression target
                    minDPI: 150,
                    orientation: 'any',
                    allowedFormats: ['.pdf'],
                    removeShadows: false,
                },
            },
            {
                id: 'compress_image',
                name: 'Compress Image',
                description: 'Optimize JPG/PNG images for web upload.',
                rules: {
                    maxSizeKB: 200,
                    minDPI: 200,
                    backgroundColor: '#FFFFFF',
                    orientation: 'any',
                    allowedFormats: ['.jpg', '.jpeg', '.png'],
                    removeShadows: false,
                },
            },
        ],
    },
]

export function getDepartment(id: string) {
    return departments.find(d => d.id === id)
}

export function getService(id: string) {
    for (const dept of departments) {
        const service = dept.services.find(s => s.id === id)
        if (service) return service
    }
    return null
}
