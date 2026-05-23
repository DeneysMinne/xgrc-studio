import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { title, value, category, logoKey, hashtags, active, sortOrder } = body
  const topic = await prisma.topic.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(value !== undefined && { value: value.trim() }),
      ...(category !== undefined && { category }),
      ...(logoKey !== undefined && { logoKey }),
      ...(hashtags !== undefined && { hashtags: JSON.stringify(hashtags) }),
      ...(active !== undefined && { active }),
      ...(sortOrder !== undefined && { sortOrder }),
    },
  })
  return NextResponse.json({ ...topic, hashtags: JSON.parse(topic.hashtags) })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.topic.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
