'use client'

import React from 'react'

export default function Ticker() {
    return (
        <div className="bg-blue-600 border-y border-blue-700 overflow-hidden py-1.5 md:py-2">
            <div className="flex whitespace-nowrap animate-ticker hover:[animation-play-state:paused] w-fit">
                <div className="flex items-center space-x-8 px-4">
                    <span className="text-white text-xs md:text-sm font-bold flex items-center">
                        <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-[10px] uppercase font-black mr-2">NEW</span>
                        Click on top-left "Master Document Guide" for complete Indian Govt Service checklists! 🦁 🇮🇳
                    </span>
                    <span className="text-blue-100 text-xs md:text-sm font-medium">
                        • 28+ High-Traffic Services added including UPSC, NEET, GST, and Ration Card!
                    </span>
                    <span className="text-white text-xs md:text-sm font-bold">
                        • Resize, Compress, and Fix documents automatically with SarkariDoc!
                    </span>
                </div>

                {/* Duplicate for seamless loop */}
                <div className="flex items-center space-x-8 px-4">
                    <span className="text-white text-xs md:text-sm font-bold flex items-center">
                        <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-[10px] uppercase font-black mr-2">NEW</span>
                        Click on top-left "Master Document Guide" for complete Indian Govt Service checklists! 🦁 🇮🇳
                    </span>
                    <span className="text-blue-100 text-xs md:text-sm font-medium">
                        • 28+ High-Traffic Services added including UPSC, NEET, GST, and Ration Card!
                    </span>
                    <span className="text-white text-xs md:text-sm font-bold">
                        • Resize, Compress, and Fix documents automatically with SarkariDoc!
                    </span>
                </div>
            </div>
        </div>
    )
}
