import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import path from 'path'

export async function POST(req: Request) {
  const { path: filePath } = await req.json()
  const fullPath = filePath.startsWith('/')
    ? path.join(process.cwd(), 'public', filePath)
    : filePath
  exec(`open -R "${fullPath}"`)
  return NextResponse.json({ ok: true })
}
