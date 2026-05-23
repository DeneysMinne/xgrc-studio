import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  const where = status ? { status } : {}
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.post.count({ where }),
  ])

  const parsed = posts.map(p => ({
    ...p,
    hashtags: JSON.parse(p.hashtags || '[]'),
    scheduledAt: p.scheduledAt?.toISOString(),
    publishedAt: p.publishedAt?.toISOString(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))

  return NextResponse.json({ posts: parsed, total })
}

export async function POST(req: Request) {
  const body = await req.json()
  const post = await prisma.post.create({
    data: {
      topic: body.topic,
      heading: body.heading || '',
      content: body.content,
      imagePath: body.imagePath,
      imagePrompt: body.imagePrompt,
      suggestedImageText: body.suggestedImageText,
      hashtags: JSON.stringify(body.hashtags || []),
      logoKey: body.logoKey,
      logoVariant: body.logoVariant,
      status: body.status || 'DRAFT',
      publishAs: body.publishAs || 'PERSONAL',
    },
  })
  return NextResponse.json({
    ...post,
    hashtags: JSON.parse(post.hashtags || '[]'),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  })
}
