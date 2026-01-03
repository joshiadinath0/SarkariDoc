import fs from 'fs-extra'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import os from 'os'

// Use /tmp for serverless/production to avoid read-only filesystem errors
const BASE_DIR = process.env.NODE_ENV === 'production'
  ? path.join(os.tmpdir(), 'sarkaridoc')
  : process.cwd()

const UPLOAD_DIR = path.join(BASE_DIR, 'uploads')
const PROCESSED_DIR = path.join(BASE_DIR, 'processed')
const TEMP_DIR = path.join(BASE_DIR, 'temp')

// Ensure directories exist
export async function ensureDirectories() {
  await fs.ensureDir(UPLOAD_DIR)
  await fs.ensureDir(PROCESSED_DIR)
  await fs.ensureDir(TEMP_DIR)
}

export function getUploadPath(fileId: string, filename: string): string {
  return path.join(UPLOAD_DIR, `${fileId}_${filename}`)
}

export function getProcessedPath(fileId: string, originalExt: string): string {
  return path.join(PROCESSED_DIR, `${fileId}_processed${originalExt}`)
}

export function getTempPath(filename: string): string {
  return path.join(TEMP_DIR, filename)
}

export function generateFileId(): string {
  return uuidv4()
}

export async function cleanupOldFiles(maxAgeHours: number = 24) {
  const now = Date.now()
  const maxAge = maxAgeHours * 60 * 60 * 1000

  const directories = [UPLOAD_DIR, PROCESSED_DIR, TEMP_DIR]

  for (const dir of directories) {
    try {
      const files = await fs.readdir(dir)
      for (const file of files) {
        const filePath = path.join(dir, file)
        const stats = await fs.stat(filePath)
        const age = now - stats.mtimeMs

        if (age > maxAge) {
          await fs.remove(filePath)
        }
      }
    } catch (error) {
      // Ignore errors during cleanup
    }
  }
}

