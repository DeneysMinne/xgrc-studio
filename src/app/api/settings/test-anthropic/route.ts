import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: Request) {
  const { apiKey } = await req.json()
  if (!apiKey) return NextResponse.json({ error: 'No API key' }, { status: 400 })
  try {
    const client = new Anthropic({ apiKey })
    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }],
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid key' }, { status: 401 })
  }
}
