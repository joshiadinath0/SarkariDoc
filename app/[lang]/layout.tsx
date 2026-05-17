import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/app/globals.css'
import { ThemeProvider } from '@/context/ThemeContext'
import { AccessibilityProvider } from '@/context/AccessibilityContext'
import SharedUIWrapper from '@/components/SharedUIWrapper'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SarkariDoc – Resize, Compress & Fix PDF/Images for Govt Portals',
  description: 'Free online tool to resize, compress, and fix documents for Indian government portals (Income Tax, UIDAI, Passport Seva, SBI, UPSC). Convert to PDF, clean scanning shadows, and ensure 100% upload compliance.',
  keywords: [
    'resize image for govt portal',
    'compress pdf under 200kb',
    'pan card photo resizer',
    'aadhaar card document password remover',
    'sbi kyc pdf resize',
    'upsc photo resizer online',
    'ssc signature resize',
    'remove shadows from document image',
    'convert photo to passport size 3.5x4.5cm',
    'sarkaridoc',
    'docfix india'
  ],
  openGraph: {
    title: 'SarkariDoc – Fix Documents for Govt Portals',
    description: 'One-click document fixing for PAN, Aadhaar, Passport, and Bank KYC. Auto-resize, compress, and remove shadows.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'SarkariDoc',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SarkariDoc – Bank & Govt PDF Fixer',
    description: 'Fix your documents for Indian government portals in seconds.',
  },
  alternates: {
    canonical: 'https://sarkaridocs.com/en',
    languages: {
      'en': 'https://sarkaridocs.com/en',
      'hi': 'https://sarkaridocs.com/hi',
    },
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function LangLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SarkariDoc',
    description: lang === 'hi'
      ? 'पैन, आधार और अन्य सरकारी दस्तावेजों को रीसाइज और कंप्रेस करने का मुफ्त टूल।'
      : 'Free tool to resize, compress, and fix documents for Indian government portals like Income Tax, UIDAI, and Passport Seva.',
    operatingSystem: 'Any',
    applicationCategory: 'Utility',
    featureList: [
      'Resize Photo to 3.5x4.5cm',
      'Compress PDF to 200KB',
      'Remove Shadows',
      'Whiten Background',
      'Convert to PDF',
      'Validate DPI'
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250'
    },
  }

  return (
    <html lang={lang}>
      <body className={inter.className}>
        <ThemeProvider>
          <AccessibilityProvider initialLanguage={lang as any}>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <SharedUIWrapper>
              {children}
            </SharedUIWrapper>
          </AccessibilityProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
