import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateImage, LogoCompositeOptions } from '@/lib/image-generator'
import { selectLogoKey, selectBestVariant, DEFAULT_BRAND_CONFIG } from '@/lib/brand-config'
import { BrandConfig } from '@/types'

export async function POST(req: Request) {
  const { prompt, postId, topic, solutionName, logoKey: providedLogoKey, visualConcept, imageText } = await req.json()
  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })

  if (!settings?.openaiApiKey) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 400 })
  }

  const brandData: BrandConfig = settings.brandData
    ? JSON.parse(settings.brandData)
    : DEFAULT_BRAND_CONFIG

  // Resolve which logo to composite
  let logoOptions: LogoCompositeOptions | undefined

  const logoKey = providedLogoKey || (topic ? await selectLogoKey(topic, solutionName) : null)

  if (logoKey) {
    const logo = brandData.logos.find(l => l.key === logoKey)
    if (logo) {
      const variant = selectBestVariant(logoKey, visualConcept || '', brandData)
      if (variant?.filePath) {
        logoOptions = {
          logoFilePath: variant.filePath,
          placement: logo.preferredPlacement,
          minClearSpace: logo.minClearSpace,
        }
      }
    }
  }

  try {
    const result = await generateImage(settings.openaiApiKey, prompt, postId, logoOptions, imageText)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
