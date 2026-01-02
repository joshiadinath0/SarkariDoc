import { DocumentPurpose, DocumentPreset } from '@/types'
import { getService } from './departments'

// Backward compatibility: If no specific rule is found, return a safe default
const defaultPreset: DocumentPreset = {
  maxSizeKB: 500,
  minDPI: 200,
  orientation: 'any',
  allowedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
  removeShadows: true,
}

export function getPreset(purpose: DocumentPurpose): DocumentPreset {
  const service = getService(purpose)
  if (service) {
    return service.rules
  }

  // Fallback for any legacy keys if they exist, or default
  return defaultPreset
}

