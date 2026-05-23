import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: Request) {
  const { apiKey } = await req.json()
  if (!apiKey) return NextResponse.json({ error: 'No API key' }, { status: 400 })
  try {
    const client = new OpenAI({ apiKey })
    await client.models.list()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid key' }, { status: 401 })
  }
}
