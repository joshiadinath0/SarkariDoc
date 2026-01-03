'use client'

import { Department, Service } from '@/types'
import { useState } from 'react'
import { useAccessibility } from '@/context/AccessibilityContext'
import { DepartmentIcons, DepartmentIconKey } from './DepartmentIcons'

interface DepartmentListProps {
    departments: Department[]
    onSelectService: (serviceId: string) => void
}

export default function DepartmentList({ departments, onSelectService }: DepartmentListProps) {
    const [selectedDept, setSelectedDept] = useState<string | null>(null)
    const { t, language } = useAccessibility()

    // Separate General Tools from other departments
    const generalTools = departments.find(d => d.id === 'general_tools')
    const serviceDepartments = departments.filter(d => d.id !== 'general_tools')

    return (
        <div className="space-y-12">
            {/* Quick Actions (General Tools) */}
            {generalTools && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                        {t('departments.quick_tools')}
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {generalTools.services.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => onSelectService(service.id)}
                                className="group flex flex-col items-center p-3 rounded-xl border border-gray-100 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-center"
                            >
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:bg-blue-100 group-hover:scale-110 transition-transform">
                                    {service.id === 'compress_pdf' ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    ) : service.id === 'self_attestation' ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    ) : service.id === 'signature_fixer' ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    ) : service.id === 'dpi_fixer' ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    ) : service.id === 'auto_crop' ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                    ) : service.id === 'pdf_unlocker' ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    ) : service.id === 'aadhaar_masker' ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.04m5.733 0A3.001 3.001 0 0012 15c.603 0 1.15-.177 1.607-.482m3.097-3.097a9.963 9.963 0 011.854 3.579M15 11.25a3 3 0 11-6 0 3 3 0 016 0zm-9.375 7.5a11.963 11.963 0 01-1.854-3.579m15 0a11.963 11.963 0 01-1.854 3.579M12 21a9.041 9.041 0 01-5.625-1.875m11.25 0a9.041 9.041 0 01-5.625 1.875M3 3l18 18" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-[13px] group-hover:text-blue-700 leading-tight">
                                        {language === 'hi' && service.name_hi ? service.name_hi : service.name}
                                    </h4>
                                    <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1 group-hover:text-gray-500">
                                        {language === 'hi' && service.description_hi ? service.description_hi : service.description}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Departments Grid */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                    {t('departments.gov_depts')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {serviceDepartments.map((dept) => (
                        <button
                            key={dept.id}
                            onClick={() => setSelectedDept(dept.id)}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center text-center space-y-3
                  ${selectedDept === dept.id
                                    ? 'border-blue-600 bg-blue-50 shadow-md'
                                    : 'border-white bg-white hover:border-blue-100 hover:shadow-lg shadow'
                                }`}
                        >
                            <div className="w-16 h-16 relative flex items-center justify-center">
                                {DepartmentIcons[dept.logo as DepartmentIconKey]}
                            </div>
                            <span className="font-semibold text-gray-800 text-sm leading-tight">
                                {language === 'hi' && dept.name_hi ? dept.name_hi : dept.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Services Grid for Selected Department */}
            {selectedDept && (
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 animate-slide-up">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <span className="mr-2">{t('departments.select_doc')}</span>
                        <span className="text-blue-600">
                            {(() => {
                                const dept = departments.find(d => d.id === selectedDept);
                                return language === 'hi' && dept?.name_hi ? dept.name_hi : dept?.name;
                            })()}
                        </span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {departments.find(d => d.id === selectedDept)?.services.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => onSelectService(service.id)}
                                className="group text-left p-5 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-700">
                                        {language === 'hi' && service.name_hi ? service.name_hi : service.name}
                                    </h4>
                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded group-hover:bg-blue-200 group-hover:text-blue-800">
                                        {t('departments.max_size')} {service.rules.maxSizeKB}KB
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 group-hover:text-gray-700 line-clamp-2">
                                    {language === 'hi' && service.description_hi ? service.description_hi : service.description}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
