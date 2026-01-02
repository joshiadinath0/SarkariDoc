import React from 'react'

export default function TopBar() {
    return (
        <div className="bg-[#1b1b1b] text-white text-[10px] md:text-xs py-1.5 px-4 font-sans border-b border-gray-700">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex space-x-4">
                    <span className="hover:underline cursor-pointer">Government of India</span>
                    <span className="hidden sm:inline text-gray-400">|</span>
                    <span className="hidden sm:inline hover:underline cursor-pointer">Ministry of Electronics & IT</span>
                </div>
                <div className="flex space-x-3 md:space-x-6">
                    <button className="hover:underline">Skip to Main Content</button>
                    <button className="hover:underline">Screen Reader Access</button>
                    <div className="flex items-center space-x-2 border-l border-gray-600 pl-3">
                        <span className="cursor-pointer font-bold">A+</span>
                        <span className="cursor-pointer">A</span>
                        <span className="cursor-pointer text-xs">A-</span>
                    </div>
                    <div className="flex items-center space-x-2 border-l border-gray-600 pl-3">
                        <button className="bg-white text-black px-1.5 rounded-[2px] font-bold">English</button>
                        <button className="hover:underline text-gray-300">हिन्दी</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
