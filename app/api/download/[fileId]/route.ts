import { NextRequest, NextResponse } from 'next/server'
import { getProcessedPath } from '@/lib/storage'
import path from 'path'
import fs from 'fs-extra'

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const fileId = params.fileId
    const searchParams = request.nextUrl.searchParams
    const preview = searchParams.get('preview') === 'true'

    console.log(`\n========== DOWNLOAD REQUEST ==========`)
    console.log(`[Download] FileId: ${fileId}`)
    console.log(`[Download] Preview: ${preview}`)

    if (!fileId) {
      return NextResponse.json(
        { error: 'Missing fileId' },
        { status: 400 }
      )
    }

    // Find the processed file
    const processedDir = path.join(process.cwd(), 'processed')
    const files = await fs.readdir(processedDir)
    const processedFile = files.find(f => f.startsWith(fileId))

    if (!processedFile) {
      console.error(`[Download] No processed file found for fileId: ${fileId}`)
      console.error(`[Download] Available files:`, files)
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    const ext = path.extname(processedFile)
    const filePath = getProcessedPath(fileId, ext)

    // Check if file exists
    if (!(await fs.pathExists(filePath))) {
      // Try using the actual filename found
      const actualPath = path.join(processedDir, processedFile)
      if (await fs.pathExists(actualPath)) {
        const stats = await fs.stat(actualPath)
        const fileBuffer = await fs.readFile(actualPath)
        
        console.log(`[Download] Serving file: ${processedFile}, Size: ${(stats.size / 1024).toFixed(2)} KB`)
        
        const contentType = getContentType(ext)
        const headers = new Headers()
        headers.set('Content-Type', contentType)
        headers.set('Content-Length', stats.size.toString())

        if (!preview) {
          headers.set(
            'Content-Disposition',
            `attachment; filename="docfix_${fileId}${ext}"`
          )
        }

        console.log(`[Download] Serving file (fallback): ${processedFile}`)
        console.log(`[Download] File size: ${(stats.size / 1024).toFixed(2)} KB`)
        console.log(`========================================\n`)
        
        return new NextResponse(fileBuffer, {
          status: 200,
          headers,
        })
      }
      
      console.error(`[Download] File path doesn't exist: ${filePath}`)
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Read file
    const fileBuffer = await fs.readFile(filePath)
    const stats = await fs.stat(filePath)
    
    console.log(`[Download] Serving file: ${filePath}`)
    console.log(`[Download] File size: ${(stats.size / 1024).toFixed(2)} KB`)
    console.log(`========================================\n`)

    // Determine content type
    const contentType = getContentType(ext)

    // Set headers
    const headers = new Headers()
    headers.set('Content-Type', contentType)
    headers.set('Content-Length', stats.size.toString())

    if (!preview) {
      headers.set(
        'Content-Disposition',
        `attachment; filename="docfix_${fileId}${ext}"`
      )
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    })
  } catch (error: any) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to download file', message: error.message },
      { status: 500 }
    )
  }
}

function getContentType(ext: string): string {
  const contentTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
  }

  return contentTypes[ext.toLowerCase()] || 'application/octet-stream'
}

