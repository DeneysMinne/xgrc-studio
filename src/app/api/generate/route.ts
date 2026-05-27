import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/db'
import { selectLogoKey, selectBestVariant, generateImagePrompt, getTopicHashtags, DEFAULT_BRAND_CONFIG } from '@/lib/brand-config'
import { buildPrompt, parseMeta, buildSystemPrompt, DEFAULT_WRITER_CONFIG } from '@/lib/ai-writer'
import { BrandConfig, WriterConfig } from '@/types'

export async function POST(req: Request) {
  const body = await req.json()
  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })

  if (!settings?.anthropicApiKey) {
    return new Response(JSON.stringify({ error: 'Anthropic API key not configured' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const brandData: BrandConfig = settings.brandData
    ? JSON.parse(settings.brandData)
    : DEFAULT_BRAND_CONFIG

  const rawWriter = (settings as unknown as Record<string, string>).writerConfig || '{}'
  const parsedWriter = JSON.parse(rawWriter)
  const writerConfig: WriterConfig = Object.keys(parsedWriter).length === 0
    ? DEFAULT_WRITER_CONFIG
    : { ...DEFAULT_WRITER_CONFIG, ...parsedWriter }

  const systemPrompt = buildSystemPrompt(writerConfig)

  const logoKey = await selectLogoKey(body.topic, body.solutionName)
  const hashtags = await getTopicHashtags(body.topic)

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: string) => {
        controller.enqueue(
          new TextEncoder().encode(`event: ${event}\ndata: ${data}\n\n`)
        )
      }

      try {
        const anthropic = new Anthropic({ apiKey: settings.anthropicApiKey })
        let fullResponse = ''
        let streamingDone = false

        const streamResponse = anthropic.messages.stream({
          model: 'claude-sonnet-4-5',
          max_tokens: 1200,
          system: systemPrompt,
          messages: [{ role: 'user', content: buildPrompt(body) }],
        })

        for await (const chunk of streamResponse) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            const text = chunk.delta.text
            fullResponse += text

            if (!streamingDone) {
              if (fullResponse.includes('---XGRC_META---')) {
                streamingDone = true
              } else {
                // Strip markdown bold markers before streaming to UI
                const cleanText = text.replace(/\*\*/g, '')
                if (cleanText) send('token', JSON.stringify({ text: cleanText }))
              }
            }
          }
        }

        const meta = parseMeta(fullResponse)
        // Strip markdown bold/italic markers — LinkedIn does not render markdown
        const postText = fullResponse.split('---XGRC_META---')[0].trim().replace(/\*\*/g, '').replace(/\*([^*]+)\*/g, '$1')
        const variant = selectBestVariant(logoKey, meta.visualConcept, brandData)
        const logo = brandData.logos.find(l => l.key === logoKey) ?? null
        const imagePrompt = generateImagePrompt(body.topic, logo, variant, meta.visualConcept, meta.imageText)

        send('complete', JSON.stringify({
          heading: meta.heading,
          post: postText,
          hashtags,
          logoKey,
          logoVariant: variant?.name ?? '',
          logoWarning: !variant?.filePath ? `Logo file missing for ${logoKey} — image will be generated without logo` : '',
          imagePrompt,
          imageText: meta.imageText,
          visualConcept: meta.visualConcept,
          complianceNotes: meta.complianceNotes,
        }))
      } catch (error) {
        send('error', JSON.stringify({ error: String(error) }))
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
