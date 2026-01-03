import sharp from 'sharp'
import { PDFDocument } from 'pdf-lib'
import fs from 'fs-extra'
import path from 'path'
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/build/pdf'
import { createWorker } from 'tesseract.js'
import { DocumentPurpose, DocumentPreset } from '@/types'
import { getPreset } from './presets'

// Dynamic import for canvas (server-only, native module)
let createCanvas: any = null
try {
  // Only import canvas on server-side (API routes)
  if (typeof window === 'undefined') {
    const canvasModule = require('canvas')
    createCanvas = canvasModule.createCanvas
  }
} catch (e) {
}



export interface ProcessingOptions {
  filePath: string
  outputPath: string
  purpose: DocumentPurpose
  maxSizeKB?: number
  password?: string
  dpi?: number
  darkenSignature?: boolean
  autoCrop?: boolean
  selfAttestSignaturePath?: string
  onProgress?: (step: string, progress: number, message: string) => void
}

export async function processDocument(options: ProcessingOptions): Promise<string> {
  const { filePath, outputPath, purpose, maxSizeKB, onProgress } = options
  const preset = getPreset(purpose)

  // Override preset size if custom size is provided
  if (maxSizeKB) {
    preset.maxSizeKB = maxSizeKB
  }

  const reportProgress = (step: string, progress: number, message: string) => {
    if (onProgress) {
      onProgress(step, progress, message)
    }
    // Also log to console for debugging
  }

  try {
    reportProgress('upload', 10, 'File uploaded successfully')

    const ext = path.extname(filePath).toLowerCase()
    const stats = await fs.stat(filePath)
    const fileSizeKB = stats.size / 1024


    reportProgress('validation', 20, 'Validating document...')

    // Ensure output directory exists
    await fs.ensureDir(path.dirname(outputPath))

    if (ext === '.pdf') {
      return await processPDF(filePath, outputPath, preset, reportProgress, options)
    } else {
      return await processImage(filePath, outputPath, preset, purpose, reportProgress, options)
    }
  } catch (error: any) {
    throw new Error(`Processing failed: ${error.message}`)
  }
}

async function processPDF(
  filePath: string,
  outputPath: string,
  preset: DocumentPreset,
  reportProgress: (step: string, progress: number, message: string) => void,
  options: ProcessingOptions
): Promise<string> {
  reportProgress('processing', 40, 'Processing PDF...')

  try {
    const pdfBytes = await fs.readFile(filePath)
    let pdfDoc;

    try {
      // Cast to any to bypass type check if we really want to pass password, 
      // but if the library doesn't support it, it won't work anyway.
      // Most pdf-lib versions don't support simple password loading.
      pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
    } catch (loadErr: any) {
      throw new Error(`Failed to load PDF. It might be protected or corrupted. (${loadErr.message})`)
    }

    const pages = pdfDoc.getPages()

    if (pages.length === 0) {
      throw new Error('PDF has no pages')
    }

    // Apply self-attestation if signature is provided
    if (options.selfAttestSignaturePath && await fs.pathExists(options.selfAttestSignaturePath)) {
      reportProgress('processing', 45, 'Applying self-attestation stamp to PDF...')
      try {
        const sigBytes = await fs.readFile(options.selfAttestSignaturePath)
        const sigImage = await pdfDoc.embedPng(sigBytes).catch(() => pdfDoc.embedJpg(sigBytes))

        for (const page of pages) {
          const { width, height } = page.getSize()
          // Place signature on bottom right
          const sigWidth = 100
          const sigHeight = (sigImage.height / sigImage.width) * sigWidth

          page.drawImage(sigImage, {
            x: width - sigWidth - 40,
            y: 40,
            width: sigWidth,
            height: sigHeight,
          })

          // Add "Self-Attested" text
          page.drawText('Self-Attested', {
            x: width - sigWidth - 40,
            y: 25,
            size: 10,
          })
        }
      } catch (e) {
        // Continue if attestation fails
      }
    }

    // Apply Aadhaar Masking if requested
    if (options.purpose === 'aadhaar_masker') {
      reportProgress('processing', 45, 'Masking Aadhaar number for privacy...')
      try {
        const firstPage = pages[0]
        const { width, height } = firstPage.getSize()

        // AUTOMATIC DETECTION: Find text matching Aadhaar pattern
        let detectedCoords = await findAadhaarCoordsInPDF(pdfBytes)

        if (detectedCoords.length > 0) {
          reportProgress('processing', 48, `Found ${detectedCoords.length} Aadhaar number(s). Masking...`)
          for (const coord of detectedCoords) {
            // pdf-lib and pdfjs use same bottom-left coordinate system
            // But we might need to adjust for scaling/viewport
            firstPage.drawRectangle({
              x: coord.x - 5,
              y: coord.y - 2,
              width: coord.width + 10,
              height: coord.height + 4,
              color: undefined, // default white
            })
            firstPage.drawText('XXXX XXXX', {
              x: coord.x,
              y: coord.y + (coord.height * 0.2),
              size: coord.height * 0.8,
            })
          }
        } else {
          // Fallback to heuristic if OCR/Text extraction finds nothing
          const rectWidth = width * 0.45
          const rectHeight = height * 0.05
          const x = (width - rectWidth) / 2
          const y = height * 0.18

          firstPage.drawRectangle({ x, y, width: rectWidth, height: rectHeight })
          firstPage.drawText('XXXX XXXX', { x: x + 10, y: y + 5, size: rectHeight * 0.7 })
        }
      } catch (e) { }
    }

    reportProgress('optimization', 60, 'Optimizing PDF...')

    const inputSizeKB = pdfBytes.length / 1024

    // If PDF is too large, convert to image-based PDF
    if (inputSizeKB > preset.maxSizeKB) {
      reportProgress('optimization', 70, 'Converting PDF to compressed image format...')

      try {
        // Strategy 1: Use pdfjs-dist to extract and compress images (works without canvas)
        reportProgress('optimization', 72, 'Extracting images from PDF...')

        let extractedImage: Buffer | null = null
        let extractedWidth = 0
        let extractedHeight = 0

        try {
          // Convert Buffer to Uint8Array (pdfjs-dist requirement)
          const pdfUint8Array = new Uint8Array(pdfBytes)
          const loadingTask = pdfjsLib.getDocument({ data: pdfUint8Array })
          const pdfDocument = await loadingTask.promise
          const pdfPage = await pdfDocument.getPage(1)

          // Get operator list to find image operations
          const operatorList = await pdfPage.getOperatorList()

          // Access resources through the page's commonObjs and objs
          // Resources are accessed via the operator list or page dictionary
          let xObjects: any = null

          // Try to get resources from page dictionary
          try {
            const pageDict = (pdfPage as any).dict
            if (pageDict) {
              const resourcesRef = pageDict.get('Resources')
              if (resourcesRef) {
                const resources = await pdfPage.objs.get(resourcesRef)
                if (resources && (resources as any).XObject) {
                  xObjects = (resources as any).XObject
                }
              }
            }
          } catch (dictError: any) {
          }

          // Alternative: Search operator list for image names (works for image-based PDFs)
          if (!xObjects) {
            const foundImages: any = {}

            // Look for image names in operator list (operations with image name strings)
            for (let i = 0; i < operatorList.fnArray.length; i++) {
              const args = operatorList.argsArray[i]

              // Check if args contain an image name (string starting with "img_")
              if (args && Array.isArray(args) && args.length > 0 && typeof args[0] === 'string' && args[0].startsWith('img_')) {
                const imgName = args[0]

                // Skip if we already found this image
                if (foundImages[imgName]) continue

                try {
                  // Try page.objs first, then commonObjs
                  let imgObj: any = null
                  try {
                    imgObj = await pdfPage.objs.get(imgName)
                  } catch (e1) {
                    try {
                      imgObj = await pdfPage.commonObjs.get(imgName)
                    } catch (e2) {
                      // Continue to next
                    }
                  }

                  if (imgObj && imgObj.data && imgObj.data.length > 0) {
                    foundImages[imgName] = imgObj
                  }
                } catch (e: any) {
                  // Continue searching
                }
              }
            }

            if (Object.keys(foundImages).length > 0) {
              xObjects = foundImages
            }
          }

          if (xObjects) {
            const keys = Object.keys(xObjects)

            // Process the largest image (usually the main document image)
            let largestImage: any = null
            let largestSize = 0

            for (const key of keys) {
              try {
                const imgObj = xObjects[key]
                // xObjects may contain image objects directly (from operator list search) or references
                let actualImg: any = null

                if (imgObj && imgObj.data) {
                  // Already an image object (from operator list search)
                  actualImg = imgObj
                } else {
                  // Try to get from objs or commonObjs
                  try {
                    actualImg = await pdfPage.objs.get(imgObj)
                  } catch (e1) {
                    try {
                      actualImg = await pdfPage.commonObjs.get(imgObj)
                    } catch (e2) {
                    }
                  }
                }

                if (actualImg && actualImg.data && actualImg.data.length > largestSize) {
                  largestImage = actualImg
                  largestSize = actualImg.data.length
                }
              } catch (keyError: any) {
              }
            }

            if (largestImage) {
              try {
                const img = largestImage

                // Convert image data to Buffer
                let imgBuffer: Buffer
                if (Buffer.isBuffer(img.data)) {
                  imgBuffer = img.data
                } else if (img.data instanceof Uint8Array) {
                  imgBuffer = Buffer.from(img.data)
                } else if (Array.isArray(img.data)) {
                  imgBuffer = Buffer.from(img.data)
                } else {
                  // Try to get raw data
                  imgBuffer = Buffer.from(img.data as any)
                }


                // Compress aggressively
                let quality = 70
                let scale = 0.9
                let bestBuffer: Buffer | null = null
                let bestSize = Infinity

                // Efficient loop for PDF image compression
                for (let i = 0; i < 10; i++) {
                  try {
                    const w = Math.round(img.width * scale)

                    let compressed: Buffer
                    try {
                      compressed = await sharp(imgBuffer, {
                        raw: {
                          width: img.width,
                          height: img.height,
                          channels: img.colorSpace?.name === 'DeviceRGB' ? 3 : img.colorSpace?.name === 'DeviceGray' ? 1 : 3
                        }
                      })
                        .resize(w, null, { fit: 'inside' })
                        .jpeg({ quality, mozjpeg: true })
                        .toBuffer()
                    } catch (rawError: any) {
                      compressed = await sharp(imgBuffer)
                        .resize(w, null, { fit: 'inside' })
                        .jpeg({ quality, mozjpeg: true })
                        .toBuffer()
                    }

                    const sizeKB = compressed.length / 1024

                    if (sizeKB < bestSize) {
                      bestBuffer = compressed
                      bestSize = sizeKB
                    }

                    if (sizeKB <= preset.maxSizeKB) break

                    // Aggressive steps
                    if (sizeKB > preset.maxSizeKB * 3) {
                      scale *= 0.6
                      quality -= 20
                    } else {
                      scale *= 0.8
                      quality -= 10
                    }

                    if (quality < 20) quality = 20
                    if (scale < 0.4) break
                  } catch (err: any) {
                    break
                  }
                }

                if (bestBuffer) {
                  extractedImage = bestBuffer
                  extractedWidth = img.width
                  extractedHeight = img.height
                } else {
                }
              } catch (imgError: any) {
              }
            } else {
            }
          } else {
          }
        } catch (pdfjsError: any) {
        }


        // If we extracted an image, embed it back into PDF
        if (extractedImage) {
          reportProgress('optimization', 85, 'Creating compressed PDF...')

          const page = pages[0]
          const { width, height } = page.getSize()

          const newPdfDoc = await PDFDocument.create()
          const newPage = newPdfDoc.addPage([width, height])

          const jpegImage = await newPdfDoc.embedJpg(extractedImage)
          newPage.drawImage(jpegImage, {
            x: 0,
            y: 0,
            width: width,
            height: height,
          })

          // Apply self-attestation if signature is provided
          if (options.selfAttestSignaturePath && await fs.pathExists(options.selfAttestSignaturePath)) {
            reportProgress('processing', 80, 'Applying self-attestation stamp...')
            try {
              const sigBytes = await fs.readFile(options.selfAttestSignaturePath)
              const sigImage = await newPdfDoc.embedPng(sigBytes).catch(() => newPdfDoc.embedJpg(sigBytes))

              // Since we're creating a new PDF with only one page, apply to that page
              const { width, height } = newPage.getSize()
              // Place signature on bottom right
              const sigWidth = 100
              const sigHeight = (sigImage.height / sigImage.width) * sigWidth

              newPage.drawImage(sigImage, {
                x: width - sigWidth - 40,
                y: 40,
                width: sigWidth,
                height: sigHeight,
              })

              // Add "Self-Attested" text
              newPage.drawText('Self-Attested', {
                x: width - sigWidth - 40,
                y: 25,
                size: 10,
              })
            } catch (e) {
              // Continue if attestation fails
            }
          }

          const compressedBytes = await newPdfDoc.save()
          const compressedSizeKB = compressedBytes.length / 1024

          await fs.writeFile(outputPath, compressedBytes)

          if (compressedSizeKB <= preset.maxSizeKB) {
          } else {
          }

          if (compressedSizeKB <= preset.maxSizeKB) {
            reportProgress('complete', 100, `✅ Compressed to ${compressedSizeKB.toFixed(2)} KB`)
          } else {
            reportProgress('complete', 100, `Compressed to ${compressedSizeKB.toFixed(2)} KB (target: ${preset.maxSizeKB} KB)`)
          }
          return outputPath
        } else {
        }

        // Strategy 2: Try canvas-based rendering (requires canvas, may not work on all hosts)
        if (createCanvas) {

          const page = pages[0]
          const { width, height } = page.getSize()

          let imageBuffer: Buffer | null = null
          let quality = 55
          let scaleFactor = 0.85

          // Try rendering PDF to image with progressive compression
          for (let attempt = 0; attempt < 25; attempt++) {
            try {

              const renderWidth = Math.max(400, Math.round(width * scaleFactor))
              const renderHeight = Math.max(400, Math.round(height * scaleFactor))

              // Create canvas and render PDF
              const canvas = createCanvas(renderWidth, renderHeight)
              const ctx = canvas.getContext('2d')

              // Load PDF with pdfjs (convert Buffer to Uint8Array)
              const pdfUint8Array = new Uint8Array(pdfBytes)
              const loadingTask = pdfjsLib.getDocument({
                data: pdfUint8Array,
                standardFontDataUrl: path.join(process.cwd(), 'node_modules/pdfjs-dist/standard_fonts/')
              })
              const pdfDocument = await loadingTask.promise
              const pdfPage = await pdfDocument.getPage(1)

              const viewport = pdfPage.getViewport({ scale: scaleFactor })

              const renderContext = {
                canvasContext: ctx as any,
                viewport: viewport,
              }

              await pdfPage.render(renderContext).promise

              // Convert canvas to JPEG buffer with compression
              const canvasBuffer = canvas.toBuffer('image/jpeg', { quality: quality / 100 })
              const imageSizeKB = canvasBuffer.length / 1024


              if (imageSizeKB <= preset.maxSizeKB) {
                imageBuffer = canvasBuffer
                break
              }

              // Reduce quality and scale more aggressively
              if (quality > 40) {
                quality -= 5
                scaleFactor -= 0.05
              } else {
                quality -= 3
                scaleFactor -= 0.08
              }

              if (quality < 18) quality = 18
              if (scaleFactor < 0.4) break
            } catch (renderError: any) {
              break
            }
          }

          if (imageBuffer) {
            // Embed compressed image back into PDF (maintain PDF format)

            const newPdfDoc = await PDFDocument.create()
            const newPage = newPdfDoc.addPage([width, height])

            // Embed the compressed JPEG image
            const jpegImage = await newPdfDoc.embedJpg(imageBuffer)
            newPage.drawImage(jpegImage, {
              x: 0,
              y: 0,
              width: width,
              height: height,
            })

            const compressedPdfBytes = await newPdfDoc.save()
            await fs.writeFile(outputPath, compressedPdfBytes)

            const savedStats = await fs.stat(outputPath)
            const savedSizeKB = savedStats.size / 1024


            if (savedSizeKB <= preset.maxSizeKB) {
              reportProgress('complete', 100, `Processing complete! Compressed PDF: ${savedSizeKB.toFixed(2)} KB`)
            } else {
              reportProgress('complete', 100, `Warning: File size ${savedSizeKB.toFixed(2)} KB exceeds target`)
            }

            return outputPath
          }
        } else {
        }

        // Last resort: Try pdfjs-dist to render PDF (works without canvas but needs Node.js canvas polyfill)

        try {
          const page = pages[0]
          const { width, height } = page.getSize()

          // Load PDF with pdfjs (convert Buffer to Uint8Array)
          const pdfUint8Array = new Uint8Array(pdfBytes)
          const loadingTask = pdfjsLib.getDocument({ data: pdfUint8Array })
          const pdfDocument = await loadingTask.promise
          const pdfPage = await pdfDocument.getPage(1)

          // Get viewport
          const viewport = pdfPage.getViewport({ scale: 2.0 })

          // Render to image data using pdfjs (this creates a pixel array)
          const renderTask = pdfPage.render({
            canvasContext: null as any, // We'll get the pixel data differently
            viewport: viewport,
          })

          await renderTask.promise

          // Note: pdfjs-dist in Node.js requires a canvas implementation
          // Without canvas, we can't render PDFs to images

        } catch (pdfjsError: any) {
        }

        // Final fallback: Optimize PDF structure (minimal compression)
        const optimizedPdfDoc = await PDFDocument.create()
        const [copiedPage] = await optimizedPdfDoc.copyPages(pdfDoc, [0])
        optimizedPdfDoc.addPage(copiedPage)

        const optimizedBytes = await optimizedPdfDoc.save()
        const optimizedSizeKB = optimizedBytes.length / 1024

        await fs.writeFile(outputPath, optimizedBytes)

        if (optimizedSizeKB > preset.maxSizeKB) {
        }

        if (optimizedSizeKB <= preset.maxSizeKB) {
          reportProgress('complete', 100, `Processing complete! Final size: ${optimizedSizeKB.toFixed(2)} KB`)
        } else {
          const message = `⚠️ Cannot compress PDF. Convert to JPEG/PNG first for compression.`
          reportProgress('complete', 100, message)
        }

        return outputPath
      } catch (conversionError: any) {
        // If all compression fails, save optimized PDF

        const optimizedPdfDoc = await PDFDocument.create()
        const [copiedPage] = await optimizedPdfDoc.copyPages(pdfDoc, [0])
        optimizedPdfDoc.addPage(copiedPage)
        const optimizedBytes = await optimizedPdfDoc.save()

        await fs.writeFile(outputPath, optimizedBytes)
        reportProgress('complete', 100, 'Processing complete!')
        return outputPath
      }
    } else {
      // PDF is already within size limits
      await fs.writeFile(outputPath, pdfBytes)
      reportProgress('complete', 100, 'Processing complete!')
      return outputPath
    }
  } catch (error: any) {
    throw new Error(`PDF processing failed: ${error.message}`)
  }
}

async function processImage(
  filePath: string,
  outputPath: string,
  preset: DocumentPreset,
  purpose: DocumentPurpose,
  reportProgress: (step: string, progress: number, message: string) => void,
  options: ProcessingOptions
): Promise<string> {
  reportProgress('processing', 40, 'Processing image...')

  try {
    const stats = await fs.stat(filePath)
    const originalSizeKB = stats.size / 1024

    // Detect output format from outputPath extension
    const outputExt = path.extname(outputPath).toLowerCase()
    const isJPEG = outputExt === '.jpg' || outputExt === '.jpeg'
    const isPNG = outputExt === '.png'


    let image = sharp(filePath)
    const metadata = await image.metadata()
    let targetDPI = 600 // Global Rule: Default to high-quality 600 DPI for everything

    if (purpose === 'dpi_fixer') {
      // DPI Injector Exception:
      // Respect user choice (options.dpi).
      // If not set, default to whichever is higher: 600 DPI or the Current Image DPI.
      // This prevents downsampling a high-res scan while upgrading low-res ones.
      const currentDPI = metadata.density || 72
      targetDPI = options.dpi || Math.max(600, currentDPI)
    }

    reportProgress('processing', 50, 'Analyzing image...')

    // Start with original dimensions
    let currentWidth = metadata.width || 1
    let currentHeight = metadata.height || 1
    let finalQuality = 85
    let outputBuffer: Buffer

    // STEP 1: Apply image enhancements (whitening, shadow removal)
    reportProgress('optimization', 60, 'Enhancing image quality...')

    // Whitening background - ONLY if requested for cleaner scans
    if (preset.removeShadows) {
      image = await whitenBackground(image)
    }

    // Apply Signature Darkener if requested or if it's a signature tool
    if (options.darkenSignature || purpose === 'signature' || purpose.includes('sign')) {
      image = await darkenSignature(image)
    }

    // Auto-crop/Deskew if requested
    if (options.autoCrop) {
      image = await deskewImage(image)
    }

    // Aadhaar Masking (World First)
    if (purpose === 'aadhaar_masker') {
      reportProgress('processing', 58, 'Automatically detecting Aadhaar number...')
      const detectedMasks = await detectAadhaarInImage(filePath)

      if (detectedMasks.length > 0) {
        reportProgress('processing', 59, `Found ${detectedMasks.length} number(s). Applying privacy masks...`)
        image = image.composite(detectedMasks.map(mask => ({
          input: mask.buffer,
          top: mask.top,
          left: mask.left
        })))
      } else {
        // Fallback to high-confidence heuristic
        image = await maskAadhaarImage(image)
      }
    }

    // Apply self-attestation if signature is provided
    if (options.selfAttestSignaturePath && await fs.pathExists(options.selfAttestSignaturePath)) {
      reportProgress('processing', 55, 'Applying self-attestation stamp to image...')
      try {
        const sigBuffer = await fs.readFile(options.selfAttestSignaturePath)
        const sigSharp = sharp(sigBuffer)
        const sigMetadata = await sigSharp.metadata()

        if (sigMetadata.width && sigMetadata.height) {
          const targetWidth = Math.round(currentWidth * 0.2) // 20% of image width
          const targetHeight = Math.round((sigMetadata.height / sigMetadata.width) * targetWidth)

          const resizedSig = await sigSharp.resize(targetWidth, targetHeight).toBuffer()

          image = image.composite([{
            input: resizedSig,
            gravity: 'southeast',
            top: undefined,
            left: undefined,
          }])
        }
      } catch (e) {
        // Continue if attestation fails
      }
    }

    // Apply extra shadow removal if set
    if (preset.removeShadows) {
      image = image.modulate({
        brightness: 1.05,
        saturation: 1.0, // Preserve color
      }).normalize()
    }

    // Auto-crop and alignment for passport
    if (purpose === 'passport' && preset.aspectRatio) {
      const targetRatio = preset.aspectRatio.width / preset.aspectRatio.height
      const currentRatio = currentWidth / currentHeight

      if (Math.abs(currentRatio - targetRatio) > 0.1) {
        const newWidth = Math.round(currentHeight * targetRatio)
        image = image.resize({
          width: newWidth,
          height: currentHeight,
          fit: 'cover',
          position: 'center',
        })
        currentWidth = newWidth
      }
    }

    // STEP 2: Compress aggressively to meet size requirements
    reportProgress('optimization', 70, `Optimizing file size (target: ${preset.maxSizeKB} KB)...`)

    // Start with a more aggressive resize if image is massive (handles the "70% hang")
    if (currentWidth > 4000 || currentHeight > 4000) {
      reportProgress('optimization', 65, 'Resizing extremely large image...')
      const initialScale = 3000 / Math.max(currentWidth, currentHeight)
      image = image.resize(Math.round(currentWidth * initialScale), Math.round(currentHeight * initialScale), { fit: 'inside' })
      const newMeta = await image.metadata()
      currentWidth = newMeta.width || currentWidth
      currentHeight = newMeta.height || currentHeight
    }

    // CHECKPOINT: Force processing of filters (darkening, whitening) before compression loop
    // This prevents Sharp pipeline from hanging due to too many pending operations
    if (options.darkenSignature || preset.removeShadows || options.autoCrop) {
      try {
        reportProgress('optimization', 69, 'Applying filters...')
        // Use PNG for intermediate buffer to preserve maximum sharpness/quality
        // JPEG here would cause "generation loss" leading to blurriness
        const tempBuffer = await image.png().toBuffer()
        image = sharp(tempBuffer)
        const tempMeta = await image.metadata()
        currentWidth = tempMeta.width || currentWidth
        currentHeight = tempMeta.height || currentHeight
      } catch (e) {
        // If filters fail or hang, log and continue without them (or with pending ops)
        console.warn('Filter application checkpoint failed, continuing with pipeline:', e)
        reportProgress('optimization', 69, 'Filters complex, optimizing on-the-fly...')
      }
    }

    let quality = 80
    let scaleFactor = 1.0
    let compressedBuffer: Buffer | null = null
    let finalSizeKB = Infinity

    // Optimized binary-search-like compression loop (max 8 iterations)
    for (let attempt = 0; attempt < 8; attempt++) {
      try {
        const currentProgress = 70 + Math.round((attempt / 8) * 20)
        reportProgress('optimization', currentProgress, `Compressing... (Attempt ${attempt + 1}/8)`)

        const newWidth = Math.round(currentWidth * scaleFactor)
        if (newWidth < 300) break

        let compressionPipeline = image
          .clone()
          .resize(newWidth, null, { fit: 'inside', kernel: sharp.kernel.lanczos3 })
          .withMetadata({ density: targetDPI })

        if (options.darkenSignature) {
          // Improve edge definition for signatures
          compressionPipeline = compressionPipeline.sharpen()
          // If darker signature is requested, ensure we use a threshold-like logic for crispness
          // by converting grayscale to near-black-and-white
          if (!isJPEG) {
            // For PNG, we can afford to be more aggressive with colors as it handles solid colors well
            // compressionPipeline = compressionPipeline.threshold(160) // Optional: might be too risky
          }
        }

        if (isJPEG) {
          compressedBuffer = await compressionPipeline.jpeg({ quality, mozjpeg: true }).toBuffer()
        } else {
          compressedBuffer = await compressionPipeline.png({ quality: Math.min(quality + 15, 90), compressionLevel: 8 }).toBuffer()
        }

        finalSizeKB = compressedBuffer.length / 1024
        if (finalSizeKB <= preset.maxSizeKB) {
          finalQuality = quality
          break
        }

        // Fast convergence logic
        const ratio = finalSizeKB / preset.maxSizeKB
        if (ratio > 5) {
          scaleFactor *= 0.5
          quality -= 20
        } else if (ratio > 2) {
          scaleFactor *= 0.7
          quality -= 10
        } else {
          scaleFactor *= 0.85
          quality -= 5
        }

        if (quality < 25) quality = 25
        if (scaleFactor < 0.25) scaleFactor = 0.25

        // Log details to help debugging "hangs"
        console.log(`[Compression] Attempt ${attempt + 1}: Width=${newWidth}, Scale=${scaleFactor.toFixed(2)}, Quality=${quality}, Size=${finalSizeKB.toFixed(2)}KB`)
      } catch (err) {
        break
      }
    }

    // Ensure we have a buffer
    if (!compressedBuffer) {
      throw new Error('Failed to create compressed buffer')
    }


    // Final save
    await fs.writeFile(outputPath, compressedBuffer)

    // Verify it was saved correctly
    const savedStats = await fs.stat(outputPath)
    const actualSavedSizeKB = savedStats.size / 1024

    // Log for debugging

    if (actualSavedSizeKB > preset.maxSizeKB * 1.1) {
      reportProgress('complete', 100, `Warning: File size ${actualSavedSizeKB.toFixed(2)} KB exceeds target of ${preset.maxSizeKB} KB`)
    } else {
      reportProgress('complete', 100, `Processing complete! Final size: ${actualSavedSizeKB.toFixed(2)} KB`)
    }

    return outputPath
  } catch (error: any) {
    throw new Error(`Image processing failed: ${error.message}`)
  }
}

// Extract and compress images from PDF (cross-platform)
// Uses pdf-lib's internal APIs to access embedded images
async function extractAndCompressPDFImages(
  pdfDoc: PDFDocument,
  preset: DocumentPreset,
  pdfBytes?: Buffer
): Promise<{ buffer: Buffer; width: number; height: number }[]> {
  const compressedImages: { buffer: Buffer; width: number; height: number }[] = []

  try {
    // Method 1: Try using pdfjs-dist to extract images (more reliable for image-based PDFs)
    if (pdfBytes) {
      try {
        // Convert Buffer to Uint8Array (pdfjs-dist requirement)
        const pdfUint8Array = new Uint8Array(pdfBytes)
        const loadingTask = pdfjsLib.getDocument({ data: pdfUint8Array })
        const pdfDocument = await loadingTask.promise
        const pdfPage = await pdfDocument.getPage(1)

        // Get resources from the page
        const resources = await (pdfPage as any).getResources()

        // Try to access XObject images
        if (resources && (resources as any).XObject) {
          const xObjects = (resources as any).XObject
          const xObjectKeys = Object.keys(xObjects)

          for (const key of xObjectKeys) {
            try {
              const xObjectRef = xObjects[key]
              const xObject = await pdfPage.objs.get(xObjectRef)

              if (xObject && (xObject as any).subtype === 'Image') {
                const imgObj = xObject as any

                // Get image data
                const imageData = imgObj.data
                if (imageData && imageData.length > 0) {
                  const imageBuffer = Buffer.from(imageData)
                  const width = imgObj.width || 1000
                  const height = imgObj.height || 1000


                  // Compress the image
                  let quality = 50
                  let scaleFactor = 0.85
                  let bestBuffer: Buffer | null = null
                  let bestSizeKB = Infinity

                  for (let attempt = 0; attempt < 20; attempt++) {
                    try {
                      const newWidth = Math.max(400, Math.round(width * scaleFactor))
                      const newHeight = Math.max(400, Math.round(height * scaleFactor))

                      const compressed = await sharp(imageBuffer, {
                        raw: {
                          width: width,
                          height: height,
                          channels: imgObj.colorSpace?.name === 'DeviceRGB' ? 3 : imgObj.colorSpace?.name === 'DeviceGray' ? 1 : 3
                        }
                      })
                        .resize(newWidth, newHeight, { fit: 'inside', kernel: sharp.kernel.lanczos3 })
                        .jpeg({ quality, mozjpeg: true })
                        .toBuffer()

                      const sizeKB = compressed.length / 1024

                      if (sizeKB < bestSizeKB) {
                        bestBuffer = compressed
                        bestSizeKB = sizeKB
                      }

                      if (sizeKB <= preset.maxSizeKB / 2) break

                      quality -= 5
                      scaleFactor -= 0.05
                      if (quality < 20) quality = 20
                      if (scaleFactor < 0.5) break
                    } catch (compressError: any) {
                      // Try as regular image
                      try {
                        const compressed = await sharp(imageBuffer)
                          .resize(Math.max(400, Math.round(width * scaleFactor)), Math.max(400, Math.round(height * scaleFactor)), { fit: 'inside' })
                          .jpeg({ quality, mozjpeg: true })
                          .toBuffer()

                        const sizeKB = compressed.length / 1024
                        if (sizeKB < bestSizeKB) {
                          bestBuffer = compressed
                          bestSizeKB = sizeKB
                        }
                        if (sizeKB <= preset.maxSizeKB / 2) break
                        quality -= 5
                        scaleFactor -= 0.05
                        if (quality < 20) quality = 20
                        if (scaleFactor < 0.5) break
                      } catch (fallbackError: any) {
                        break
                      }
                    }
                  }

                  if (bestBuffer) {
                    compressedImages.push({
                      buffer: bestBuffer,
                      width: width,
                      height: height
                    })
                  }
                }
              }
            } catch (xObjError: any) {
            }
          }
        }

        if (compressedImages.length > 0) {
          return compressedImages
        } else {
        }
      } catch (pdfjsError: any) {
      }
    }

    // Method 2: Fallback to pdf-lib's internal APIs

    // Access pdf-lib's internal PDF context
    const context = (pdfDoc as any).context

    if (!context) {
      return compressedImages
    }

    // Get all pages
    const pages = pdfDoc.getPages()
    if (pages.length === 0) return compressedImages


    // Try multiple methods to find images
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const page = pages[pageIndex]
      const pageNode = (page as any).node

      if (!pageNode) {
        continue
      }


      // Method 1: Try to access page resources directly
      let resources = pageNode.get('Resources')

      // Method 2: Try accessing through page dictionary
      if (!resources) {
        const pageDict = pageNode.dict
        if (pageDict) {
          resources = pageDict.get('Resources')
        }
      }

      // Method 3: Try accessing through inherited resources
      if (!resources) {
        const pageDict = pageNode.dict
        if (pageDict) {
          const parent = pageDict.get('Parent')
          if (parent) {
            const parentObj = context.lookup(parent)
            if (parentObj) {
              resources = parentObj.get('Resources')
            }
          }
        }
      }

      if (!resources) {
        continue
      }


      // Look for XObject resources (where images are stored)
      let xObject = resources.get('XObject')

      // Try accessing XObject differently
      if (!xObject) {
        const resourcesDict = resources.dict || resources
        if (resourcesDict && typeof resourcesDict.get === 'function') {
          xObject = resourcesDict.get('XObject')
        }
      }

      if (!xObject) {
        continue
      }


      // Extract image objects from XObject dictionary
      let xObjectDict = xObject.dict || xObject
      let imageKeys: string[] = []

      if (xObjectDict && typeof xObjectDict.keys === 'function') {
        imageKeys = xObjectDict.keys()
      } else if (xObjectDict && typeof xObjectDict === 'object') {
        imageKeys = Object.keys(xObjectDict)
      }


      for (const key of imageKeys) {
        try {

          let imageRef
          if (typeof xObjectDict.get === 'function') {
            imageRef = xObjectDict.get(key)
          } else {
            imageRef = xObjectDict[key]
          }

          if (!imageRef) {
            continue
          }

          const imageObj = context.lookup(imageRef)

          if (!imageObj) {
            continue
          }

          // Check if it's an image object
          let subtype = imageObj.get('Subtype')
          if (!subtype) {
            const subtypeValue = imageObj.dict?.get('Subtype') || imageObj.dict?.Subtype
            if (subtypeValue) {
              subtype = subtypeValue
            }
          }

          const subtypeName = subtype?.name || subtype

          if (subtypeName !== 'Image' && subtypeName !== '/Image') {
            continue
          }


          // Get image data - try multiple access methods
          let width = imageObj.get('Width')
          let height = imageObj.get('Height')
          let colorSpace = imageObj.get('ColorSpace')
          let bitsPerComponent = imageObj.get('BitsPerComponent') || 8

          if (!width || !height) {
            const dict = imageObj.dict || imageObj
            width = width || dict?.get('Width') || dict?.Width
            height = height || dict?.get('Height') || dict?.Height
            colorSpace = colorSpace || dict?.get('ColorSpace') || dict?.ColorSpace
            bitsPerComponent = bitsPerComponent || dict?.get('BitsPerComponent') || dict?.BitsPerComponent || 8
          }


          // Get image stream data - try multiple access methods
          let stream = imageObj.get('stream')
          if (!stream) {
            const dict = imageObj.dict || imageObj
            stream = dict?.get('stream') || dict?.stream
          }

          if (!stream) {
            continue
          }

          let imageData = stream.contents
          if (!imageData) {
            imageData = stream.get('contents') || stream.contents
          }

          if (!imageData) {
            continue
          }


          // Convert to buffer
          let imageBuffer: Buffer

          if (Buffer.isBuffer(imageData)) {
            imageBuffer = imageData
          } else if (imageData instanceof Uint8Array) {
            imageBuffer = Buffer.from(imageData)
          } else {
            continue
          }


          // Compress the image aggressively
          // PDF images might be in raw format, so we need to create a proper image buffer
          let quality = 50
          let scaleFactor = 0.85
          let bestBuffer: Buffer | null = null
          let bestSizeKB = Infinity

          // Try to process with sharp - if it fails, the image might be in an unsupported format
          for (let attempt = 0; attempt < 25; attempt++) {
            const newWidth = Math.max(400, Math.round(width * scaleFactor))
            const newHeight = Math.max(400, Math.round(height * scaleFactor))

            try {
              // Create a raw RGB image buffer if needed, or use the existing buffer
              let imageToProcess = imageBuffer

              // If the buffer seems too small for the dimensions, it might be compressed already
              // Try to process it directly with sharp
              const compressed = await sharp(imageToProcess, {
                raw: {
                  width: width,
                  height: height,
                  channels: colorSpace?.name === 'DeviceRGB' ? 3 : colorSpace?.name === 'DeviceGray' ? 1 : 3
                }
              })
                .resize(newWidth, newHeight, { fit: 'inside', kernel: sharp.kernel.lanczos3 })
                .jpeg({ quality, mozjpeg: true })
                .toBuffer()

              const sizeKB = compressed.length / 1024


              if (sizeKB < bestSizeKB) {
                bestBuffer = compressed
                bestSizeKB = sizeKB
              }

              if (sizeKB <= preset.maxSizeKB / 2) {
                break
              }

              // Reduce quality and scale more aggressively
              if (quality > 40) {
                quality -= 5
                scaleFactor -= 0.05
              } else {
                quality -= 3
                scaleFactor -= 0.08
              }

              if (quality < 20) quality = 20
              if (scaleFactor < 0.5) break
            } catch (sharpError: any) {
              // If sharp fails, try treating it as a JPEG/PNG buffer
              try {
                const compressed = await sharp(imageBuffer)
                  .resize(Math.max(400, Math.round(width * scaleFactor)), Math.max(400, Math.round(height * scaleFactor)), {
                    fit: 'inside',
                    kernel: sharp.kernel.lanczos3
                  })
                  .jpeg({ quality, mozjpeg: true })
                  .toBuffer()

                const sizeKB = compressed.length / 1024

                if (sizeKB < bestSizeKB) {
                  bestBuffer = compressed
                  bestSizeKB = sizeKB
                }

                if (sizeKB <= preset.maxSizeKB / 2) break

                quality -= 5
                scaleFactor -= 0.05
                if (quality < 20) quality = 20
                if (scaleFactor < 0.5) break
              } catch (fallbackError: any) {
                break
              }
            }
          }

          if (bestBuffer && bestSizeKB < Infinity) {
            compressedImages.push({
              buffer: bestBuffer,
              width: width,
              height: height
            })
          } else {
          }
        } catch (imgError: any) {
          continue
        }
      }
    }

    return compressedImages
  } catch (error: any) {
    return compressedImages
  }
}

async function whitenBackground(image: sharp.Sharp): Promise<sharp.Sharp> {
  try {
    // Sharp's native operations are faster than per-pixel loops
    return image
      .modulate({
        brightness: 1.05,
      })
      .linear(1.4, -0.1) // Increase white point aggressively
  } catch (error) {
    return image
  }
}

async function darkenSignature(image: sharp.Sharp): Promise<sharp.Sharp> {
  try {
    // Aggressive darkening for faint signatures
    // 1. Grayscale
    // 2. Normalize (stretch range)
    // Soft Thresholding / High Contrast:
    // Linear(slope, offset) -> slope * input + offset
    // 2.0x contrast (doubles the difference between light and dark)
    // -0.2 offset (darkens everything slightly, but not enough to wipe out ink)
    return image
      .grayscale()

      // 1. Gamma 2.2: Bring out faint details
      .gamma(2.2)

      // 2. Pre-Threshold Blur (0.8): Thicken and connect dots
      .blur(0.8)

      // 3. Threshold (210): Force B&W
      // High value (210) catches even very light grey ink
      .threshold(210)

      // 4. Post-Threshold Smoothing (The Fix for 'Sharp/Jaggies'):
      // Micro-blur to soften the harsh binary pixel steps
      .blur(0.5)

      // 5. Final Sharpen: Tighten the soft edges back to a clean line
      .sharpen()
  } catch (error) {
    return image
  }
}

async function deskewImage(image: sharp.Sharp): Promise<sharp.Sharp> {
  try {
    // Sharp's trim() removes border of same color
    // We can use it to auto-crop to the content
    return image.trim({ threshold: 20 })
  } catch (error) {
    return image
  }
}

async function maskAadhaarImage(image: sharp.Sharp): Promise<sharp.Sharp> {
  try {
    const metadata = await image.metadata()
    const width = metadata.width || 1000
    const height = metadata.height || 1500
    const isPortrait = height > width

    // SMART ADAPTIVE HEURISTIC:
    // Standard Aadhaar cards are either 8.5x5.5cm or full A4 letters.
    // The number is almost always in the bottom 25% of the card area, centered.

    let rectWidth, rectHeight, left, top;

    if (isPortrait) {
      // Case: Aadhaar Letter or Portrait Scan
      rectWidth = Math.round(width * 0.75) // Slightly wider for safety
      rectHeight = Math.round(height * 0.09) // Taller for safety
      left = Math.round((width - rectWidth) / 2)
      top = Math.round(height * 0.68) // Shifted up slightly for better coverage
    } else {
      // Case: Aadhaar Card Front/Back or Landscape Scan
      rectWidth = Math.round(width * 0.6)
      rectHeight = Math.round(height * 0.14)
      left = Math.round((width - rectWidth) / 2)
      top = Math.round(height * 0.73)
    }

    const fontSize = Math.round(rectHeight * 0.7);
    const mask = Buffer.from(
      `<svg width="${rectWidth}" height="${rectHeight}">
        <rect x="0" y="0" width="${rectWidth}" height="${rectHeight}" fill="white" rx="4" ry="4" />
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="${fontSize}" fill="black">XXXX XXXX</text>
      </svg>`
    )

    return image.composite([{
      input: mask,
      top: top,
      left: left,
    }])
  } catch (error) {
    return image
  }
}

async function findAadhaarCoordsInPDF(pdfBytes: Buffer): Promise<{ x: number, y: number, width: number, height: number }[]> {
  const coords: { x: number, y: number, width: number, height: number }[] = []
  try {
    const pdfUint8Array = new Uint8Array(pdfBytes)
    const loadingTask = pdfjsLib.getDocument({ data: pdfUint8Array })
    const pdfDocument = await loadingTask.promise
    const page = await pdfDocument.getPage(1)
    const textContent = await page.getTextContent()
    const viewport = page.getViewport({ scale: 1.0 })

    // Aadhaar pattern: 12 digits, often with spaces: XXXX XXXX XXXX
    // Broader regex to catch variations
    const aadhaarRegex = /\d{4}[\s-]?\d{4}[\s-]?\d{4}/

    for (const item of textContent.items as any[]) {
      if (aadhaarRegex.test(item.str)) {
        // transform: [scaleX, skewY, skewX, scaleY, tx, ty]
        const [scaleX, , , scaleY, tx, ty] = item.transform

        // Find the specific width/height of the matched text
        // Note: item.width is available in modern pdfjs
        coords.push({
          x: tx,
          y: ty,
          width: item.width || (item.str.length * scaleX * 0.6),
          height: item.height || scaleY
        })
      }
    }
  } catch (e) {
  }
  return coords
}

async function detectAadhaarInImage(imagePath: string): Promise<{ buffer: Buffer, top: number, left: number }[]> {
  const masks: { buffer: Buffer, top: number, left: number }[] = []
  let worker: any = null

  // Fast timeout for OCR (max 5 seconds) to prevent UI hangs
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('OCR Timeout')), 5000)
  )

  try {
    const ocrPromise = (async () => {
      // Create worker with strict environment checks
      try {
        worker = await createWorker('eng', 1, {
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`)
            }
          },
          cachePath: path.join(process.cwd(), '.tesseract_cache'),
          // Explicitly set worker and core for stability in Next.js
          gzip: false,
        })
      } catch (workerErr: any) {
        console.warn('[OCR] Failed to initialize worker. This is common in some dev environments. Falling back to heuristic.')
        return []
      }

      const { data: { blocks } } = await worker.recognize(imagePath)

      // Aadhaar patterns: 12 digits or groups of 4 (XXXX XXXX XXXX)
      // Including support for common OCR errors (dashes, extra spaces)
      const aadhaarRegex = /(\d{4}[^\d]?\s?\d{4}[^\d]?\s?\d{4})/g

      for (const block of blocks || []) {
        for (const paragraph of block.paragraphs || []) {
          for (const line of paragraph.lines || []) {
            if (aadhaarRegex.test(line.text)) {
              const bbox = line.bbox
              const rectWidth = bbox.x1 - bbox.x0
              const rectHeight = bbox.y1 - bbox.y0

              // Mask the first 8 digits (approx 70% of the line width)
              const maskWidth = Math.round(rectWidth * 0.72)

              const maskSvg = Buffer.from(
                `<svg width="${maskWidth}" height="${rectHeight}">
                  <rect x="0" y="0" width="${maskWidth}" height="${rectHeight}" fill="white" />
                  <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-weight="bold" font-size="${rectHeight * 0.75}" fill="black">XXXX XXXX</text>
                </svg>`
              )

              masks.push({
                buffer: maskSvg,
                top: bbox.y0,
                left: bbox.x0
              })
            }
          }
        }
      }
      return masks
    })()

    return await Promise.race([ocrPromise, timeoutPromise]) as any
  } catch (e: any) {
    if (e.message !== 'OCR Timeout') {
      console.error('[OCR] Error during detection:', e.message)
    } else {
      console.warn('[OCR] Detection timed out. Proceeding with safety fallback.')
    }
    return []
  } finally {
    if (worker) {
      try {
        await worker.terminate()
      } catch (te) { }
    }
  }
}
