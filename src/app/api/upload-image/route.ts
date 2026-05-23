import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { getUploadsDir } from '@/lib/storage'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = path.extname(file.name) || '.png'
    const filename = `upload-${Date.now()}${ext}`
    const dir = getUploadsDir('images')
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, filename), buffer)
    return NextResponse.json({ imagePath: `/uploads/images/${filename}` })
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
