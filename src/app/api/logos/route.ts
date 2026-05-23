import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { getUploadsDir } from '@/lib/storage'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const logoKey = formData.get('logoKey') as string
    const variantName = formData.get('variantName') as string

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = path.extname(file.name) || '.png'
    const safeName = `${logoKey}-${variantName.toLowerCase().replace(/[^a-z0-9]/g, '-')}${ext}`
    const uploadsDir = getUploadsDir('logos')

    await mkdir(uploadsDir, { recursive: true })
    await writeFile(path.join(uploadsDir, safeName), buffer)

    return NextResponse.json({ filePath: `/uploads/logos/${safeName}` })
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
