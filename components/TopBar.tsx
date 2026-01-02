'use client'

import React from 'react'
import { useAccessibility } from '@/context/AccessibilityContext'
import { useRouter, usePathname } from 'next/navigation'

export default function TopBar() {
    const { setFontSize, fontSize, setLanguage, language, t } = useAccessibility()
    const router = useRouter()
    const pathname = usePathname()

    const handleSkip = () => {
        const main = document.getElementById('main-content')
        if (main) {
            main.tabIndex = -1
            main.focus()
            main.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const changeLanguage = (newLang: 'en' | 'hi') => {
        if (newLang === language) return

        setLanguage(newLang)

        // Redirect to the new language path
        const segments = pathname.split('/')
        segments[1] = newLang
        const newPath = segments.join('/')
        router.push(newPath)
    }

    return (
        <div className="bg-[#1b1b1b] text-white text-[10px] md:text-xs py-1.5 px-4 font-sans border-b border-gray-700">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex space-x-4">
                    <span className="cursor-default font-semibold">{t('topbar.utility_name')}</span>
                    <span className="hidden sm:inline text-gray-400">|</span>
                    <span className="hidden sm:inline cursor-default">{t('topbar.official_standard')}</span>
                </div>
                <div className="flex space-x-3 md:space-x-6">
                    <button onClick={handleSkip} className="hover:underline">{t('topbar.skip_link')}</button>
                    <button
                        onClick={() => alert('Accessibility menu: High contrast and screen reader optimization are active.')}
                        className="hover:underline"
                    >
                        {t('topbar.accessibility_access')}
                    </button>
                    <div className="flex items-center space-x-2 border-l border-gray-600 pl-3">
                        <span
                            onClick={() => setFontSize(Math.min(fontSize + 0.1, 1.3))}
                            className={`cursor-pointer font-bold hover:text-blue-400 ${fontSize > 1.1 ? 'text-blue-400' : ''}`}
                        >
                            A+
                        </span>
                        <span
                            onClick={() => setFontSize(1)}
                            className={`cursor-pointer hover:text-blue-400 ${fontSize === 1 ? 'text-blue-400' : ''}`}
                        >
                            A
                        </span>
                        <span
                            onClick={() => setFontSize(Math.max(fontSize - 0.1, 0.8))}
                            className={`cursor-pointer text-xs hover:text-blue-400 ${fontSize < 0.9 ? 'text-blue-400' : ''}`}
                        >
                            A-
                        </span>
                    </div>
                    <div className="flex items-center space-x-2 border-l border-gray-600 pl-3">
                        <button
                            onClick={() => changeLanguage('en')}
                            className={`${language === 'en' ? 'bg-white text-black' : 'hover:underline text-gray-300'} px-1.5 rounded-[2px] font-bold`}
                        >
                            English
                        </button>
                        <button
                            onClick={() => changeLanguage('hi')}
                            className={`${language === 'hi' ? 'bg-white text-black' : 'hover:underline text-gray-300'} px-1.5 rounded-[2px] font-bold`}
                        >
                            हिन्दी
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
