'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useAccessibility } from '@/context/AccessibilityContext'

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { lang } = useParams()
    const { t } = useAccessibility()

    // Prevent scrolling when sidebar is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    return (
        <div className="relative">
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 z-[90] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Sidebar Drawer */}
            <aside
                className={`fixed top-0 left-0 h-full w-[280px] md:w-[320px] bg-white z-[100] shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Branding Header - Aligned with main design */}
                <div className="border-b">
                    <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center">
                        {/* Spacer for the Burger Button which is z-[110] and stays on top */}
                        <div className="w-10 h-10 mr-2 md:mr-4 flex-shrink-0" />
                        <Image
                            src="/images/official-logo.png"
                            alt="SarkariDoc"
                            width={160}
                            height={56}
                            className="h-12 md:h-14 w-auto object-contain"
                            priority
                        />
                    </div>
                    <div className="h-1 md:h-1.5 w-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#FF9933_36.5%,#e0e0e0,#138808_63.5%)]"></div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100%-160px)]">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-2">
                        Main Menu
                    </div>

                    <Link
                        href={`/${lang}`}
                        onClick={onClose}
                        className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 transition-colors text-gray-700 font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span>{t('common.home')}</span>
                    </Link>

                    <Link
                        href={`/${lang}/guides`}
                        onClick={onClose}
                        className="flex items-center space-x-3 p-3 rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-sm"
                    >
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span>Master Document Guide</span>
                    </Link>

                    <div className="pt-4 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4">
                        Popular Tools
                    </div>

                    {[
                        { name: 'PAN Photo Resizer', href: '/tools/resize-pan-card-photo' },
                        { name: 'Aadhaar Masker', href: '/tools/mask-aadhaar' },
                        { name: 'PDF Compressor', href: '/tools/compress-pdf' },
                        { name: 'Signature Darkener', href: '/tools/darken-signature' },
                    ].map((tool) => (
                        <Link
                            key={tool.href}
                            href={`/${lang}${tool.href}`}
                            onClick={onClose}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 font-medium group"
                        >
                            <span>{tool.name}</span>
                            <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    ))}
                </nav>

                {/* Footer info */}
                <div className="absolute bottom-0 left-0 w-full p-6 border-t bg-gray-50">
                    <p className="text-[10px] text-gray-500 text-center font-medium">SarkariDoc v2.0 • 100% Secure</p>
                </div>
            </aside>
        </div>
    )
}
