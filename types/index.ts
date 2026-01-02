export type DocumentPurpose = string // Flexible string ID for services

export interface DocumentRule {
  maxSizeKB: number
  minDPI: number
  backgroundColor?: string
  orientation: 'portrait' | 'landscape' | 'any'
  aspectRatio?: { width: number; height: number } // in mm
  allowedFormats: string[]
  requireSignature?: boolean
  removeShadows: boolean
  faceDetection?: boolean
}

export interface Service {
  id: string
  name: string
  name_hi?: string
  description: string
  description_hi?: string
  rules: DocumentRule
}

export interface Department {
  id: string
  name: string
  name_hi?: string
  logo: string // URL or icon component name
  color: string
  services: Service[]
}

// Legacy support (alias for backward compatibility during refactor)
export type DocumentPreset = DocumentRule

export interface ValidationResult {
  passed: boolean
  checks: ValidationCheck[]
  suggestions: string[]
}

export interface ValidationCheck {
  name: string
  passed: boolean
  message: string
  severity: 'error' | 'warning' | 'info'
}

export interface ProcessingStatus {
  step: string
  progress: number
  message: string
  error?: string
}

