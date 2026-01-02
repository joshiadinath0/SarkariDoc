'use client'

import { useState, useRef, DragEvent } from 'react'

interface UploadBoxProps {
  file: File | null
  onFileSelect: (file: File) => void
  acceptedFormats?: string[]
}

export default function UploadBox({ file, onFileSelect, acceptedFormats }: UploadBoxProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      validateAndSetFile(droppedFile)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      validateAndSetFile(selectedFile)
    }
  }

  const validateAndSetFile = (file: File) => {
    // Check file type
    if (acceptedFormats && acceptedFormats.length > 0) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      const isValidFormat = acceptedFormats.some(format => 
        format.toLowerCase() === fileExtension
      )
      
      if (!isValidFormat) {
        alert(`Invalid file format. Accepted formats: ${acceptedFormats.join(', ')}`)
        return
      }
    }

    // Check file size (max 10MB for upload)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert('File size exceeds 10MB limit. Please choose a smaller file.')
      return
    }

    onFileSelect(file)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
        transition-all duration-200
        ${isDragging 
          ? 'border-blue-500 bg-blue-50 scale-105' 
          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }
        ${file ? 'border-green-400 bg-green-50' : ''}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileInput}
        accept={acceptedFormats?.join(',')}
      />

      {file ? (
        <div className="space-y-2">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-medium text-gray-900">{file.name}</p>
          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onFileSelect(null as any)
            }}
            className="text-sm text-red-600 hover:text-red-700 mt-2"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-gray-700 font-medium">
              Drag & drop your document here
            </p>
            <p className="text-gray-500 text-sm mt-1">or click to browse</p>
          </div>
          {acceptedFormats && acceptedFormats.length > 0 && (
            <p className="text-xs text-gray-400">
              Accepted: {acceptedFormats.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

