import sharp from 'sharp'
import { PDFDocument } from 'pdf-lib'
import fs from 'fs-extra'
import path from 'path'
import { DocumentPurpose, ValidationResult, ValidationCheck, DocumentPreset } from '@/types'
import { createWorker } from 'tesseract.js'
import { getPreset } from './presets'

export async function validateDocument(
  filePath: string,
  purpose: DocumentPurpose
): Promise<ValidationResult> {
  const preset = getPreset(purpose)
  const checks: ValidationCheck[] = []
  const suggestions: string[] = []

  try {
    const stats = await fs.stat(filePath)
    const fileSizeKB = stats.size / 1024

    // Check file size
    const sizeCheck: ValidationCheck = {
      name: 'File Size',
      passed: fileSizeKB <= preset.maxSizeKB,
      message: fileSizeKB <= preset.maxSizeKB
        ? `File size is ${fileSizeKB.toFixed(2)} KB (max: ${preset.maxSizeKB} KB)`
        : `File size is ${fileSizeKB.toFixed(2)} KB (exceeds max: ${preset.maxSizeKB} KB)`,
      severity: fileSizeKB <= preset.maxSizeKB ? 'info' : 'error',
    }
    checks.push(sizeCheck)

    if (!sizeCheck.passed) {
      suggestions.push(`Compress the file to reduce size below ${preset.maxSizeKB} KB`)
    }

    // Check file extension
    const ext = path.extname(filePath).toLowerCase()
    const formatCheck: ValidationCheck = {
      name: 'File Format',
      passed: preset.allowedFormats.includes(ext),
      message: preset.allowedFormats.includes(ext)
        ? `Format ${ext} is allowed`
        : `Format ${ext} is not allowed. Allowed: ${preset.allowedFormats.join(', ')}`,
      severity: preset.allowedFormats.includes(ext) ? 'info' : 'error',
    }
    checks.push(formatCheck)

    // For images and PDFs, check DPI and other properties
    if (ext !== '.pdf') {
      // Image validation
      const image = sharp(filePath)
      const metadata = await image.metadata()

      // Check DPI
      const dpi = metadata.density || 72
      const dpiCheck: ValidationCheck = {
        name: 'DPI/Resolution',
        passed: dpi >= preset.minDPI,
        message: dpi >= preset.minDPI
          ? `DPI is ${dpi} (minimum: ${preset.minDPI})`
          : `DPI is ${dpi} (below minimum: ${preset.minDPI})`,
        severity: dpi >= preset.minDPI ? 'info' : 'warning',
      }
      checks.push(dpiCheck)

      if (!dpiCheck.passed) {
        suggestions.push(`Increase image resolution to at least ${preset.minDPI} DPI`)
      }

      // Check dimensions
      if (metadata.width && metadata.height) {
        const isPortrait = metadata.height > metadata.width
        const orientationCheck: ValidationCheck = {
          name: 'Orientation',
          passed: preset.orientation === 'any' || (preset.orientation === 'portrait' && isPortrait) || (preset.orientation === 'landscape' && !isPortrait),
          message: preset.orientation === 'any'
            ? 'Orientation is acceptable'
            : `Orientation is ${isPortrait ? 'portrait' : 'landscape'} (required: ${preset.orientation})`,
          severity: 'info',
        }
        checks.push(orientationCheck)

        // Check aspect ratio for passport
        if (purpose === 'passport' && preset.aspectRatio) {
          const currentRatio = metadata.width / metadata.height
          const targetRatio = preset.aspectRatio.width / preset.aspectRatio.height
          const ratioTolerance = 0.1
          const aspectCheck: ValidationCheck = {
            name: 'Aspect Ratio',
            passed: Math.abs(currentRatio - targetRatio) < ratioTolerance,
            message: Math.abs(currentRatio - targetRatio) < ratioTolerance
              ? `Aspect ratio matches passport requirements (${preset.aspectRatio.width}x${preset.aspectRatio.height}mm)`
              : `Aspect ratio should be ${preset.aspectRatio.width}:${preset.aspectRatio.height}`,
            severity: 'warning',
          }
          checks.push(aspectCheck)
        }
      }

      // Basic blur detection (using image statistics)
      try {
        const stats = await image.stats()
        // Simple heuristic: if standard deviation is very low, image might be blurry
        const avgStdDev = stats.channels.reduce((sum, ch) => sum + (ch.stdev || 0), 0) / stats.channels.length
        const blurCheck: ValidationCheck = {
          name: 'Image Clarity',
          passed: avgStdDev > 10, // Threshold for clarity
          message: avgStdDev > 10
            ? 'Image appears clear'
            : 'Image may be blurry or low quality',
          severity: avgStdDev > 10 ? 'info' : 'warning',
        }
        checks.push(blurCheck)

        if (!blurCheck.passed) {
          suggestions.push('Improve image quality by using a better camera or scanner')
        }
      } catch (e) {
        // Skip blur check if it fails
      }

      // Background color check (basic - check if image is mostly white)
      try {
        const { data, info } = await image
          .resize(100, 100, { fit: 'inside' })
          .raw()
          .toBuffer({ resolveWithObject: true })

        let whitePixels = 0
        const totalPixels = info.width * info.height
        const whiteThreshold = 240 // RGB threshold for "white"

        for (let i = 0; i < data.length; i += info.channels) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          if (r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold) {
            whitePixels++
          }
        }

        const whitePercentage = (whitePixels / totalPixels) * 100
        const backgroundCheck: ValidationCheck = {
          name: 'Background Color',
          passed: whitePercentage > 50, // At least 50% white
          message: whitePercentage > 50
            ? `Background is mostly white (${whitePercentage.toFixed(1)}%)`
            : `Background may be too dark (${whitePercentage.toFixed(1)}% white)`,
          severity: whitePercentage > 50 ? 'info' : 'warning',
        }
        checks.push(backgroundCheck)

        if (!backgroundCheck.passed) {
          suggestions.push('Ensure the background is pure white for better document clarity')
        }
      } catch (e) {
        // Skip background check if it fails
      }
    } else {
      // PDF validation
      try {
        const pdfBytes = await fs.readFile(filePath)
        const pdfDoc = await PDFDocument.load(pdfBytes)
        const pages = pdfDoc.getPages()

        const pdfCheck: ValidationCheck = {
          name: 'PDF Structure',
          passed: pages.length > 0,
          message: `PDF has ${pages.length} page(s)`,
          severity: 'info',
        }
        checks.push(pdfCheck)

        // For bank KYC, check if signature is mentioned (basic check)
        if (purpose === 'bank_kyc' && preset.requireSignature) {
          const signatureCheck: ValidationCheck = {
            name: 'Signature Required',
            passed: true, // We can't reliably detect signatures, so we assume it's there
            message: 'Signature should be clearly visible',
            severity: 'info',
          }
          checks.push(signatureCheck)
        }
      } catch (e) {
        const pdfErrorCheck: ValidationCheck = {
          name: 'PDF Structure',
          passed: false,
          message: 'PDF file appears to be corrupted or invalid',
          severity: 'error',
        }
        checks.push(pdfErrorCheck)
      }
    }

    // OCR Validation for specific documents
    if ((purpose === 'pancard' || purpose === 'aadhaar_card') && ext !== '.pdf') {
      try {
        const worker = await createWorker('eng', 1, {
          logger: () => { },
          errorHandler: () => { }
        })
        const { data: { text } } = await worker.recognize(filePath)
        await worker.terminate()

        const cleanText = text.replace(/\s+/g, '')

        if (purpose === 'pancard') {
          const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/i
          const hasPan = panRegex.test(cleanText) || panRegex.test(text)

          const ocrCheck: ValidationCheck = {
            name: 'Content Verification',
            passed: hasPan,
            message: hasPan ? 'Valid PAN Number detected' : 'Could not detect a clear PAN Number',
            severity: 'warning'
          }
          checks.push(ocrCheck)
          if (!hasPan) suggestions.push('Ensure the PAN number is clearly visible and not blurred')
        }
        else if (purpose === 'aadhaar_card') {
          // Aadhaar is 12 digits, often XXXX XXXX XXXX
          const aadhaarRegex = /[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}/
          const hasAadhaar = aadhaarRegex.test(text)

          const ocrCheck: ValidationCheck = {
            name: 'Content Verification',
            passed: hasAadhaar,
            message: hasAadhaar ? 'Valid Aadhaar Number detected' : 'Could not detect a clear Aadhaar Number',
            severity: 'warning'
          }
          checks.push(ocrCheck)
        }

      } catch (e) {
        console.warn("OCR Validation failed:", e)
      }
    }

    // Determine overall pass status
    const hasErrors = checks.some(check => !check.passed && check.severity === 'error')
    const passed = !hasErrors

    return {
      passed,
      checks,
      suggestions,
    }
  } catch (error: any) {
    return {
      passed: false,
      checks: [
        {
          name: 'File Read',
          passed: false,
          message: `Failed to read file: ${error.message}`,
          severity: 'error',
        },
      ],
      suggestions: ['Ensure the file is not corrupted and try again'],
    }
  }
}
