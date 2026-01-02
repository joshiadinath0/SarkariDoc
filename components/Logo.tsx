import React from 'react'

export default function Logo({ className = "w-12 h-12" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer Shield/Seal Shape */}
            <circle cx="50" cy="50" r="45" stroke="#000080" strokeWidth="2" fill="white" />
            <circle cx="50" cy="50" r="40" stroke="#FF9933" strokeWidth="2" strokeDasharray="4 2" />

            {/* Inner Green Band */}
            <circle cx="50" cy="50" r="32" fill="#138808" fillOpacity="0.1" />

            {/* The "Review/Check" Mark implying Verification */}
            <path d="M30 50 L45 65 L70 35" stroke="#000080" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />

            {/* Decorative Text/Lines */}
            <path d="M25 75 Q50 85 75 75" stroke="#138808" strokeWidth="2" />
            <path d="M25 25 Q50 15 75 25" stroke="#FF9933" strokeWidth="2" />

            {/* Small Star/Emblem hints */}
            <circle cx="50" cy="20" r="3" fill="#000080" />
            <circle cx="50" cy="80" r="3" fill="#000080" />
        </svg>
    )
}
