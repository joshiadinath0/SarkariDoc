export interface ExamTool {
    slug: string
    title: string
    title_hi?: string
    examName: string
    examName_hi?: string
    organization: string
    organization_hi?: string
    type: 'photo' | 'signature' | 'document'
    rules: {
        maxSizeKB: number
        minSizeKB?: number
        width?: number
        height?: number
        format: string[]
    }
    description: string
    description_hi?: string
}

export const examTools: ExamTool[] = [
    // PAN Card
    {
        slug: 'resize-pan-card-photo',
        title: 'Resize Photo for PAN Card Application (NSDL/UTIITSL)',
        title_hi: 'पैन कार्ड आवेदन (NSDL/UTIITSL) के लिए फोटो रीसाइज करें',
        examName: 'PAN Card',
        examName_hi: 'पैन कार्ड',
        organization: 'Income Tax Department',
        organization_hi: 'आयकर विभाग',
        type: 'photo',
        rules: { maxSizeKB: 50, width: 213, height: 213, format: ['jpg', 'jpeg'] },
        description: 'Instantly resize your photo to 3.5cm x 2.5cm (213x213 pixels) for NSDL and UTIITSL PAN card applications. Guaranteed acceptance.',
        description_hi: 'NSDL और UTIITSL पैन कार्ड आवेदनों के लिए अपनी फोटो को तुरंत 3.5cm x 2.5cm (213x213 पिक्सल) पर रीसाइज करें। स्वीकृत होने की गारंटी।'
    },
    {
        slug: 'resize-pan-card-signature',
        title: 'Resize Signature for PAN Card',
        title_hi: 'पैन कार्ड के लिए हस्ताक्षर रीसाइज करें',
        examName: 'PAN Card',
        examName_hi: 'पैन कार्ड',
        organization: 'Income Tax Department',
        organization_hi: 'आयकर विभाग',
        type: 'signature',
        rules: { maxSizeKB: 20, width: 400, height: 200, format: ['jpg', 'jpeg'] },
        description: 'Compress your signature to under 20KB for PAN Card upload. Dimensions adjusted to 2cm x 4.5cm automatically.',
        description_hi: 'पैन कार्ड अपलोड के लिए अपने हस्ताक्षर को 20KB से कम में कंप्रेस करें। आयाम स्वचालित रूप से 2cm x 4.5cm पर समायोजित हो जाते हैं।'
    },

    // Aadhaar
    {
        slug: 'aadhaar-card-document-resize',
        title: 'Resize Document for Aadhaar Update',
        title_hi: 'आधार अपडेट के लिए दस्तावेज़ रीसाइज करें',
        examName: 'Aadhaar Card Update',
        examName_hi: 'आधार कार्ड अपडेट',
        organization: 'UIDAI',
        organization_hi: 'UIDAI',
        type: 'document',
        rules: { maxSizeKB: 2000, format: ['pdf', 'jpg', 'png'] },
        description: 'Compress your Proof of Identity (POI) or Proof of Address (POA) document to under 2MB for UIDAI myAadhaar portal.',
        description_hi: 'UIDAI myAadhaar पोर्टल के लिए अपने पहचान प्रमाण (POI) या पता प्रमाण (POA) दस्तावेज़ को 2MB से कम में कंप्रेस करें।'
    },

    // UPSC
    {
        slug: 'resize-upsc-photo',
        title: 'Resize Photo for UPSC IAS/IPS Exam',
        title_hi: 'UPSC IAS/IPS परीक्षा के लिए फोटो रीसाइज करें',
        examName: 'UPSC Civil Services',
        examName_hi: 'UPSC सिविल सेवा',
        organization: 'Union Public Service Commission',
        organization_hi: 'संघ लोक सेवा आयोग (UPSC)',
        type: 'photo',
        rules: { maxSizeKB: 300, minSizeKB: 20, width: 350, height: 350, format: ['jpg'] },
        description: 'Resize photo for UPSC OTR and Application form. Ensures 350x350 pixels and size between 20KB-300KB.',
        description_hi: 'UPSC OTR और आवेदन फॉर्म के लिए फोटो रीसाइज करें। 350x350 पिक्सल और 20KB-300KB के बीच आकार सुनिश्चित करता है।'
    },
    {
        slug: 'resize-upsc-signature',
        title: 'Resize Signature for UPSC Exam',
        title_hi: 'UPSC परीक्षा के लिए हस्ताक्षर रीसाइज करें',
        examName: 'UPSC Civil Services',
        examName_hi: 'UPSC सिविल सेवा',
        organization: 'Union Public Service Commission',
        organization_hi: 'संघ लोक सेवा आयोग (UPSC)',
        type: 'signature',
        rules: { maxSizeKB: 300, minSizeKB: 20, width: 350, height: 350, format: ['jpg'] },
        description: 'Resize signature image for UPSC uploads. Auto-adjusts to 20KB-300KB size limit.',
        description_hi: 'UPSC अपलोड के लिए हस्ताक्षर छवि रीसाइज करें। 20KB-300KB आकार सीमा पर स्वचालित रूप से समायोजित हो जाता है।'
    },

    // SSC
    {
        slug: 'resize-ssc-cgl-photo',
        title: 'Resize Photo for SSC CGL',
        title_hi: 'SSC CGL के लिए फोटो रीसाइज करें',
        examName: 'SSC CGL',
        examName_hi: 'SSC CGL',
        organization: 'Staff Selection Commission',
        organization_hi: 'कर्मचारी चयन आयोग (SSC)',
        type: 'photo',
        rules: { maxSizeKB: 50, minSizeKB: 20, width: 250, height: 250, format: ['jpeg', 'jpg'] },
        description: 'Compress photo to 20KB-50KB for SSC CGL application. Features distinct date printing option.',
        description_hi: 'SSC CGL आवेदन के लिए फोटो को 20KB-50KB में कंप्रेस करें। विशिष्ट तिथि छपाई विकल्प की विशेषताएं।'
    },
    {
        slug: 'resize-ssc-signature',
        title: 'Resize Signature for SSC Exams',
        title_hi: 'SSC परीक्षाओं के लिए हस्ताक्षर रीसाइज करें',
        examName: 'SSC Exams',
        examName_hi: 'SSC परीक्षाएं',
        organization: 'Staff Selection Commission',
        organization_hi: 'कर्मचारी चयन आयोग (SSC)',
        type: 'signature',
        rules: { maxSizeKB: 20, minSizeKB: 10, width: 150, height: 60, format: ['jpeg', 'jpg'] },
        description: 'Resize signature to 10KB-20KB for SSC CHSL, CGL, and MTS.',
        description_hi: 'SSC CHSL, CGL और MTS के लिए हस्ताक्षर को 10KB-20KB पर रीसाइज करें।'
    },

    // IBPS / SBI (Banking)
    {
        slug: 'resize-sbi-po-photo',
        title: 'Resize Photo for SBI PO',
        title_hi: 'SBI PO के लिए फोटो रीसाइज करें',
        examName: 'SBI PO',
        examName_hi: 'SBI PO',
        organization: 'State Bank of India',
        organization_hi: 'भारतीय स्टेट बैंक (SBI)',
        type: 'photo',
        rules: { maxSizeKB: 50, minSizeKB: 20, width: 200, height: 230, format: ['jpg'] },
        description: 'Perfectly resize photo to 200x230 pixels and 20KB-50KB for SBI PO and Clerk application forms.',
        description_hi: 'SBI PO और क्लर्क आवेदन फॉर्म के लिए फोटो को 200x230 पिक्सल और 20KB-50KB में पूरी तरह से रीसाइज करें।'
    },
    {
        slug: 'resize-ibps-signature',
        title: 'Resize Signature for IBPS PO/Clerk',
        title_hi: 'IBPS PO/क्लर्क के लिए हस्ताक्षर रीसाइज करें',
        examName: 'IBPS Exams',
        examName_hi: 'IBPS परीक्षाएं',
        organization: 'IBPS',
        organization_hi: 'IBPS',
        type: 'signature',
        rules: { maxSizeKB: 20, minSizeKB: 10, width: 140, height: 60, format: ['jpg'] },
        description: 'Convert signature to 140x60 pixels and under 20KB for IBPS banking exams.',
        description_hi: 'IBPS बैंकिंग परीक्षाओं के लिए हस्ताक्षर को 140x60 पिक्सल और 20KB से कम में बदलें।'
    },
    {
        slug: 'resize-sbi-thumb-impression',
        title: 'Resize Left Thumb Impression for SBI',
        title_hi: 'SBI के लिए बाएं अंगूठे का निशान रीसाइज करें',
        examName: 'SBI PO/Clerk',
        examName_hi: 'SBI PO/क्लर्क',
        organization: 'State Bank of India',
        organization_hi: 'भारतीय स्टेट बैंक (SBI)',
        type: 'photo',
        rules: { maxSizeKB: 50, minSizeKB: 20, width: 240, height: 240, format: ['jpg'] },
        description: 'Resize left thumb impression (LTI) to 240x240 pixels (3cm x 3cm) for SBI recruitment.',
        description_hi: 'SBI भर्ती के लिए बाएं अंगूठे के निशान (LTI) को 240x240 पिक्सल (3cm x 3cm) पर रीसाइज करें।'
    },
    {
        slug: 'resize-gate-photo',
        title: 'Resize Photo for GATE 2024',
        title_hi: 'GATE 2024 के लिए फोटो रीसाइज करें',
        examName: 'GATE',
        examName_hi: 'GATE',
        organization: 'IITs / IISc',
        organization_hi: 'IITs / IISc',
        type: 'photo',
        rules: { maxSizeKB: 200, minSizeKB: 5, width: 480, height: 640, format: ['jpeg', 'jpg'] },
        description: 'Resize photo to match GATE aspect ratio (0.75 width/height) and file size limits.',
        description_hi: 'GATE पहलू अनुपात (0.75 चौड़ाई/ऊंचाई) और फ़ाइल आकार सीमाओं से मेल खाने के लिए फोटो रीसाइज करें।'
    },
    {
        slug: 'resize-neet-photo',
        title: 'Resize Photo for NEET UG',
        title_hi: 'NEET UG के लिए फोटो रीसाइज करें',
        examName: 'NEET UG',
        examName_hi: 'NEET UG',
        organization: 'NTA',
        organization_hi: 'राष्ट्रीय परीक्षण एजेंसी (NTA)',
        type: 'photo',
        rules: { maxSizeKB: 200, minSizeKB: 10, format: ['jpg'] },
        description: 'Resize passport size photo for NEET UG. 4x6 inch postcard size resizing is also supported.',
        description_hi: 'NEET UG के लिए पासपोर्ट साइज फोटो रीसाइज करें। 4x6 इंच पोस्टकार्ड साइज रीसाइजिंग भी समर्थित है।'
    },
    {
        slug: 'resize-jee-main-photo',
        title: 'Resize Photo for JEE Main',
        title_hi: 'JEE Main के लिए फोटो रीसाइज करें',
        examName: 'JEE Main',
        examName_hi: 'JEE Main',
        organization: 'NTA',
        organization_hi: 'राष्ट्रीय परीक्षण एजेंसी (NTA)',
        type: 'photo',
        rules: { maxSizeKB: 200, minSizeKB: 10, format: ['jpg'] },
        description: 'Compress JEE Main photo to 10KB-200KB. White background check included.',
        description_hi: 'JEE Main फोटो को 10KB-200KB तक कंप्रेस करें। सफेद पृष्ठभूमि जांच शामिल है।'
    },
    {
        slug: 'resize-uppsc-photo',
        title: 'Resize Photo for UPPSC',
        title_hi: 'UPPSC के लिए फोटो रीसाइज करें',
        examName: 'UPPSC',
        examName_hi: 'UPPSC',
        organization: 'Uttar Pradesh PSC',
        organization_hi: 'उत्तर प्रदेश लोक सेवा आयोग (UPPSC)',
        type: 'photo',
        rules: { maxSizeKB: 50, width: 150, height: 200, format: ['jpg'] },
        description: 'Resize image for Uttar Pradesh Public Service Commission applications.',
        description_hi: 'उत्तर प्रदेश लोक सेवा आयोग के आवेदनों के लिए छवि रीसाइज करें।'
    },
    {
        slug: 'resize-mpsc-photo',
        title: 'Resize Photo for MPSC',
        title_hi: 'MPSC के लिए फोटो रीसाइज करें',
        examName: 'MPSC',
        examName_hi: 'MPSC',
        organization: 'Maharashtra PSC',
        organization_hi: 'महाराष्ट्र लोक सेवा आयोग (MPSC)',
        type: 'photo',
        rules: { maxSizeKB: 50, width: 150, height: 200, format: ['jpg'] },
        description: 'Resize image for Maharashtra Public Service Commission applications.',
        description_hi: 'महाराष्ट्र लोक सेवा आयोग के आवेदनों के लिए छवि रीसाइज करें।'
    },

    // General Tools (referenced in Sidebar)
    {
        slug: 'mask-aadhaar',
        title: 'Aadhaar Number Masker',
        title_hi: 'आधार नंबर मास्कर',
        examName: 'Privacy Tool',
        examName_hi: 'गोपनीयता उपकरण',
        organization: 'SarkariDoc',
        organization_hi: 'सरकारीडॉक',
        type: 'document',
        rules: { maxSizeKB: 2000, format: ['jpg', 'jpeg', 'png', 'pdf'] },
        description: 'Automatically mask the first 8 digits of your Aadhaar number for privacy compliance.',
        description_hi: 'गोपनीयता अनुपालन के लिए अपने आधार नंबर के पहले 8 अंकों को स्वचालित रूप से मास्क करें।'
    },
    {
        slug: 'compress-pdf',
        title: 'PDF Compressor',
        title_hi: 'पीडीएफ कंप्रेसर',
        examName: 'General Tool',
        examName_hi: 'सामान्य उपकरण',
        organization: 'SarkariDoc',
        organization_hi: 'सरकारीडॉक',
        type: 'document',
        rules: { maxSizeKB: 500, format: ['pdf'] },
        description: 'Compress PDF files to meet government portal size requirements.',
        description_hi: 'सरकारी पोर्टल आकार आवश्यकताओं को पूरा करने के लिए पीडीएफ फाइलों को कंप्रेस करें।'
    },
    {
        slug: 'darken-signature',
        title: 'Signature Darkener',
        title_hi: 'हस्ताक्षर गहरा करें',
        examName: 'General Tool',
        examName_hi: 'सामान्य उपकरण',
        organization: 'SarkariDoc',
        organization_hi: 'सरकारीडॉक',
        type: 'signature',
        rules: { maxSizeKB: 50, format: ['jpg', 'jpeg', 'png'] },
        description: 'Make faint scanned signatures deep black for better visibility.',
        description_hi: 'बेहतर दृश्यता के लिए धुंधले स्कैन किए गए हस्ताक्षरों को गहरा काला बनाएं।'
    }
]
