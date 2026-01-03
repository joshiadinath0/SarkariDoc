export interface DocumentRequirement {
    name: string
    description: string
    toolLink: string // Link to the SarkariDoc tool that fixes this
    isOptional?: boolean
    specs?: {
        sizeLimit?: string
        dimensions?: string
        format?: string
    }
}

export interface ServiceGuide {
    id: string
    slug: string
    name: { en: string; hi: string }
    category: 'identity' | 'banking' | 'exams' | 'travel'
    description: { en: string; hi: string }
    officialLink: string
    documents: DocumentRequirement[]
}

export const serviceGuides: ServiceGuide[] = [
    {
        id: 'pan-new',
        slug: 'new-pan-card',
        name: {
            en: 'Apply for New PAN Card',
            hi: 'नए पैन कार्ड के लिए आवेदन करें'
        },
        category: 'identity',
        description: {
            en: 'Complete document checklist for NSDL/UTIITSL PAN application.',
            hi: 'NSDL/UTIITSL पैन आवेदन के लिए पूर्ण दस्तावेज़ चेकलिस्ट।'
        },
        officialLink: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html',
        documents: [
            {
                name: 'Passport Size Photo',
                description: 'Recent color photograph with white background.',
                toolLink: '/tools/resize-pan-card-photo',
                specs: { sizeLimit: '50KB', dimensions: '3.5cm x 2.5cm', format: 'JPEG' }
            },
            {
                name: 'Signature',
                description: 'Black ink signature on white paper.',
                toolLink: '/tools/resize-ssc-signature',
                specs: { sizeLimit: '50KB', dimensions: '2cm x 4.5cm', format: 'JPEG' }
            },
            {
                name: 'Identity Proof (Aadhaar)',
                description: 'Copy of Aadhaar Card.',
                toolLink: '/tools/compress-pdf'
            }
        ]
    },
    {
        id: 'passport-fresh',
        slug: 'fresh-passport',
        name: {
            en: 'Apply for Fresh Passport',
            hi: 'नए पासपोर्ट के लिए आवेदन करें'
        },
        category: 'travel',
        description: {
            en: 'Required documents for normal and Tatkaal passport applications.',
            hi: 'सामान्य और तत्काल पासपोर्ट आवेदन के लिए आवश्यक दस्तावेज़।'
        },
        officialLink: 'https://www.passportindia.gov.in/',
        documents: [
            {
                name: 'Address Proof',
                description: 'Aadhaar, Electricity Bill, or Rent Agreement.',
                toolLink: '/tools/compress-pdf'
            },
            {
                name: 'Non-ECR Proof',
                description: '10th Standard Marksheet or Degree Certificate.',
                toolLink: '/tools/compress-pdf'
            }
        ]
    },
    {
        id: 'sbi-kyc',
        slug: 'sbi-bank-kyc',
        name: {
            en: 'SBI Bank KYC Update',
            hi: 'SBI बैंक केवाईसी अपडेट'
        },
        category: 'banking',
        description: {
            en: 'Documents needed for updating KYC in State Bank of India.',
            hi: 'भारतीय स्टेट बैंक में केवाईसी अपडेट करने के लिए आवश्यक दस्तावेज़।'
        },
        officialLink: 'https://onlinesbi.sbi/',
        documents: [
            {
                name: 'Identity Proof',
                description: 'PAN, Aadhaar, or Voter ID.',
                toolLink: '/tools/compress-pdf',
                specs: { sizeLimit: '500KB', format: 'PDF' }
            },
            {
                name: 'Address Proof',
                description: 'Latest Utility Bill or Bank Statement.',
                toolLink: '/tools/compress-pdf',
                specs: { sizeLimit: '500KB', format: 'PDF' }
            }
        ]
    },
    {
        id: 'upsc-civil',
        slug: 'upsc-civil-services',
        name: {
            en: 'UPSC Civil Services Exam',
            hi: 'UPSC सिविल सेवा परीक्षा'
        },
        category: 'exams',
        description: {
            en: 'Document requirements for UPSC CSE Prelims/Mains application.',
            hi: 'UPSC CSE प्रीलिम्स/मेंस आवेदन के लिए दस्तावेज़ आवश्यकताएं।'
        },
        officialLink: 'https://upsconline.nic.in/',
        documents: [
            {
                name: 'Photograph',
                description: 'Latest color photo with name and date printed.',
                toolLink: '/tools/resize-upsc-photo',
                specs: { sizeLimit: '300KB', dimensions: '350px x 350px', format: 'JPG' }
            },
            {
                name: 'Signature',
                description: 'Signature on white paper with black ink.',
                toolLink: '/tools/resize-upsc-signature',
                specs: { sizeLimit: '300KB', dimensions: '350px x 350px', format: 'JPG' }
            },
            {
                name: 'ID Card PDF',
                description: 'Aadhaar/Voter/PAN in a single PDF file.',
                toolLink: '/tools/compress-pdf',
                specs: { sizeLimit: '300KB', format: 'PDF' }
            }
        ]
    },
    {
        id: 'ssc-cgl',
        slug: 'ssc-cgl-exam',
        name: {
            en: 'SSC CGL Examination',
            hi: 'SSC CGL परीक्षा'
        },
        category: 'exams',
        description: {
            en: 'Requirements for Staff Selection Commission CGL registration.',
            hi: 'कर्मचारी चयन आयोग CGL पंजीकरण के लिए आवश्यकताएं।'
        },
        officialLink: 'https://ssc.nic.in/',
        documents: [
            {
                name: 'Photograph',
                description: 'High quality color photo without spectacles/cap.',
                toolLink: '/tools/resize-ssc-photo',
                specs: { sizeLimit: '50KB', dimensions: '3.5cm x 4.5cm', format: 'JPEG' }
            },
            {
                name: 'Signature',
                description: 'Horizontal signature on white paper.',
                toolLink: '/tools/resize-ssc-signature',
                specs: { sizeLimit: '20KB', dimensions: '4.0cm x 2.0cm', format: 'JPEG' }
            }
        ]
    },
    {
        id: 'jee-main',
        slug: 'jee-main-exam',
        name: {
            en: 'JEE Main Examination',
            hi: 'JEE मेन परीक्षा'
        },
        category: 'exams',
        description: {
            en: 'NTA JEE Main application document checklist.',
            hi: 'NTA JEE मेन आवेदन दस्तावेज़ चेकलिस्ट।'
        },
        officialLink: 'https://jeemain.nta.nic.in/',
        documents: [
            {
                name: 'Passport Photo',
                description: 'Color or B/W with 80% face visible.',
                toolLink: '/tools/resize-jee-photo',
                specs: { sizeLimit: '200KB', format: 'JPG' }
            },
            {
                name: 'Signature',
                description: 'Signature in running hand.',
                toolLink: '/tools/resize-jee-signature',
                specs: { sizeLimit: '30KB', format: 'JPG' }
            },
            {
                name: 'Category Certificate',
                description: 'SC/ST/OBC/EWS certificate (if applicable).',
                toolLink: '/tools/compress-pdf',
                specs: { sizeLimit: '300KB', format: 'PDF' }
            }
        ]
    },
    {
        id: 'voter-id',
        slug: 'new-voter-id',
        name: {
            en: 'New Voter ID Registration',
            hi: 'नया मतदाता पहचान पत्र पंजीकरण'
        },
        category: 'identity',
        description: {
            en: 'National Voters\' Service Portal (NVSP) Form 6 requirements.',
            hi: 'राष्ट्रीय मतदाता सेवा पोर्टल (NVSP) फॉर्म 6 आवश्यकताएं।'
        },
        officialLink: 'https://www.nvsp.in/',
        documents: [
            {
                name: 'Passport Photo',
                description: 'Color photo with light background.',
                toolLink: '/tools/resize-passport-photo',
                specs: { sizeLimit: '2MB', format: 'JPG/JPEG' }
            },
            {
                name: 'Age Proof',
                description: 'Birth Certificate, Aadhaar, or 10th Certificate.',
                toolLink: '/tools/compress-pdf',
                specs: { sizeLimit: '2MB', format: 'JPG/PDF' }
            },
            {
                name: 'Address Proof',
                description: 'Water/Electricity/Gas bill or Bank Passbook.',
                toolLink: '/tools/compress-pdf',
                specs: { sizeLimit: '2MB', format: 'JPG/PDF' }
            }
        ]
    },
    {
        id: 'driving-license',
        slug: 'driving-license-apply',
        name: {
            en: 'Driving License (Learner/Permanent)',
            hi: 'ड्राइविंग लाइसेंस (लर्नर/स्थायी)'
        },
        category: 'identity',
        description: {
            en: 'Sarathi Parivahan portal link and document checklist.',
            hi: 'सारथी परिवहन पोर्टल लिंक और दस्तावेज़ चेकलिस्ट।'
        },
        officialLink: 'https://sarathi.parivahan.gov.in/',
        documents: [
            {
                name: 'Identity Proof',
                description: 'Aadhaar, Voter ID, or Passport.',
                toolLink: '/tools/compress-pdf',
                specs: { sizeLimit: '500KB', format: 'PDF' }
            },
            {
                name: 'Address Proof',
                description: 'Ration Card, Voter ID, or Life Insurance Policy.',
                toolLink: '/tools/compress-pdf',
                specs: { sizeLimit: '500KB', format: 'PDF' }
            },
            {
                name: 'Medical Certificate',
                description: 'Form 1-A signed by a registered doctor.',
                toolLink: '/tools/compress-pdf',
                specs: { sizeLimit: '500KB', format: 'PDF' }
            }
        ]
    },
    {
        id: 'neet-ug',
        slug: 'neet-ug-exam',
        name: { en: 'NEET UG Examination', hi: 'NEET UG परीक्षा' },
        category: 'exams',
        description: { en: 'NTA NEET UG document requirements.', hi: 'NTA NEET UG दस्तावेज़ चेकलिस्ट।' },
        officialLink: 'https://neet.nta.nic.in/',
        documents: [
            { name: 'Passport Photo', description: 'White background, 80% face coverage.', toolLink: '/tools/resize-passport-photo', specs: { sizeLimit: '200KB', format: 'JPG' } },
            { name: 'Postcard Photo', description: '4"x6" size color photograph.', toolLink: '/tools/resize-passport-photo', specs: { sizeLimit: '200KB', format: 'JPG' } },
            { name: 'Signature', description: 'Black ink on white paper.', toolLink: '/tools/resize-ssc-signature', specs: { sizeLimit: '30KB', format: 'JPG' } },
            { name: 'Left/Right Thumb Impression', description: 'Blue ink on white paper.', toolLink: '/tools/resize-ssc-signature', specs: { sizeLimit: '200KB', format: 'JPG' } }
        ]
    },
    {
        id: 'ibps-po',
        slug: 'ibps-po-exam',
        name: { en: 'IBPS PO/MT Exam', hi: 'IBPS PO/MT परीक्षा' },
        category: 'exams',
        description: { en: 'Checklist for Institute of Banking Personnel Selection.', hi: 'बैंकिंग कार्मिक चयन संस्थान (IBPS) चेकलिस्ट।' },
        officialLink: 'https://www.ibps.in/',
        documents: [
            { name: 'Photograph', description: 'Recent passport style color photo.', toolLink: '/tools/resize-ssc-photo', specs: { sizeLimit: '50KB', format: 'JPEG' } },
            { name: 'Signature', description: 'Not in CAPITAL letters.', toolLink: '/tools/resize-ssc-signature', specs: { sizeLimit: '20KB', format: 'JPEG' } },
            { name: 'Left Thumb Impression', description: 'On white paper with black/blue ink.', toolLink: '/tools/resize-ssc-signature', specs: { sizeLimit: '50KB', format: 'JPEG' } },
            { name: 'Handwritten Declaration', description: 'Standard text in English on white paper.', toolLink: '/tools/compress-pdf', specs: { sizeLimit: '100KB', format: 'JPEG' } }
        ]
    },
    {
        id: 'nda-exam',
        slug: 'nda-exam-upsc',
        name: { en: 'NDA & NA Examination', hi: 'NDA और NA परीक्षा' },
        category: 'exams',
        description: { en: 'UPSC NDA entry document requirements.', hi: 'UPSC NDA प्रवेश दस्तावेज़ आवश्यकताएं।' },
        officialLink: 'https://upsconline.nic.in/',
        documents: [
            { name: 'Photograph', description: 'Clear color photo (3.5cm x 4.5cm).', toolLink: '/tools/resize-upsc-photo', specs: { sizeLimit: '300KB', format: 'JPG' } },
            { name: 'Signature', description: 'Black/Blue ink on white paper.', toolLink: '/tools/resize-upsc-signature', specs: { sizeLimit: '300KB', format: 'JPG' } }
        ]
    },
    {
        id: 'agniveer-army',
        slug: 'agniveer-indian-army',
        name: { en: 'Agniveer Recruitment (Army)', hi: 'अग्निवीर भर्ती (सेना)' },
        category: 'exams',
        description: { en: 'Agnipath scheme document checklist.', hi: 'अग्निपथ योजना दस्तावेज़ चेकलिस्ट।' },
        officialLink: 'https://joinindianarmy.nic.in/',
        documents: [
            { name: 'Photograph', description: 'Clean shaven, without cap/goggles.', toolLink: '/tools/resize-ssc-photo', specs: { sizeLimit: '20KB', format: 'JPG' } },
            { name: 'Education Docs', description: '10th/12th Marksheets merged.', toolLink: '/tools/compress-pdf', specs: { sizeLimit: '200KB', format: 'PDF' } },
            { name: 'Domicile Cert', description: 'Issued by SDM/Tehsildar.', toolLink: '/tools/compress-pdf' }
        ]
    },
    {
        id: 'gst-reg',
        slug: 'gst-registration',
        name: { en: 'GST Registration', hi: 'GST पंजीकरण' },
        category: 'banking',
        description: { en: 'Documents to register for GST in India.', hi: 'भारत में GST पंजीकरण के लिए दस्तावेज़।' },
        officialLink: 'https://www.gst.gov.in/',
        documents: [
            { name: 'Proprietor Photo', description: 'Recent color photo of owner.', toolLink: '/tools/resize-passport-photo', specs: { sizeLimit: '100KB', format: 'JPEG' } },
            { name: 'Business Address Proof', description: 'Electricity bill or Rent agreement.', toolLink: '/tools/compress-pdf', specs: { sizeLimit: '1MB', format: 'PDF/JPG' } },
            { name: 'Bank Statement', description: 'First page showing account details.', toolLink: '/tools/compress-pdf', specs: { sizeLimit: '1MB', format: 'PDF' } }
        ]
    },
    {
        id: 'msme-udyam',
        slug: 'msme-udyam-reg',
        name: { en: 'MSME Udyam Registration', hi: 'MSME उद्यम पंजीकरण' },
        category: 'banking',
        description: { en: 'Udyam registration for small businesses.', hi: 'छोटे व्यवसायों के लिए उद्यम पंजीकरण।' },
        officialLink: 'https://udyamregistration.gov.in/',
        documents: [
            { name: 'Aadhaar Card', description: 'Proprietor/Partner Aadhaar.', toolLink: '/tools/mask-aadhaar' },
            { name: 'PAN Card', description: 'Business or Individual PAN.', toolLink: '/tools/compress-pdf' }
        ]
    },
    {
        id: 'pm-kisan',
        slug: 'pm-kisan-registration',
        name: { en: 'PM Kisan Registration', hi: 'PM किसान पंजीकरण' },
        category: 'identity',
        description: { en: 'Farmer benefit scheme document list.', hi: 'किसान लाभ योजना दस्तावेज़ सूची।' },
        officialLink: 'https://pmkisan.gov.in/',
        documents: [
            { name: 'Aadhaar Card', description: 'Link with mobile number.', toolLink: '/tools/mask-aadhaar' },
            { name: 'Land Records', description: 'Jamabandi/Fard/7-12 उतारा.', toolLink: '/tools/compress-pdf' },
            { name: 'Bank Passbook', description: 'Showing IFSC and Account No.', toolLink: '/tools/compress-pdf' }
        ]
    },
    {
        id: 'ayushman-bharat',
        slug: 'ayushman-bharat-card',
        name: { en: 'Ayushman Bharat Card', hi: 'आयुष्मान भारत कार्ड' },
        category: 'identity',
        description: { en: 'PMJAY Health card document requirements.', hi: 'PMJAY हेल्थ कार्ड दस्तावेज़ आवश्यकताएं।' },
        officialLink: 'https://setu.pmjay.gov.in/',
        documents: [
            { name: 'Ration Card', description: 'For family verification.', toolLink: '/tools/compress-pdf' },
            { name: 'Aadhaar Card', description: 'Identity verification.', toolLink: '/tools/mask-aadhaar' }
        ]
    },
    {
        id: 'birth-cert',
        slug: 'new-birth-certificate',
        name: { en: 'Birth Certificate Apply', hi: 'जन्म प्रमाण पत्र आवेदन' },
        category: 'identity',
        description: { en: 'Process to apply for fresh/late birth certificate.', hi: 'नए/देरी से जन्म प्रमाण पत्र के लिए आवेदन।' },
        officialLink: 'https://crsorgi.gov.in/',
        documents: [
            { name: 'Hospital Report', description: 'Discharge summary/report.', toolLink: '/tools/compress-pdf' },
            { name: 'Parents ID', description: 'Aadhaar of both parents.', toolLink: '/tools/compress-pdf' }
        ]
    },
    {
        id: 'caste-cert',
        slug: 'caste-certificate-sc-st-obc',
        name: { en: 'Caste Certificate (SC/ST/OBC)', hi: 'जाति प्रमाण पत्र (SC/ST/OBC)' },
        category: 'identity',
        description: { en: 'Required for reservation and education benefits.', hi: 'आरक्षण और शिक्षा लाभ के लिए आवश्यक।' },
        officialLink: 'https://serviceonline.gov.in/',
        documents: [
            { name: 'Father\'s Caste Proof', description: '1950/Other proof of descent.', toolLink: '/tools/compress-pdf' },
            { name: 'Affidavit', description: 'Self-declaration of caste.', toolLink: '/tools/compress-pdf' },
            { name: 'Residence Proof', description: 'Voter ID or Domicile.', toolLink: '/tools/compress-pdf' }
        ]
    },
    {
        id: 'marriage-cert',
        slug: 'marriage-registration-legal',
        name: { en: 'Marriage Registration', hi: 'विवाह पंजीकरण' },
        category: 'identity',
        description: { en: 'Legal registration for Hindu/Special Marriage Act.', hi: 'हिंदू/विशेष विवाह अधिनियम के लिए पंजीकरण।' },
        officialLink: 'https://serviceonline.gov.in/',
        documents: [
            { name: 'Wedding Card', description: 'Invitation or Pandit certificate.', toolLink: '/tools/compress-pdf' },
            { name: 'Couple Photo', description: 'Joint photo of husband and wife.', toolLink: '/tools/resize-passport-photo', specs: { sizeLimit: '2MB' } },
            { name: 'Age Proof (Both)', description: 'Birth Cert or 10th Certificate.', toolLink: '/tools/compress-pdf' }
        ]
    },
    {
        id: 'domicile-cert',
        slug: 'residence-domicile-cert',
        name: { en: 'Domicile Certificate', hi: 'निवास प्रमाण पत्र' },
        category: 'identity',
        description: { en: 'Proof of residence for jobs and scholarships.', hi: 'नौकरी और छात्रवृत्ति के लिए निवास का प्रमाण।' },
        officialLink: 'https://serviceonline.gov.in/',
        documents: [
            { name: 'Ration Card/Voter ID', description: 'As address proof.', toolLink: '/tools/compress-pdf' },
            { name: 'Aadhaar Card', description: 'Identity proof.', toolLink: '/tools/mask-aadhaar' }
        ]
    },
    {
        id: 'cuet-ug',
        slug: 'cuet-ug-admission',
        name: { en: 'CUET UG Admission', hi: 'CUET UG प्रवेश' },
        category: 'exams',
        description: { en: 'Common University Entrance Test requirements.', hi: 'कॉमन यूनिवर्सिटी एंट्रेंस टेस्ट आवश्यकताएं।' },
        officialLink: 'https://cuet.samarth.ac.in/',
        documents: [
            { name: 'Photograph', description: 'White background, recently clicked.', toolLink: '/tools/resize-ssc-photo', specs: { sizeLimit: '200KB' } },
            { name: 'Signature', description: 'Running hand, blue ink.', toolLink: '/tools/resize-ssc-signature', specs: { sizeLimit: '30KB' } }
        ]
    },
    {
        id: 'gate-exam-grad',
        slug: 'gate-exam-engineering',
        name: { en: 'GATE Examination', hi: 'GATE परीक्षा' },
        category: 'exams',
        description: { en: 'Graduate Aptitude Test in Engineering.', hi: 'इंजीनियरिंग में ग्रेजुएट एप्टीट्यूड टेस्ट।' },
        officialLink: 'https://gate.iitk.ac.in/',
        documents: [
            { name: 'Photograph', description: 'Standard high-res color photo.', toolLink: '/tools/resize-ssc-photo', specs: { sizeLimit: '50KB' } },
            { name: 'Signature', description: 'Horizontal, black ink.', toolLink: '/tools/resize-ssc-signature', specs: { sizeLimit: '20KB' } },
            { name: 'Category Cert', description: 'OBC/SC/ST/EWS PDF.', toolLink: '/tools/compress-pdf', specs: { sizeLimit: '300KB' } }
        ]
    },
    {
        id: 'ration-card-new',
        slug: 'new-ration-card-apply',
        name: { en: 'Apply for Ration Card', hi: 'राशन कार्ड के लिए आवेदन' },
        category: 'identity',
        description: { en: 'Documents for NFSA/State Ration Card registration.', hi: 'NFSA/राज्य राशन कार्ड पंजीकरण के लिए दस्तावेज़।' },
        officialLink: 'https://nfsa.gov.in/',
        documents: [
            { name: 'Family Group Photo', description: 'Photo of clearly visible family members.', toolLink: '/tools/compress-pdf', specs: { sizeLimit: '200KB' } },
            { name: 'Aadhaar of Head', description: 'Aadhaar of the eldest female member.', toolLink: '/tools/mask-aadhaar' },
            { name: 'Bank Passbook', description: 'First page showing account details.', toolLink: '/tools/compress-pdf' }
        ]
    },
    {
        id: 'ews-cert',
        slug: 'ews-certificate-apply',
        name: { en: 'EWS Certificate', hi: 'EWS प्रमाण पत्र' },
        category: 'identity',
        description: { en: 'Economically Weaker Section certificate requirements.', hi: 'आर्थिक रूप से कमजोर वर्ग (EWS) प्रमाण पत्र की आवश्यकताएं।' },
        officialLink: 'https://serviceonline.gov.in/',
        documents: [
            { name: 'Income Certificate', description: 'Issued by Tehsildar/Revenue officer.', toolLink: '/tools/compress-pdf' },
            { name: 'Property Proof', description: 'Land/Asset details (merged PDF).', toolLink: '/tools/compress-pdf' }
        ]
    },
    {
        id: 'income-cert',
        slug: 'income-certificate-service',
        name: { en: 'Income Certificate', hi: 'आय प्रमाण पत्र' },
        category: 'identity',
        description: { en: 'Requirement for scholarships and government schemes.', hi: 'छात्रवृत्ति और सरकारी योजनाओं के लिए आवश्यक।' },
        officialLink: 'https://serviceonline.gov.in/',
        documents: [
            { name: 'Salary Slip/ITR', description: 'Income proof for evaluation.', toolLink: '/tools/compress-pdf' },
            { name: 'Voter ID/Aadhaar', description: 'Identification as local resident.', toolLink: '/tools/compress-pdf' }
        ]
    },
    {
        id: 'character-cert',
        slug: 'police-character-verification',
        name: { en: 'Character Certificate (Police)', hi: 'चरित्र प्रमाण पत्र (पुलिस)' },
        category: 'identity',
        description: { en: 'Police verification for jobs and passport.', hi: 'नौकरी और पासपोर्ट के लिए पुलिस सत्यापन।' },
        officialLink: 'https://serviceonline.gov.in/',
        documents: [
            { name: 'Passport Photo', description: 'Recent professional photo.', toolLink: '/tools/resize-passport-photo' },
            { name: 'Address Proof', description: 'Document showing residence for 6+ months.', toolLink: '/tools/compress-pdf' }
        ]
    },
    {
        id: 'pan-aadhaar-link',
        slug: 'link-pan-with-aadhaar',
        name: { en: 'Link PAN with Aadhaar', hi: 'पैन को आधार से लिंक करें' },
        category: 'banking',
        description: { en: 'Mandatory linking for tax compliance and ITR.', hi: 'टैक्स अनुपालन और ITR के लिए अनिवार्य लिंकिंग।' },
        officialLink: 'https://www.incometax.gov.in/iec/foportal/',
        documents: [
            { name: 'Aadhaar Card Copy', description: 'Showing name matching exactly with PAN.', toolLink: '/tools/mask-aadhaar' },
            { name: 'PAN Card Copy', description: 'Showing clear PAN number.', toolLink: '/tools/compress-pdf' }
        ]
    }
]
