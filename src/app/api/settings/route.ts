import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { DEFAULT_BRAND_CONFIG } from '@/lib/brand-config'
import { DEFAULT_WRITER_CONFIG } from '@/lib/ai-writer'

export async function GET() {
  let settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        id: 'singleton',
        brandData: JSON.stringify(DEFAULT_BRAND_CONFIG),
        writerConfig: JSON.stringify(DEFAULT_WRITER_CONFIG),
      },
    })
  }
  const s = settings as typeof settings & { writerConfig?: string }
  const rawWriter = s.writerConfig || '{}'
  const parsedWriter = JSON.parse(rawWriter)

  // Seed defaults for any missing fields (handles rows created before this feature)
  const writerConfig = Object.keys(parsedWriter).length === 0
    ? DEFAULT_WRITER_CONFIG
    : { ...DEFAULT_WRITER_CONFIG, ...parsedWriter }

  return NextResponse.json({
    ...settings,
    brandData: JSON.parse(settings.brandData || '{}'),
    writerConfig,
  })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { brandData, writerConfig, ...rest } = body
  const settings = await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: {
      ...rest,
      ...(brandData !== undefined && { brandData: JSON.stringify(brandData) }),
      ...(writerConfig !== undefined && { writerConfig: JSON.stringify(writerConfig) }),
    },
    create: {
      id: 'singleton',
      ...rest,
      brandData: brandData ? JSON.stringify(brandData) : JSON.stringify(DEFAULT_BRAND_CONFIG),
      writerConfig: writerConfig ? JSON.stringify(writerConfig) : JSON.stringify(DEFAULT_WRITER_CONFIG),
    },
  })
  const s = settings as typeof settings & { writerConfig?: string }
  return NextResponse.json({
    ...settings,
    brandData: JSON.parse(settings.brandData || '{}'),
    writerConfig: JSON.parse(s.writerConfig || '{}'),
  })
}
