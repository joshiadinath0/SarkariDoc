'use client'

import React, { useState, useRef } from 'react'
import { useAccessibility } from '@/context/AccessibilityContext'

interface UploadBoxProps {
  file: File | null
  onFileSelect: (file: File) => void
  acceptedFormats?: string[]
}

export default function UploadBox({ file, files, onFileSelect, onFilesSelect, acceptedFormats, multiple = false }: {
  file?: File | null
  files?: File[]
  onFileSelect?: (file: File | null) => void
  onFilesSelect?: (files: File[]) => void
  acceptedFormats?: string[]
  multiple?: boolean
}) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useAccessibility()

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (multiple && onFilesSelect) {
      const droppedFiles = Array.from(e.dataTransfer.files)
      validateAndSetFiles(droppedFiles)
    } else {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        validateAndSetFile(droppedFile)
      }
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (multiple && onFilesSelect) {
      const selectedFiles = e.target.files ? Array.from(e.target.files) : []
      if (selectedFiles.length > 0) {
        validateAndSetFiles(selectedFiles)
      }
    } else {
      const selectedFile = e.target.files?.[0]
      if (selectedFile) {
        validateAndSetFile(selectedFile)
      }
    }
    // Reset input so same file can be selected again if needed
    e.target.value = ''
  }

  const validateAndSetFiles = (newFiles: File[]) => {
    const validFiles: File[] = []

    // Check limit (e.g. max 10 files)
    if (newFiles.length > 10) {
      alert("Maximum 10 files allowed at once")
      return
    }

    const maxSize = 10 * 1024 * 1024 // 10MB

    for (const f of newFiles) {
      if (f.size > maxSize) {
        alert(`${f.name}: ${t('upload.size_limit')}`)
        continue
      }

      if (acceptedFormats && acceptedFormats.length > 0) {
        const ext = '.' + f.name.split('.').pop()?.toLowerCase()
        if (!acceptedFormats.some(fmt => fmt.toLowerCase() === ext)) {
          alert(`${f.name}: ${t('upload.invalid_format')}`)
          continue
        }
      }
      validFiles.push(f)
    }

    if (validFiles.length > 0) {
      onFilesSelect?.(validFiles)
    }
  }

  const validateAndSetFile = (f: File) => {
    // Check file type
    if (acceptedFormats && acceptedFormats.length > 0) {
      const fileExtension = '.' + f.name.split('.').pop()?.toLowerCase()
      const isValidFormat = acceptedFormats.some(format =>
        format.toLowerCase() === fileExtension
      )

      if (!isValidFormat) {
        alert(`${t('upload.invalid_format')} ${acceptedFormats.join(', ')}`)
        return
      }
    }

    // Check file size (max 10MB for upload)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (f.size > maxSize) {
      alert(t('upload.size_limit'))
      return
    }

    onFileSelect?.(f)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const displayFiles = multiple && files ? files : (file ? [file] : [])

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
        transition-all duration-300 ease-in-out group
        ${isDragging
          ? 'border-blue-500 bg-blue-50/50 scale-[1.02] shadow-xl ring-4 ring-blue-100'
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 hover:shadow-md'
        }
        ${displayFiles.length > 0 ? 'border-green-400 bg-green-50/30' : ''}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileInput}
        accept={acceptedFormats?.join(',')}
        multiple={multiple}
      />

      {displayFiles.length > 0 ? (
        <div className="space-y-3">
          {displayFiles.map((f, i) => (
            <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100 animate-fade-in">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left min-w-0">
                  <p className="font-medium text-gray-900 truncate">{f.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(f.size)}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (multiple && onFilesSelect && files) {
                    const newFiles = files.filter((_, idx) => idx !== i)
                    onFilesSelect(newFiles)
                    if (newFiles.length === 0 && onFileSelect) onFileSelect(null)
                  } else {
                    onFileSelect?.(null)
                  }
                }}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {multiple && (
            <p className="text-xs text-blue-600 mt-2 font-medium">
              + Add more files
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-blue-50 group-hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors duration-200">
            <svg className="w-8 h-8 text-blue-400 group-hover:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-gray-900 font-semibold text-lg">
              {t('upload.drag_drop')}
            </p>
            <p className="text-gray-500 text-sm mt-1">{t('upload.or_click')}</p>
          </div>
          {acceptedFormats && acceptedFormats.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {acceptedFormats.map(fmt => (
                <span key={fmt} className="text-[10px] uppercase font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                  {fmt.replace('.', '')}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

