import { NextRequest, NextResponse } from 'next/server'
import { processDocument } from '@/lib/processor'
import { getUploadPath, getProcessedPath, ensureDirectories } from '@/lib/storage'
import path from 'path'
import fs from 'fs-extra'
import { DocumentPurpose } from '@/types'

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const sendProgress = (step: string, progress: number, message: string) => {
        const data = JSON.stringify({ step, progress, message, complete: false })
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      }

      try {
        const body = await request.json()
        const { fileId, purpose, maxSizeKB, password, dpi, darkenSignature, autoCrop, selfAttestSignatureId } = body

        if (!fileId || !purpose) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: 'Missing fileId or purpose', complete: true })}\n\n`
            )
          )
          controller.close()
          return
        }

        // Ensure directories exist
        await ensureDirectories()

        // Find the uploaded file
        const uploadDir = path.join(process.cwd(), 'uploads')
        const files = await fs.readdir(uploadDir)
        const uploadedFile = files.find(f => f.startsWith(fileId))

        if (!uploadedFile) {
          throw new Error('Uploaded file not found')
        }

        const filePath = getUploadPath(fileId, uploadedFile.replace(`${fileId}_`, ''))
        const ext = path.extname(filePath)
        const outputPath = getProcessedPath(fileId, ext)

        let selfAttestSignaturePath = undefined
        if (selfAttestSignatureId) {
          const filesInUploads = await fs.readdir(uploadDir)
          const sigFile = filesInUploads.find(f => f.startsWith(selfAttestSignatureId))
          if (sigFile) {
            selfAttestSignaturePath = getUploadPath(selfAttestSignatureId, sigFile.replace(`${selfAttestSignatureId}_`, ''))
          }
        }

        // Process document
        await processDocument({
          filePath,
          outputPath,
          purpose: purpose as DocumentPurpose,
          maxSizeKB,
          password,
          dpi,
          darkenSignature,
          autoCrop,
          selfAttestSignaturePath,
          onProgress: sendProgress,
        })

        // Send completion
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ step: 'complete', progress: 100, message: 'Processing complete!', complete: true })}\n\n`
          )
        )
        controller.close()
      } catch (error: any) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: error.message, complete: true })}\n\n`
          )
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

