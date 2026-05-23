import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { DEFAULT_TOPICS } from '@/lib/seed-data'

export async function POST() {
  for (const t of DEFAULT_TOPICS) {
    await prisma.topic.upsert({
      where: { id: `default-${t.sortOrder}` },
      update: { ...t, isDefault: true, active: true },
      create: { id: `default-${t.sortOrder}`, ...t, isDefault: true },
    })
  }
  const topics = await prisma.topic.findMany({
    where: { active: true },
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
  })
  return NextResponse.json(
    topics.map(t => ({ ...t, hashtags: JSON.parse(t.hashtags || '[]') }))
  )
}
