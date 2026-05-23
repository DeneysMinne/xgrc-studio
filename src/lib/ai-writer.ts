import Anthropic from '@anthropic-ai/sdk'
import { WriterConfig } from '@/types'

export const DEFAULT_WRITER_CONFIG: WriterConfig = {
  companyDescription: `XGRC Software — Enterprise governance, risk, compliance, assurance, cybersecurity, ESG, and integrated management software.
Primary tagline: Driving Compliance®
Secondary tagline: Synergy in Assurance, Strength in Compliance`,

  writingStyle: `- Professional, strategic, and practical
- Clear and human — never academic, generic, or corporate-waffle
- No hype, no exaggerated claims, no sales-heavy language
- Sound like a trusted GRC, cybersecurity, assurance, and enterprise software advisor
- Audiences: executives, board members, risk leaders, compliance officers, internal auditors, CISOs, ESG leaders, governance teams`,

  postStructure: `1. Hook — 1–2 lines that stop the scroll
2. Problem — the real business issue, clearly stated
3. Insight — why this matters strategically
4. XGRC relevance — mention XGRC platform capability naturally, never as an advert
5. Close — one thoughtful question that invites engagement
6. Hashtags — 3 to 5, on their own line at the end`,

  formatting: `- Short paragraphs (1–3 sentences max)
- No bullet lists unless they genuinely improve clarity
- No markdown formatting — no bold (**), no em dashes (—) in the body text
- 150–250 words total (body + hashtags, excluding heading)
- Do not repeat the heading in the first line of the body
- No exclamation marks`,

  approvedLanguage: `"Driving Compliance®" · "integrated governance" · "real-time visibility" · "centralised risk and control information" · "actionable insights" · "continuous improvement" · "strategic alignment" · "assurance maturity"`,

  doNotList: `- Claim XGRC provides legal, audit, or cybersecurity advice
- Invent product capabilities
- Use exclamation marks
- Use markdown formatting like **bold** or em dashes in the post body
- Use: "game-changer", "leverage", "robust", "synergies", "cutting-edge"
- Exceed 250 words
- Repeat the heading at the start of the body`,

  customOverride: '',
}

export function buildSystemPrompt(config: WriterConfig): string {
  if (config.customOverride?.trim()) {
    return config.customOverride.trim()
  }

  return `You are XGRC_LINKEDIN_WRITER — the senior thought leadership writer for XGRC Software.

COMPANY:
${config.companyDescription}

WRITING STYLE:
${config.writingStyle}

POST STRUCTURE (always follow this):
${config.postStructure}

FORMATTING:
${config.formatting}

APPROVED LANGUAGE — use naturally where appropriate:
${config.approvedLanguage}

DO NOT:
${config.doNotList}`
}

// Keep the original constant as a fallback (uses default config)
export const XGRC_WRITER_PROFILE = buildSystemPrompt(DEFAULT_WRITER_CONFIG)

export const STRUCTURED_OUTPUT_INSTRUCTIONS = `
Write the LinkedIn post following your profile.

Then output this exact block — do not include it in the post, output it separately:

---XGRC_META---
HEADING: [5–9 word post title in Title Case]
VISUAL_CONCEPT: [2–3 sentences. Describe the image's visual metaphor, mood, and key graphic elements. No logos, no text overlays — pure visual description.]
IMAGE_TEXT: [Maximum 4 words for image title text, e.g. "Integrated Assurance" or "Cyber Resilience"]
COMPLIANCE_NOTES: [Brief note or "None"]
---END_META---
`

interface GenerateOptions {
  topic: string
  additionalContext?: string
  audience?: string
  solutionName?: string
  angle?: string
}

export function buildPrompt(opts: GenerateOptions): string {
  const parts = [`Topic: ${opts.topic}`]
  if (opts.audience) parts.push(`Target audience: ${opts.audience}`)
  if (opts.solutionName) parts.push(`Highlight solution: ${opts.solutionName}`)
  if (opts.angle) parts.push(`Angle/focus: ${opts.angle}`)
  if (opts.additionalContext) parts.push(`Additional context: ${opts.additionalContext}`)
  parts.push(STRUCTURED_OUTPUT_INSTRUCTIONS)
  return parts.join('\n\n')
}

export function parseMeta(fullResponse: string): {
  heading: string
  visualConcept: string
  imageText: string
  complianceNotes: string
} {
  const metaMatch = fullResponse.match(/---XGRC_META---([\s\S]*?)---END_META---/)
  if (!metaMatch) {
    return { heading: '', visualConcept: '', imageText: '', complianceNotes: '' }
  }
  const meta = metaMatch[1]
  const extract = (key: string) => {
    const match = meta.match(new RegExp(`${key}:\\s*([\\s\\S]+?)(?=\\n[A-Z_]+:|$)`))
    return match ? match[1].trim() : ''
  }
  return {
    heading: extract('HEADING'),
    visualConcept: extract('VISUAL_CONCEPT'),
    imageText: extract('IMAGE_TEXT'),
    complianceNotes: extract('COMPLIANCE_NOTES'),
  }
}

export async function refinePost(
  apiKey: string,
  originalPost: string,
  heading: string,
  instructions: string,
  writerConfig?: WriterConfig
): Promise<{ post: string; heading: string }> {
  const client = new Anthropic({ apiKey })
  const systemPrompt = writerConfig ? buildSystemPrompt(writerConfig) : XGRC_WRITER_PROFILE

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1000,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Refine the following LinkedIn post according to these instructions.

Current heading: ${heading}

Current post:
${originalPost}

Refinement instructions: ${instructions}

Return ONLY the refined post text followed by:
---REFINED_HEADING---
[refined heading]
---END---

Keep the same structure and brand voice. Apply the refinement instructions precisely.`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const headingMatch = text.match(/---REFINED_HEADING---\s*([\s\S]*?)\s*---END---/)
  const refinedHeading = headingMatch ? headingMatch[1].trim() : heading
  const refinedPost = text.replace(/---REFINED_HEADING---[\s\S]*?---END---/, '').trim()

  return { post: refinedPost, heading: refinedHeading }
}
