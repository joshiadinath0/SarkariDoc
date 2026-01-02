'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '@/lib/translations'

type Language = 'en' | 'hi'

interface AccessibilityContextType {
    fontSize: number
    setFontSize: (size: number) => void
    language: Language
    setLanguage: (lang: Language) => void
    t: (path: string) => any
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({
    children,
    initialLanguage
}: {
    children: React.ReactNode,
    initialLanguage?: Language
}) {
    const [fontSize, setFontSizeState] = useState(1)
    const [language, setLanguage] = useState<Language>(initialLanguage || 'en')

    useEffect(() => {
        // Only load from localStorage if NO initialLanguage was provided (safeguard)
        // or to override the default 'en' if we are at root.
        const savedSize = localStorage.getItem('font-size')
        if (savedSize) {
            const size = parseFloat(savedSize)
            setFontSizeState(size)
            document.documentElement.style.setProperty('--font-scale', size.toString())
        }

        if (!initialLanguage) {
            const savedLang = localStorage.getItem('language') as Language
            if (savedLang) setLanguage(savedLang)
        }
    }, [initialLanguage])

    const setFontSize = (size: number) => {
        setFontSizeState(size)
        document.documentElement.style.setProperty('--font-scale', size.toString())
        localStorage.setItem('font-size', size.toString())
    }

    const changeLanguage = (lang: Language) => {
        setLanguage(lang)
        localStorage.setItem('language', lang)
        // Note: Actual URL redirect is handled by components like TopBar 
        // using the path, as this context doesn't have easy access to router here 
        // without being wrapped in more hooks.
    }

    // Simple translate function: t('hero.title')
    const t = (path: string) => {
        const keys = path.split('.')
        let current: any = translations[language]
        for (const key of keys) {
            if (!current || current[key] === undefined) return path
            current = current[key]
        }
        return current
    }

    return (
        <AccessibilityContext.Provider value={{ fontSize, setFontSize, language, setLanguage: changeLanguage, t }}>
            {children}
        </AccessibilityContext.Provider>
    )
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext)
    if (context === undefined) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider')
    }
    return context
}
