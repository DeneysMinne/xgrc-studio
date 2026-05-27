import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { refinePost, DEFAULT_WRITER_CONFIG } from '@/lib/ai-writer'
import { WriterConfig } from '@/types'

export async function POST(req: Request) {
  const { originalPost, heading, instructions } = await req.json()
  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })

  if (!settings?.anthropicApiKey) {
    return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 400 })
  }

  const rawWriter = (settings as unknown as Record<string, string>).writerConfig || '{}'
  const parsedWriter = JSON.parse(rawWriter)
  const writerConfig: WriterConfig = Object.keys(parsedWriter).length === 0
    ? DEFAULT_WRITER_CONFIG
    : { ...DEFAULT_WRITER_CONFIG, ...parsedWriter }

  try {
    const result = await refinePost(settings.anthropicApiKey, originalPost, heading, instructions, writerConfig)
    // Strip markdown bold/italic and em/en dashes
    result.post = result.post
      .replace(/\*\*/g, '').replace(/\*([^*]+)\*/g, '$1')
      .replace(/—/g, ' - ').replace(/–/g, ' - ')
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
