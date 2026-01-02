const fs = require('fs-extra')
const path = require('path')
const sharp = require('sharp')
const { PDFDocument } = require('pdf-lib')
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs')

async function testCompression() {
  try {
    // Use the latest uploaded PDF
    const uploadDir = path.join(__dirname, 'uploads')
    const files = await fs.readdir(uploadDir)
    const pdfFile = files.find(f => f.endsWith('.pdf'))
    
    if (!pdfFile) {
      console.log('No PDF found in uploads folder')
      return
    }
    
    const pdfPath = path.join(uploadDir, pdfFile)
    const pdfBytes = await fs.readFile(pdfPath)
    const pdfUint8Array = new Uint8Array(pdfBytes)
    
    const targetSizeKB = 200 // PAN card target
    
    console.log(`\n========== TESTING PDF COMPRESSION ==========`)
    console.log(`File: ${pdfFile}`)
    console.log(`Original size: ${(pdfBytes.length / 1024).toFixed(2)} KB`)
    console.log(`Target size: ${targetSizeKB} KB\n`)
    
    // Load PDF
    const loadingTask = pdfjsLib.getDocument({ data: pdfUint8Array })
    const pdfDocument = await loadingTask.promise
    const pdfPage = await pdfDocument.getPage(1)
    
    console.log(`✅ PDF loaded successfully`)
    
    // Get operator list
    const operatorList = await pdfPage.getOperatorList()
    console.log(`Operator list length: ${operatorList.fnArray.length}\n`)
    
    // Search for image names in operator list
    const foundImages = {}
    
    for (let i = 0; i < operatorList.fnArray.length; i++) {
      const args = operatorList.argsArray[i]
      
      if (args && Array.isArray(args) && args.length > 0 && typeof args[0] === 'string' && args[0].startsWith('img_')) {
        const imgName = args[0]
        
        if (foundImages[imgName]) continue
        
        try {
          let imgObj = null
          try {
            imgObj = await pdfPage.objs.get(imgName)
          } catch (e1) {
            try {
              imgObj = await pdfPage.commonObjs.get(imgName)
            } catch (e2) {
              // Continue
            }
          }
          
          if (imgObj && imgObj.data && imgObj.data.length > 0) {
            console.log(`✅ Found image "${imgName}": ${imgObj.width}x${imgObj.height}, ${(imgObj.data.length / 1024).toFixed(2)} KB`)
            foundImages[imgName] = imgObj
          }
        } catch (e) {
          // Continue
        }
      }
    }
    
    if (Object.keys(foundImages).length === 0) {
      console.log(`❌ No images found`)
      return
    }
    
    // Find largest image
    let largestImage = null
    let largestSize = 0
    
    for (const key of Object.keys(foundImages)) {
      const img = foundImages[key]
      if (img.data.length > largestSize) {
        largestImage = img
        largestSize = img.data.length
      }
    }
    
    if (!largestImage) {
      console.log(`❌ No image data found`)
      return
    }
    
    const img = largestImage
    console.log(`\n📸 Processing largest image: ${img.width}x${img.height}, ${(img.data.length / 1024).toFixed(2)} KB\n`)
    
    // Convert to Buffer
    let imgBuffer
    if (Buffer.isBuffer(img.data)) {
      imgBuffer = img.data
    } else if (img.data instanceof Uint8Array) {
      imgBuffer = Buffer.from(img.data)
    } else if (Array.isArray(img.data)) {
      imgBuffer = Buffer.from(img.data)
    } else {
      imgBuffer = Buffer.from(img.data)
    }
    
    console.log(`Image buffer size: ${(imgBuffer.length / 1024).toFixed(2)} KB\n`)
    
    // Compress
    let quality = 50
    let scale = 0.8
    let bestBuffer = null
    let bestSize = Infinity
    
    console.log(`Starting compression...\n`)
    
    for (let i = 0; i < 25; i++) {
      try {
        const w = Math.max(400, Math.round(img.width * scale))
        const h = Math.max(400, Math.round(img.height * scale))
        
        let compressed
        try {
          compressed = await sharp(imgBuffer, {
            raw: {
              width: img.width,
              height: img.height,
              channels: 3 // Assume RGB
            }
          })
            .resize(w, h, { fit: 'inside', kernel: sharp.kernel.lanczos3 })
            .jpeg({ quality, mozjpeg: true })
            .toBuffer()
        } catch (rawError) {
          compressed = await sharp(imgBuffer)
            .resize(w, h, { fit: 'inside', kernel: sharp.kernel.lanczos3 })
            .jpeg({ quality, mozjpeg: true })
            .toBuffer()
        }
        
        const sizeKB = compressed.length / 1024
        
        if (i < 5 || sizeKB <= targetSizeKB) {
          console.log(`  Attempt ${i + 1}: ${sizeKB.toFixed(2)} KB (quality=${quality}, scale=${scale.toFixed(2)})`)
        }
        
        if (sizeKB < bestSize) {
          bestBuffer = compressed
          bestSize = sizeKB
        }
        
        if (sizeKB <= targetSizeKB) {
          console.log(`\n✅ Target met at attempt ${i + 1}!`)
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
      } catch (err) {
        console.log(`  Error: ${err.message}`)
        break
      }
    }
    
    if (!bestBuffer) {
      console.log(`\n❌ Compression failed`)
      return
    }
    
    console.log(`\n✅ Best compression: ${bestSize.toFixed(2)} KB`)
    console.log(`   Target: ${targetSizeKB} KB`)
    console.log(`   Reduction: ${((1 - bestSize / (imgBuffer.length / 1024)) * 100).toFixed(1)}%`)
    
    // Create new PDF with compressed image
    const newPdfDoc = await PDFDocument.create()
    const newPage = newPdfDoc.addPage([img.width, img.height])
    
    const jpegImage = await newPdfDoc.embedJpg(bestBuffer)
    newPage.drawImage(jpegImage, {
      x: 0,
      y: 0,
      width: img.width,
      height: img.height,
    })
    
    const compressedPdfBytes = await newPdfDoc.save()
    const compressedSizeKB = compressedPdfBytes.length / 1024
    
    console.log(`\n📄 Compressed PDF size: ${compressedSizeKB.toFixed(2)} KB`)
    console.log(`   Original PDF: ${(pdfBytes.length / 1024).toFixed(2)} KB`)
    console.log(`   Reduction: ${((1 - compressedSizeKB / (pdfBytes.length / 1024)) * 100).toFixed(1)}%`)
    
    // Save test output
    const outputPath = path.join(__dirname, 'test-output.pdf')
    await fs.writeFile(outputPath, compressedPdfBytes)
    console.log(`\n💾 Saved to: ${outputPath}`)
    
    if (compressedSizeKB <= targetSizeKB) {
      console.log(`\n✅ SUCCESS! PDF compressed to target size`)
    } else {
      console.log(`\n⚠️  PDF still above target (${compressedSizeKB.toFixed(2)} KB > ${targetSizeKB} KB)`)
    }
    
    console.log(`\n==========================================\n`)
  } catch (error) {
    console.error('Error:', error.message)
    console.error(error.stack)
  }
}

testCompression()

