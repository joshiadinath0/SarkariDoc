import { NextRequest, NextResponse } from 'next/server'
import { validateDocument } from '@/lib/validator'
import { getProcessedPath } from '@/lib/storage'
import path from 'path'
import fs from 'fs-extra'
import { DocumentPurpose } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fileId = searchParams.get('fileId')
    const purpose = searchParams.get('purpose') as DocumentPurpose

    if (!fileId || !purpose) {
      return NextResponse.json(
        { error: 'Missing fileId or purpose' },
        { status: 400 }
      )
    }

    // Find the processed file
    // Check processed directory first
    const processedDir = path.join(process.cwd(), 'processed')
    const processedFiles = await fs.readdir(processedDir)
    let targetFile = processedFiles.find(f => f.startsWith(fileId))
    let isProcessed = true

    if (!targetFile) {
      // Fallback to uploads directory
      const uploadDir = path.join(process.cwd(), 'uploads')
      const uploadFiles = await fs.readdir(uploadDir)
      targetFile = uploadFiles.find(f => f.startsWith(fileId))
      isProcessed = false
    }

    if (!targetFile) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    const ext = path.extname(targetFile)
    const filePath = isProcessed
      ? path.join(process.cwd(), 'processed', targetFile)
      : path.join(process.cwd(), 'uploads', targetFile)

    // Validate document
    const validationResult = await validateDocument(filePath, purpose)

    return NextResponse.json(validationResult)
  } catch (error: any) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { error: 'Validation failed', message: error.message },
      { status: 500 }
    )
  }
}

