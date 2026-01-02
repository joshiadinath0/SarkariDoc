import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SarkariDoc – Resize, Compress & Fix PDF/Images for Govt Portals',
  description: 'Free online tool to resize, compress, and fix documents for Indian government portals (Income Tax, UIDAI, Passport Seva, SBI, UPSC). Convert to PDF, clean scanning shadows, and ensure 100% upload compliance.',
  // ... rest of metadata stays here or can be duplicated/dynamic
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
  return children
}

