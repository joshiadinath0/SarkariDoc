import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SarkariDoc',
  description: 'Document resizing and fixing for Indian government portals.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

