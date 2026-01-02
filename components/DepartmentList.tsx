'use client'

import { Department, Service } from '@/types'
import { useState } from 'react'

interface DepartmentListProps {
    departments: Department[]
    onSelectService: (serviceId: string) => void
}

export default function DepartmentList({ departments, onSelectService }: DepartmentListProps) {
    const [selectedDept, setSelectedDept] = useState<string | null>(null)

    // Separate General Tools from other departments
    const generalTools = departments.find(d => d.id === 'general_tools')
    const serviceDepartments = departments.filter(d => d.id !== 'general_tools')

    return (
        <div className="space-y-12">
            {/* Quick Actions (General Tools) */}
            {generalTools && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                        Quick Tools
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {generalTools.services.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => onSelectService(service.id)}
                                className="group flex items-center p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                            >
                                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-4 group-hover:bg-blue-200">
                                    {service.id === 'compress_pdf' ? (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="text-left">
                                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-700">
                                        {service.name}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        {service.description}
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
                    Government Departments
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
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={dept.logo}
                                    alt={dept.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <span className="font-semibold text-gray-800 text-sm leading-tight">{dept.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Services Grid for Selected Department */}
            {selectedDept && (
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 animate-slide-up">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <span className="mr-2">select Document for</span>
                        <span className="text-blue-600">{departments.find(d => d.id === selectedDept)?.name}</span>
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
                                        {service.name}
                                    </h4>
                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded group-hover:bg-blue-200 group-hover:text-blue-800">
                                        Max {service.rules.maxSizeKB}KB
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 group-hover:text-gray-700 line-clamp-2">
                                    {service.description}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
