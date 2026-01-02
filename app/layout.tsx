import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DocFix India – Resize, Compress & Fix PDF/Images for Govt Portals',
  description: 'Free online tool to resize, compress, and fix documents for Indian government portals (Income Tax, UIDAI, Passport Seva). Convert to PDF, clean scanning shadows, and ensure 100% upload compliance.',
  keywords: ['compress pdf', 'resize passport photo', 'pan card upload size', 'aadhaar update document size', 'remove shadows from document', 'indian government document format', 'image compressor', 'pdf reducer'],
  openGraph: {
    title: 'DocFix India – Fix Documents for Govt Portals',
    description: 'One-click document fixing for PAN, Aadhaar, Passport, and Bank KYC. Auto-resize, compress, and remove shadows.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'DocFix India',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DocFix India – Bank & Govt PDF Fixer',
    description: 'Fix your documents for Indian government portals in seconds.',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DocFix India',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    description: 'Free tool to resize, compress, and fix documents for Indian government portals like Income Tax, UIDAI, and Passport Seva.',
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  )
}

