import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({
    ...post,
    hashtags: JSON.parse(post.hashtags || '[]'),
    scheduledAt: post.scheduledAt?.toISOString(),
    publishedAt: post.publishedAt?.toISOString(),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { hashtags, scheduledAt, ...rest } = body
  const post = await prisma.post.update({
    where: { id },
    data: {
      ...rest,
      ...(hashtags !== undefined && { hashtags: JSON.stringify(hashtags) }),
      ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
    },
  })
  return NextResponse.json({
    ...post,
    hashtags: JSON.parse(post.hashtags || '[]'),
    scheduledAt: post.scheduledAt?.toISOString(),
    publishedAt: post.publishedAt?.toISOString(),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.post.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
