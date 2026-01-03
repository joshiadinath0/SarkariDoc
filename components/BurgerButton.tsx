'use client'

import React from 'react'

interface BurgerButtonProps {
    isOpen: boolean
    onClick: () => void
    className?: string
}

export default function BurgerButton({ isOpen, onClick, className = '' }: BurgerButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`relative z-[110] w-10 h-10 flex flex-col justify-center items-center group ${className}`}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
            <div
                className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ease-in-out ${isOpen ? 'rotate-45 translate-y-2' : ''
                    }`}
            />
            <div
                className={`w-6 h-0.5 bg-gray-600 my-1.5 transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'
                    }`}
            />
            <div
                className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ease-in-out ${isOpen ? '-rotate-45 -translate-y-2' : ''
                    }`}
            />
        </button>
    )
}
