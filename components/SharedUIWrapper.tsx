'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import TopBar from '@/components/TopBar'
import Sidebar from '@/components/Sidebar'
import BurgerButton from '@/components/BurgerButton'
import Ticker from '@/components/Ticker'
import { useAccessibility } from '@/context/AccessibilityContext'

export default function SharedUIWrapper({ children }: { children: React.ReactNode }) {
    const { isSidebarOpen, setIsSidebarOpen, language } = useAccessibility()

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <TopBar />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <header className="bg-white shadow-sm sticky top-0 z-50">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3" aria-label="Main navigation">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 md:space-x-4">
                            <BurgerButton
                                isOpen={isSidebarOpen}
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="mr-2"
                            />
                            <Link href={`/${language || 'en'}`} className="block">
                                <Image
                                    src="/images/official-logo.png"
                                    alt="SarkariDoc"
                                    width={200}
                                    height={80}
                                    className="h-16 md:h-20 w-auto object-contain cursor-pointer select-none"
                                    priority
                                />
                            </Link>
                        </div>
                    </div>
                </nav>
                {/* Beautified Tricolor Gradient Line */}
                <div className="h-1 md:h-1.5 w-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#FF9933_36.5%,#e0e0e0,#138808_63.5%)]"></div>
                    <div className="absolute inset-0 shadow-[inset_0_-1px_0_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)]"></div>
                </div>
                {/* Announcement Ticker */}
                <Ticker />
            </header>

            {children}
        </div>
    )
}
