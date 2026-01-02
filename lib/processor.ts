import sharp from 'sharp'
import { PDFDocument } from 'pdf-lib'
import fs from 'fs-extra'
import path from 'path'
import * as pdfjsLib from 'pdfjs-dist'
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
  console.warn('[processor] Canvas module not available:', e)
}



export interface ProcessingOptions {
  filePath: string
  outputPath: string
  purpose: DocumentPurpose
  maxSizeKB?: number // Use custom size if provided
  onProgress?: (step: string, progress: number, message: string) => void
}

export async function processDocument(options: ProcessingOptions): Promise<string> {
  const { filePath, outputPath, purpose, maxSizeKB, onProgress } = options
  const preset = getPreset(purpose)

  // Override preset size if custom size is provided
  if (maxSizeKB) {
    preset.maxSizeKB = maxSizeKB
    console.log(`[ProcessDocument] Using custom maxSizeKB: ${maxSizeKB}`)
  }

  const reportProgress = (step: string, progress: number, message: string) => {
    if (onProgress) {
      onProgress(step, progress, message)
    }
    // Also log to console for debugging
    console.log(`[Progress] ${step}: ${progress}% - ${message}`)
  }

  try {
    console.log(`[ProcessDocument] Starting - File: ${filePath}, Output: ${outputPath}, Purpose: ${purpose}`)
    reportProgress('upload', 10, 'File uploaded successfully')

    const ext = path.extname(filePath).toLowerCase()
    const stats = await fs.stat(filePath)
    const fileSizeKB = stats.size / 1024

    console.log(`[ProcessDocument] Original file size: ${fileSizeKB.toFixed(2)} KB, Extension: ${ext}`)

    reportProgress('validation', 20, 'Validating document...')

    // Ensure output directory exists
    await fs.ensureDir(path.dirname(outputPath))
    console.log(`[ProcessDocument] Output directory ensured: ${path.dirname(outputPath)}`)

    if (ext === '.pdf') {
      console.log(`[ProcessDocument] Processing as PDF`)
      return await processPDF(filePath, outputPath, preset, reportProgress)
    } else {
      console.log(`[ProcessDocument] Processing as Image`)
      return await processImage(filePath, outputPath, preset, purpose, reportProgress)
    }
  } catch (error: any) {
    console.error(`[ProcessDocument] ERROR: ${error.message}`)
    console.error(error.stack)
    throw new Error(`Processing failed: ${error.message}`)
  }
}

async function processPDF(
  filePath: string,
  outputPath: string,
  preset: DocumentPreset,
  reportProgress: (step: string, progress: number, message: string) => void
): Promise<string> {
  console.log(`[processPDF] START - Input: ${filePath}, Output: ${outputPath}`)
  reportProgress('processing', 40, 'Processing PDF...')

  try {
    const pdfBytes = await fs.readFile(filePath)
    const pdfDoc = await PDFDocument.load(pdfBytes)

    const pages = pdfDoc.getPages()

    if (pages.length === 0) {
      throw new Error('PDF has no pages')
    }

    reportProgress('optimization', 60, 'Optimizing PDF...')

    const inputSizeKB = pdfBytes.length / 1024
    console.log(`[processPDF] Original PDF size: ${inputSizeKB.toFixed(2)} KB, Target: ${preset.maxSizeKB} KB, Pages: ${pages.length}`)

    // If PDF is too large, convert to image-based PDF
    if (inputSizeKB > preset.maxSizeKB) {
      console.log(`[processPDF] PDF is too large, converting to compressed image format...`)
      reportProgress('optimization', 70, 'Converting PDF to compressed image format...')

      try {
        // Strategy 1: Use pdfjs-dist to extract and compress images (works without canvas)
        console.log(`[processPDF] Extracting images using pdfjs-dist...`)
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
          console.log(`[processPDF] Operator list length: ${operatorList.fnArray.length}`)

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
            console.log(`[processPDF] Could not get resources from dict: ${dictError.message}`)
          }

          // Alternative: Search operator list for image names (works for image-based PDFs)
          if (!xObjects) {
            console.log(`[processPDF] Searching operator list for image names...`)
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
                    console.log(`[processPDF] ✅ Found image "${imgName}": ${imgObj.width}x${imgObj.height}, ${(imgObj.data.length / 1024).toFixed(2)} KB`)
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
            console.log(`[processPDF] Found ${keys.length} image(s)`)

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
                  console.log(`[processPDF] Image object found directly for key: ${key}`)
                } else {
                  // Try to get from objs or commonObjs
                  try {
                    actualImg = await pdfPage.objs.get(imgObj)
                    console.log(`[processPDF] Retrieved image from objs for key: ${key}`)
                  } catch (e1) {
                    try {
                      actualImg = await pdfPage.commonObjs.get(imgObj)
                      console.log(`[processPDF] Retrieved image from commonObjs for key: ${key}`)
                    } catch (e2) {
                      console.log(`[processPDF] Could not retrieve image for key: ${key}`)
                    }
                  }
                }

                if (actualImg && actualImg.data && actualImg.data.length > largestSize) {
                  largestImage = actualImg
                  largestSize = actualImg.data.length
                  console.log(`[processPDF] New largest image: ${key}, size: ${(actualImg.data.length / 1024).toFixed(2)} KB`)
                }
              } catch (keyError: any) {
                console.log(`[processPDF] Error processing key ${key}: ${keyError.message}`)
              }
            }

            if (largestImage) {
              try {
                const img = largestImage
                console.log(`[processPDF] Processing largest image: ${img.width}x${img.height}, ${(img.data.length / 1024).toFixed(2)} KB`)

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

                console.log(`[processPDF] Image buffer size: ${(imgBuffer.length / 1024).toFixed(2)} KB`)

                // Compress aggressively
                let quality = 50
                let scale = 0.8
                let bestBuffer: Buffer | null = null
                let bestSize = Infinity

                // Try to detect image format and process accordingly
                for (let i = 0; i < 25; i++) {
                  try {
                    const w = Math.max(400, Math.round(img.width * scale))
                    const h = Math.max(400, Math.round(img.height * scale))

                    // Try processing as raw image first
                    let compressed: Buffer
                    try {
                      compressed = await sharp(imgBuffer, {
                        raw: {
                          width: img.width,
                          height: img.height,
                          channels: img.colorSpace?.name === 'DeviceRGB' ? 3 : img.colorSpace?.name === 'DeviceGray' ? 1 : 3
                        }
                      })
                        .resize(w, h, { fit: 'inside', kernel: sharp.kernel.lanczos3 })
                        .jpeg({ quality, mozjpeg: true })
                        .toBuffer()
                    } catch (rawError: any) {
                      // If raw processing fails, try as regular image
                      compressed = await sharp(imgBuffer)
                        .resize(w, h, { fit: 'inside', kernel: sharp.kernel.lanczos3 })
                        .jpeg({ quality, mozjpeg: true })
                        .toBuffer()
                    }

                    const sizeKB = compressed.length / 1024
                    console.log(`[processPDF] Compression attempt ${i + 1}: ${sizeKB.toFixed(2)} KB (q=${quality}, s=${scale.toFixed(2)})`)

                    if (sizeKB < bestSize) {
                      bestBuffer = compressed
                      bestSize = sizeKB
                    }

                    if (sizeKB <= preset.maxSizeKB) {
                      console.log(`[processPDF] ✅ Target met!`)
                      break
                    }

                    if (quality > 40) {
                      quality -= 5
                      scale -= 0.05
                    } else {
                      quality -= 3
                      scale -= 0.08
                    }

                    if (quality < 18) quality = 18
                    if (scale < 0.4) break
                  } catch (err: any) {
                    console.log(`[processPDF] Compression error: ${err.message}`)
                    // Try as regular image
                    try {
                      const compressed = await sharp(imgBuffer)
                        .resize(Math.max(400, Math.round(img.width * scale)), Math.max(400, Math.round(img.height * scale)), { fit: 'inside' })
                        .jpeg({ quality, mozjpeg: true })
                        .toBuffer()

                      const sizeKB = compressed.length / 1024
                      if (sizeKB < bestSize) {
                        bestBuffer = compressed
                        bestSize = sizeKB
                      }
                      if (sizeKB <= preset.maxSizeKB) break
                      quality -= 5
                      scale -= 0.05
                      if (quality < 20) quality = 20
                      if (scale < 0.5) break
                    } catch (e) {
                      break
                    }
                  }
                }

                if (bestBuffer) {
                  extractedImage = bestBuffer
                  extractedWidth = img.width
                  extractedHeight = img.height
                  console.log(`[processPDF] ✅ Image compressed to ${bestSize.toFixed(2)} KB`)
                  console.log(`[processPDF] ✅ extractedImage is now set: ${extractedImage ? 'YES' : 'NO'}, size: ${(extractedImage.length / 1024).toFixed(2)} KB`)
                } else {
                  console.log(`[processPDF] ❌ Could not compress image - bestBuffer is null`)
                }
              } catch (imgError: any) {
                console.log(`[processPDF] Error processing image: ${imgError.message}`)
                console.log(`[processPDF] Error stack: ${imgError.stack}`)
              }
            } else {
              console.log(`[processPDF] ❌ largestImage is null - no image to process`)
            }
          } else {
            console.log(`[processPDF] ❌ xObjects is null or empty - no images found`)
          }
        } catch (pdfjsError: any) {
          console.log(`[processPDF] pdfjs-dist extraction error: ${pdfjsError.message}`)
          console.log(`[processPDF] Error stack: ${pdfjsError.stack}`)
        }

        console.log(`[processPDF] After extraction, extractedImage is: ${extractedImage ? `SET (${(extractedImage.length / 1024).toFixed(2)} KB)` : 'NULL'}`)

        // If we extracted an image, embed it back into PDF
        if (extractedImage) {
          console.log(`[processPDF] ✅ Proceeding to embed compressed image into PDF`)
          console.log(`[processPDF] Embedding compressed image into PDF...`)
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

          const compressedBytes = await newPdfDoc.save()
          const compressedSizeKB = compressedBytes.length / 1024

          await fs.writeFile(outputPath, compressedBytes)

          console.log(`\n========== PDF COMPRESSION SUMMARY ==========`)
          console.log(`[processPDF] Original: ${inputSizeKB.toFixed(2)} KB`)
          console.log(`[processPDF] Compressed: ${compressedSizeKB.toFixed(2)} KB`)
          console.log(`[processPDF] Reduction: ${((1 - compressedSizeKB / inputSizeKB) * 100).toFixed(1)}%`)
          console.log(`[processPDF] Method: pdfjs-dist image extraction`)
          if (compressedSizeKB <= preset.maxSizeKB) {
            console.log(`[processPDF] ✅ Target met!`)
          } else {
            console.log(`[processPDF] ⚠️  Still above target (${preset.maxSizeKB} KB)`)
          }
          console.log(`=============================================\n`)

          if (compressedSizeKB <= preset.maxSizeKB) {
            reportProgress('complete', 100, `✅ Compressed to ${compressedSizeKB.toFixed(2)} KB`)
          } else {
            reportProgress('complete', 100, `Compressed to ${compressedSizeKB.toFixed(2)} KB (target: ${preset.maxSizeKB} KB)`)
          }
          return outputPath
        } else {
          console.log(`[processPDF] ❌ No images extracted from PDF`)
        }

        // Strategy 2: Try canvas-based rendering (requires canvas, may not work on all hosts)
        if (createCanvas) {
          console.log(`[processPDF] Canvas available, trying PDF rendering...`)

          const page = pages[0]
          const { width, height } = page.getSize()
          console.log(`[processPDF] Page dimensions: ${width}x${height}`)

          let imageBuffer: Buffer | null = null
          let quality = 55
          let scaleFactor = 0.85

          // Try rendering PDF to image with progressive compression
          for (let attempt = 0; attempt < 25; attempt++) {
            try {
              console.log(`[processPDF] Rendering attempt ${attempt + 1}: quality=${quality}, scale=${scaleFactor.toFixed(2)}`)

              const renderWidth = Math.max(400, Math.round(width * scaleFactor))
              const renderHeight = Math.max(400, Math.round(height * scaleFactor))

              // Create canvas and render PDF
              const canvas = createCanvas(renderWidth, renderHeight)
              const ctx = canvas.getContext('2d')

              // Load PDF with pdfjs (convert Buffer to Uint8Array)
              const pdfUint8Array = new Uint8Array(pdfBytes)
              console.log(`[processPDF] Loading PDF for rendering...`)
              const loadingTask = pdfjsLib.getDocument({
                data: pdfUint8Array,
                standardFontDataUrl: path.join(process.cwd(), 'node_modules/pdfjs-dist/standard_fonts/')
              })
              const pdfDocument = await loadingTask.promise
              const pdfPage = await pdfDocument.getPage(1)
              console.log(`[processPDF] PDF page 1 loaded`)

              const viewport = pdfPage.getViewport({ scale: scaleFactor })

              const renderContext = {
                canvasContext: ctx as any,
                viewport: viewport,
              }

              await pdfPage.render(renderContext).promise
              console.log(`[processPDF] Render success for attempt ${attempt + 1}`)
              console.log(`[processPDF] Render finished`)

              // Convert canvas to JPEG buffer with compression
              const canvasBuffer = canvas.toBuffer('image/jpeg', { quality: quality / 100 })
              const imageSizeKB = canvasBuffer.length / 1024

              console.log(`[processPDF] Rendered image: ${imageSizeKB.toFixed(2)} KB`)

              if (imageSizeKB <= preset.maxSizeKB) {
                imageBuffer = canvasBuffer
                console.log(`[processPDF] Success! Image meets size requirement`)
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
              console.error(`[processPDF] Rendering error: ${renderError.message}`)
              break
            }
          }

          if (imageBuffer) {
            // Embed compressed image back into PDF (maintain PDF format)
            console.log(`[processPDF] Embedding compressed image into PDF...`)

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

            console.log(`\n========== PDF COMPRESSION SUMMARY ==========`)
            console.log(`[processPDF] Original PDF: ${inputSizeKB.toFixed(2)} KB`)
            console.log(`[processPDF] Compressed PDF: ${savedSizeKB.toFixed(2)} KB`)
            console.log(`[processPDF] Compression: ${((1 - savedSizeKB / inputSizeKB) * 100).toFixed(1)}%`)
            console.log(`[processPDF] Method: Canvas rendering`)
            console.log(`=============================================\n`)

            if (savedSizeKB <= preset.maxSizeKB) {
              reportProgress('complete', 100, `Processing complete! Compressed PDF: ${savedSizeKB.toFixed(2)} KB`)
            } else {
              reportProgress('complete', 100, `Warning: File size ${savedSizeKB.toFixed(2)} KB exceeds target`)
            }

            return outputPath
          }
        } else {
          console.log(`[processPDF] Canvas not available (optional dependency)`)
        }

        // Last resort: Try pdfjs-dist to render PDF (works without canvas but needs Node.js canvas polyfill)
        console.log(`[processPDF] Attempting PDF rendering with pdfjs-dist (no canvas required)...`)

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
          console.log(`[processPDF] pdfjs-dist rendering requires canvas for Node.js`)
          console.log(`[processPDF] Canvas is not available - PDF compression limited`)

        } catch (pdfjsError: any) {
          console.log(`[processPDF] pdfjs-dist rendering failed: ${pdfjsError.message}`)
        }

        // Final fallback: Optimize PDF structure (minimal compression)
        console.log(`[processPDF] All compression methods exhausted, optimizing PDF structure...`)
        const optimizedPdfDoc = await PDFDocument.create()
        const [copiedPage] = await optimizedPdfDoc.copyPages(pdfDoc, [0])
        optimizedPdfDoc.addPage(copiedPage)

        const optimizedBytes = await optimizedPdfDoc.save()
        const optimizedSizeKB = optimizedBytes.length / 1024

        await fs.writeFile(outputPath, optimizedBytes)

        console.log(`\n========== PDF COMPRESSION SUMMARY ==========`)
        console.log(`[processPDF] Original: ${inputSizeKB.toFixed(2)} KB`)
        console.log(`[processPDF] Optimized: ${optimizedSizeKB.toFixed(2)} KB`)
        console.log(`[processPDF] Target: ${preset.maxSizeKB} KB`)
        console.log(`[processPDF] Reduction: ${((1 - optimizedSizeKB / inputSizeKB) * 100).toFixed(1)}%`)
        console.log(``)
        if (optimizedSizeKB > preset.maxSizeKB) {
          console.log(`[processPDF] ⚠️  COMPRESSION FAILED - PDF cannot be compressed without canvas`)
          console.log(`[processPDF]`)
          console.log(`[processPDF] Reason: PDF has no extractable embedded images`)
          console.log(`[processPDF] Canvas: Not available (required for PDF rendering)`)
          console.log(`[processPDF]`)
          console.log(`[processPDF] 💡 SOLUTIONS:`)
          console.log(`[processPDF]`)
          console.log(`[processPDF] Option 1 (Recommended for hosting):`)
          console.log(`[processPDF]   → Convert PDF to JPEG/PNG first, then upload`)
          console.log(`[processPDF]   → Image compression works perfectly without canvas`)
          console.log(`[processPDF]`)
          console.log(`[processPDF] Option 2 (Local development only):`)
          console.log(`[processPDF]   → Install canvas: npm install canvas`)
          console.log(`[processPDF]   → Install system deps: brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman`)
          console.log(`[processPDF]`)
          console.log(`[processPDF] Option 3:`)
          console.log(`[processPDF]   → Use a scanned PDF (contains embedded images)`)
          console.log(`[processPDF]   → Scanned PDFs can be compressed without canvas`)
        }
        console.log(`=============================================\n`)

        if (optimizedSizeKB <= preset.maxSizeKB) {
          reportProgress('complete', 100, `Processing complete! Final size: ${optimizedSizeKB.toFixed(2)} KB`)
        } else {
          const message = `⚠️ Cannot compress PDF. Convert to JPEG/PNG first for compression.`
          reportProgress('complete', 100, message)
        }

        return outputPath
      } catch (conversionError: any) {
        // If all compression fails, save optimized PDF
        console.error(`[processPDF] Compression failed: ${conversionError.message}`)

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
      console.log(`[processPDF] PDF is already within size limits, saving as-is`)
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
  reportProgress: (step: string, progress: number, message: string) => void
): Promise<string> {
  console.log(`[processImage] START - Input: ${filePath}, Output: ${outputPath}`)
  reportProgress('processing', 40, 'Processing image...')

  try {
    const stats = await fs.stat(filePath)
    const originalSizeKB = stats.size / 1024
    console.log(`[processImage] Original size: ${originalSizeKB.toFixed(2)} KB, Target: ${preset.maxSizeKB} KB`)

    // Detect output format from outputPath extension
    const outputExt = path.extname(outputPath).toLowerCase()
    const isJPEG = outputExt === '.jpg' || outputExt === '.jpeg'
    const isPNG = outputExt === '.png'

    console.log(`[processImage] Output format: ${outputExt} (JPEG: ${isJPEG}, PNG: ${isPNG})`)

    let image = sharp(filePath)
    const metadata = await image.metadata()
    const targetDPI = preset.minDPI
    const currentDPI = metadata.density || 72

    reportProgress('processing', 50, 'Analyzing image...')

    // Start with original dimensions
    let currentWidth = metadata.width || 1
    let currentHeight = metadata.height || 1
    let finalQuality = 85
    let outputBuffer: Buffer

    // STEP 1: Apply image enhancements (whitening, shadow removal)
    reportProgress('optimization', 60, 'Enhancing image quality...')

    // Whitening background
    image = await whitenBackground(image)

    // Remove shadows
    if (preset.removeShadows) {
      image = image.modulate({
        brightness: 1.1,
        saturation: 0,
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
    reportProgress('optimization', 70, `Compressing to meet size requirements (target: ${preset.maxSizeKB} KB)...`)

    // CRITICAL: Don't create buffer yet - compress directly from the image pipeline
    // This avoids creating a large intermediate buffer

    // Start with aggressive compression - combine quality reduction and resizing
    let quality = 60
    let scaleFactor = 0.85
    let compressedBuffer: Buffer | null = null
    let finalSizeKB = Infinity

    // Try different combinations of quality and size until we meet requirements
    for (let attempt = 0; attempt < 40; attempt++) {
      try {
        const newWidth = Math.round(currentWidth * scaleFactor)
        const newHeight = Math.round(currentHeight * scaleFactor)

        // Don't go below minimum dimensions
        if (newWidth < 400 || newHeight < 400) {
          break
        }

        // CRITICAL: Compress directly from the image pipeline, not from a buffer
        // This ensures we're working with the processed image and compressing it
        // Maintain original format: JPEG for .jpg/.jpeg, PNG for .png
        const compressionPipeline = image
          .clone() // Clone to avoid mutating the original
          .resize(newWidth, newHeight, {
            fit: 'inside',
            kernel: sharp.kernel.lanczos3,
          })

        if (isJPEG) {
          compressedBuffer = await compressionPipeline
            .jpeg({ quality, mozjpeg: true })
            .toBuffer()
        } else if (isPNG) {
          // PNG compression: use quality 0-100, but PNG doesn't compress as well as JPEG
          // If PNG is too large, we might need to convert to JPEG
          compressedBuffer = await compressionPipeline
            .png({ quality: Math.min(quality + 20, 90), compressionLevel: 9 })
            .toBuffer()
        } else {
          // Default to JPEG for unknown formats
          compressedBuffer = await compressionPipeline
            .jpeg({ quality, mozjpeg: true })
            .toBuffer()
        }

        finalSizeKB = compressedBuffer.length / 1024

        // If we meet the requirement, stop
        if (finalSizeKB <= preset.maxSizeKB) {
          currentWidth = newWidth
          currentHeight = newHeight
          finalQuality = quality
          reportProgress('optimization', 75, `Compressed to ${finalSizeKB.toFixed(2)} KB (quality: ${quality})`)
          break
        }

        // Adjust quality and size more aggressively
        if (quality > 50) {
          quality -= 8
          scaleFactor -= 0.06
        } else if (quality > 35) {
          quality -= 5
          scaleFactor -= 0.08
        } else if (quality > 25) {
          quality -= 3
          scaleFactor -= 0.1
        } else {
          quality = Math.max(quality - 2, 18)
          scaleFactor -= 0.12
        }

        // Don't go below certain thresholds
        if (quality < 18) quality = 18
        if (scaleFactor < 0.3) scaleFactor = 0.3
      } catch (err) {
        console.error('Compression attempt failed:', err)
        break
      }
    }

    // Ensure we have a buffer
    if (!compressedBuffer) {
      throw new Error('Failed to create compressed buffer')
    }

    console.log(`[Compression Debug] After loop: ${finalSizeKB.toFixed(2)} KB, target: ${preset.maxSizeKB} KB`)

    // If still too large, apply more aggressive compression
    if (finalSizeKB > preset.maxSizeKB) {
      reportProgress('optimization', 80, `Still ${finalSizeKB.toFixed(2)} KB, applying aggressive compression...`)

      // More aggressive: lower quality and smaller size
      quality = 35
      scaleFactor = 0.55

      for (let aggressiveAttempt = 0; aggressiveAttempt < 20; aggressiveAttempt++) {
        const newWidth = Math.round(currentWidth * scaleFactor)
        const newHeight = Math.round(currentHeight * scaleFactor)

        if (newWidth < 400 || newHeight < 400) break

        const aggressivePipeline = image
          .clone()
          .resize(newWidth, newHeight, {
            fit: 'inside',
            kernel: sharp.kernel.lanczos3,
          })

        if (isJPEG) {
          compressedBuffer = await aggressivePipeline
            .jpeg({ quality, mozjpeg: true })
            .toBuffer()
        } else if (isPNG) {
          compressedBuffer = await aggressivePipeline
            .png({ quality: Math.min(quality + 20, 90), compressionLevel: 9 })
            .toBuffer()
        } else {
          compressedBuffer = await aggressivePipeline
            .jpeg({ quality, mozjpeg: true })
            .toBuffer()
        }

        finalSizeKB = compressedBuffer.length / 1024

        if (finalSizeKB <= preset.maxSizeKB) {
          currentWidth = newWidth
          currentHeight = newHeight
          finalQuality = quality
          reportProgress('optimization', 82, `Compressed to ${finalSizeKB.toFixed(2)} KB`)
          break
        }

        quality -= 2
        scaleFactor -= 0.05

        if (quality < 18) quality = 18
        if (scaleFactor < 0.35) break
      }
    }

    // If STILL too large, apply maximum compression
    if (finalSizeKB > preset.maxSizeKB) {
      reportProgress('optimization', 85, `Still ${finalSizeKB.toFixed(2)} KB, applying maximum compression...`)

      // Very aggressive: small dimensions and low quality
      const maxWidth = Math.max(400, Math.round(currentWidth * 0.4))
      const maxHeight = Math.max(400, Math.round(currentHeight * 0.4))

      const maxPipeline = image
        .clone()
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
        })

      if (isJPEG) {
        compressedBuffer = await maxPipeline
          .jpeg({ quality: 18, mozjpeg: true })
          .toBuffer()
      } else if (isPNG) {
        // PNG doesn't compress well, convert to JPEG for maximum compression
        compressedBuffer = await maxPipeline
          .jpeg({ quality: 18, mozjpeg: true })
          .toBuffer()
        // Update output path to .jpg if we converted PNG to JPEG
        if (outputPath.endsWith('.png')) {
          outputPath = outputPath.replace('.png', '.jpg')
          console.log(`[processImage] PNG too large, converted to JPEG: ${outputPath}`)
        }
      } else {
        compressedBuffer = await maxPipeline
          .jpeg({ quality: 18, mozjpeg: true })
          .toBuffer()
      }

      finalSizeKB = compressedBuffer.length / 1024
      finalQuality = 18

      reportProgress('optimization', 87, `Maximum compression: ${finalSizeKB.toFixed(2)} KB`)
    }

    console.log(`[Compression Debug] Final before save: ${finalSizeKB.toFixed(2)} KB`)

    // Use the compressed buffer directly - don't re-encode (it increases size)
    let bufferToSave = compressedBuffer

    // Final check - if still too large, apply last resort compression
    const sizeToSaveKB = bufferToSave.length / 1024
    if (sizeToSaveKB > preset.maxSizeKB * 1.1) {
      reportProgress('optimization', 90, `Still ${sizeToSaveKB.toFixed(2)} KB, applying last resort compression...`)

      // Last resort: very aggressive compression - smaller dimensions and lower quality
      const lastResortWidth = Math.max(400, Math.round(currentWidth * 0.35))
      const lastResortHeight = Math.max(400, Math.round(currentHeight * 0.35))

      const lastResortPipeline = image
        .clone()
        .resize(lastResortWidth, lastResortHeight, {
          fit: 'inside',
        })

      if (isJPEG) {
        bufferToSave = await lastResortPipeline
          .jpeg({ quality: 15, mozjpeg: true })
          .toBuffer()
      } else {
        // For PNG or other formats, convert to JPEG for maximum compression
        bufferToSave = await lastResortPipeline
          .jpeg({ quality: 15, mozjpeg: true })
          .toBuffer()
        // Update output path if we converted
        if (outputPath.endsWith('.png')) {
          outputPath = outputPath.replace('.png', '.jpg')
          console.log(`[processImage] PNG too large, converted to JPEG: ${outputPath}`)
        }
      }

      console.log(`[Compression Debug] Last resort: ${(bufferToSave.length / 1024).toFixed(2)} KB`)
    }

    // Verify the final size
    const finalSavedSizeKB = bufferToSave.length / 1024

    // Save the file
    const bufferSizeKB = bufferToSave.length / 1024
    const finalFormat = path.extname(outputPath).toLowerCase()
    console.log(`\n========== COMPRESSION SUMMARY ==========`)
    console.log(`[Compression] Saving to: ${outputPath}`)
    console.log(`[Compression] Format: ${finalFormat} (${isJPEG ? 'JPEG' : isPNG ? 'PNG' : 'Other'})`)
    console.log(`[Compression] Buffer size BEFORE save: ${bufferSizeKB.toFixed(2)} KB`)
    console.log(`[Compression] Original size: ${originalSizeKB.toFixed(2)} KB`)
    console.log(`[Compression] Target size: ${preset.maxSizeKB} KB`)
    console.log(`[Compression] Compression ratio: ${((1 - bufferSizeKB / originalSizeKB) * 100).toFixed(1)}%`)
    console.log(`=========================================\n`)

    await fs.writeFile(outputPath, bufferToSave)

    // Verify it was saved correctly
    const savedStats = await fs.stat(outputPath)
    const actualSavedSizeKB = savedStats.size / 1024

    // Log for debugging
    console.log(`\n========== FILE SAVE VERIFICATION ==========`)
    console.log(`[Compression] File saved at: ${outputPath}`)
    console.log(`[Compression] File exists: ${await fs.pathExists(outputPath)}`)
    console.log(`[Compression] Original: ${originalSizeKB.toFixed(2)} KB`)
    console.log(`[Compression] Buffer: ${bufferSizeKB.toFixed(2)} KB`)
    console.log(`[Compression] Saved file: ${actualSavedSizeKB.toFixed(2)} KB`)
    console.log(`[Compression] Target: ${preset.maxSizeKB} KB`)
    console.log(`===========================================\n`)

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
        console.log(`[extractAndCompressPDFImages] Trying pdfjs-dist extraction method...`)
        // Convert Buffer to Uint8Array (pdfjs-dist requirement)
        const pdfUint8Array = new Uint8Array(pdfBytes)
        const loadingTask = pdfjsLib.getDocument({ data: pdfUint8Array })
        const pdfDocument = await loadingTask.promise
        const pdfPage = await pdfDocument.getPage(1)

        // Get resources from the page
        const resources = await (pdfPage as any).getResources()
        console.log(`[extractAndCompressPDFImages] pdfjs resources keys:`, resources ? Object.keys(resources) : 'none')

        // Try to access XObject images
        if (resources && (resources as any).XObject) {
          const xObjects = (resources as any).XObject
          const xObjectKeys = Object.keys(xObjects)
          console.log(`[extractAndCompressPDFImages] Found ${xObjectKeys.length} XObject(s) via pdfjs`)

          for (const key of xObjectKeys) {
            try {
              const xObjectRef = xObjects[key]
              const xObject = await pdfPage.objs.get(xObjectRef)

              if (xObject && (xObject as any).subtype === 'Image') {
                console.log(`[extractAndCompressPDFImages] Found image XObject: ${key}`)
                const imgObj = xObject as any

                // Get image data
                const imageData = imgObj.data
                if (imageData && imageData.length > 0) {
                  const imageBuffer = Buffer.from(imageData)
                  const width = imgObj.width || 1000
                  const height = imgObj.height || 1000

                  console.log(`[extractAndCompressPDFImages] Extracted image: ${width}x${height}, ${(imageBuffer.length / 1024).toFixed(2)} KB`)

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
                        console.log(`[extractAndCompressPDFImages] Compression failed: ${fallbackError.message}`)
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
                    console.log(`[extractAndCompressPDFImages] Compressed via pdfjs: ${bestSizeKB.toFixed(2)} KB`)
                  }
                }
              }
            } catch (xObjError: any) {
              console.log(`[extractAndCompressPDFImages] Error processing XObject ${key}: ${xObjError.message}`)
            }
          }
        }

        if (compressedImages.length > 0) {
          console.log(`[extractAndCompressPDFImages] Successfully extracted ${compressedImages.length} image(s) using pdfjs-dist`)
          return compressedImages
        } else {
          console.log(`[extractAndCompressPDFImages] pdfjs-dist found no images`)
        }
      } catch (pdfjsError: any) {
        console.log(`[extractAndCompressPDFImages] pdfjs-dist extraction failed: ${pdfjsError.message}`)
      }
    }

    // Method 2: Fallback to pdf-lib's internal APIs
    console.log(`[extractAndCompressPDFImages] Trying pdf-lib internal extraction...`)

    // Access pdf-lib's internal PDF context
    const context = (pdfDoc as any).context

    if (!context) {
      console.log(`[extractAndCompressPDFImages] No PDF context available`)
      return compressedImages
    }

    // Get all pages
    const pages = pdfDoc.getPages()
    if (pages.length === 0) return compressedImages

    console.log(`[extractAndCompressPDFImages] Processing ${pages.length} page(s)`)

    // Try multiple methods to find images
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const page = pages[pageIndex]
      const pageNode = (page as any).node

      if (!pageNode) {
        console.log(`[extractAndCompressPDFImages] Page ${pageIndex + 1}: No page node found`)
        continue
      }

      console.log(`[extractAndCompressPDFImages] Checking page ${pageIndex + 1}...`)

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
        console.log(`[extractAndCompressPDFImages] Page ${pageIndex + 1}: No resources found`)
        continue
      }

      console.log(`[extractAndCompressPDFImages] Page ${pageIndex + 1}: Resources found`)

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
        console.log(`[extractAndCompressPDFImages] Page ${pageIndex + 1}: No XObject found`)
        continue
      }

      console.log(`[extractAndCompressPDFImages] Page ${pageIndex + 1}: XObject found`)

      // Extract image objects from XObject dictionary
      let xObjectDict = xObject.dict || xObject
      let imageKeys: string[] = []

      if (xObjectDict && typeof xObjectDict.keys === 'function') {
        imageKeys = xObjectDict.keys()
      } else if (xObjectDict && typeof xObjectDict === 'object') {
        imageKeys = Object.keys(xObjectDict)
      }

      console.log(`[extractAndCompressPDFImages] Page ${pageIndex + 1}: Found ${imageKeys.length} XObject key(s)`)

      for (const key of imageKeys) {
        try {
          console.log(`[extractAndCompressPDFImages] Processing XObject key: ${key}`)

          let imageRef
          if (typeof xObjectDict.get === 'function') {
            imageRef = xObjectDict.get(key)
          } else {
            imageRef = xObjectDict[key]
          }

          if (!imageRef) {
            console.log(`[extractAndCompressPDFImages] No reference for key ${key}`)
            continue
          }

          const imageObj = context.lookup(imageRef)

          if (!imageObj) {
            console.log(`[extractAndCompressPDFImages] Could not lookup image object for key ${key}`)
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
          console.log(`[extractAndCompressPDFImages] Subtype: ${subtypeName}`)

          if (subtypeName !== 'Image' && subtypeName !== '/Image') {
            console.log(`[extractAndCompressPDFImages] Skipping non-image XObject (${subtypeName})`)
            continue
          }

          console.log(`[extractAndCompressPDFImages] Found image object!`)

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

          console.log(`[extractAndCompressPDFImages] Image dimensions: ${width}x${height}, ColorSpace: ${colorSpace?.name || colorSpace}, Bits: ${bitsPerComponent}`)

          // Get image stream data - try multiple access methods
          let stream = imageObj.get('stream')
          if (!stream) {
            const dict = imageObj.dict || imageObj
            stream = dict?.get('stream') || dict?.stream
          }

          if (!stream) {
            console.log(`[extractAndCompressPDFImages] No stream found for image`)
            continue
          }

          let imageData = stream.contents
          if (!imageData) {
            imageData = stream.get('contents') || stream.contents
          }

          if (!imageData) {
            console.log(`[extractAndCompressPDFImages] No image data in stream`)
            continue
          }

          console.log(`[extractAndCompressPDFImages] Image data found: ${typeof imageData}, length: ${imageData?.length || 'unknown'}`)

          // Convert to buffer
          let imageBuffer: Buffer

          if (Buffer.isBuffer(imageData)) {
            imageBuffer = imageData
          } else if (imageData instanceof Uint8Array) {
            imageBuffer = Buffer.from(imageData)
          } else {
            console.log(`[extractAndCompressPDFImages] Image data is not in a supported format: ${typeof imageData}`)
            continue
          }

          console.log(`[extractAndCompressPDFImages] Extracted image: ${width}x${height}, ${(imageBuffer.length / 1024).toFixed(2)} KB`)

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

              console.log(`[extractAndCompressPDFImages] Attempt ${attempt + 1}: ${sizeKB.toFixed(2)} KB (quality=${quality}, scale=${scaleFactor.toFixed(2)})`)

              if (sizeKB < bestSizeKB) {
                bestBuffer = compressed
                bestSizeKB = sizeKB
              }

              if (sizeKB <= preset.maxSizeKB / 2) {
                console.log(`[extractAndCompressPDFImages] Target met: ${sizeKB.toFixed(2)} KB`)
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
                console.error(`[extractAndCompressPDFImages] Compression failed: ${fallbackError.message}`)
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
            console.log(`[extractAndCompressPDFImages] Compressed to: ${bestSizeKB.toFixed(2)} KB (from ${(imageBuffer.length / 1024).toFixed(2)} KB)`)
          } else {
            console.log(`[extractAndCompressPDFImages] Could not compress image ${key}`)
          }
        } catch (imgError: any) {
          console.log(`[extractAndCompressPDFImages] Error processing image ${key}: ${imgError.message}`)
          console.log(`[extractAndCompressPDFImages] Stack: ${imgError.stack}`)
          continue
        }
      }
    }

    console.log(`[extractAndCompressPDFImages] Total compressed images found: ${compressedImages.length}`)
    return compressedImages
  } catch (error: any) {
    console.error(`[extractAndCompressPDFImages] Error: ${error.message}`)
    return compressedImages
  }
}

async function whitenBackground(image: sharp.Sharp): Promise<sharp.Sharp> {
  try {
    // Convert to buffer for processing
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    // Threshold for "white" pixels
    const whiteThreshold = 200
    const whiteTarget = 255

    // Process each pixel
    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // If pixel is close to white, make it pure white
      if (r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold) {
        data[i] = whiteTarget     // R
        data[i + 1] = whiteTarget // G
        data[i + 2] = whiteTarget // B
      }
    }

    // Create new image from processed buffer
    return sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: info.channels,
      },
    })
  } catch (error) {
    // If whitening fails, return original image
    return image
  }
}



