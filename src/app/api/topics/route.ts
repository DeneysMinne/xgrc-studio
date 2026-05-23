import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { DEFAULT_TOPICS } from '@/lib/seed-data'

async function seedIfEmpty() {
  const count = await prisma.topic.count()
  if (count === 0) {
    await prisma.topic.createMany({
      data: DEFAULT_TOPICS.map(t => ({ ...t, isDefault: true })),
    })
  }
}

export async function GET() {
  await seedIfEmpty()
  const topics = await prisma.topic.findMany({
    where: { active: true },
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
  })
  return NextResponse.json(
    topics.map(t => ({ ...t, hashtags: JSON.parse(t.hashtags || '[]') }))
  )
}

export async function POST(req: Request) {
  const body = await req.json()
  const { title, value, category, logoKey = '', hashtags = [], sortOrder = 0 } = body
  if (!title?.trim() || !value?.trim() || !category?.trim()) {
    return NextResponse.json({ error: 'title, value, and category are required' }, { status: 400 })
  }
  const topic = await prisma.topic.create({
    data: {
      title: title.trim(),
      value: value.trim(),
      category: category.trim(),
      logoKey,
      hashtags: JSON.stringify(hashtags),
      sortOrder,
      isDefault: false,
    },
  })
  return NextResponse.json({ ...topic, hashtags: JSON.parse(topic.hashtags) })
}
