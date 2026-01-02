import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { generateFileId, getUploadPath, ensureDirectories } from '@/lib/storage'



export async function POST(request: NextRequest) {
  try {
    await ensureDirectories()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const purpose = formData.get('purpose') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!purpose) {
      return NextResponse.json(
        { error: 'No purpose provided' },
        { status: 400 }
      )
    }

    // Generate unique file ID
    const fileId = generateFileId()
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save file
    const filename = file.name
    const filePath = getUploadPath(fileId, filename)
    await writeFile(filePath, buffer)

    return NextResponse.json({
      fileId,
      filename,
      purpose,
      size: file.size,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file', message: error.message },
      { status: 500 }
    )
  }
}

