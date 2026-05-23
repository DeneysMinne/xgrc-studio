import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { publishToLinkedIn } from '@/lib/linkedin'

export async function POST(req: Request) {
  const { postId, publishAs, scheduleAt } = await req.json()

  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post) return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })

  // Schedule for later
  if (scheduleAt) {
    await prisma.post.update({
      where: { id: postId },
      data: { status: 'SCHEDULED', publishAs, scheduledAt: new Date(scheduleAt) },
    })
    return NextResponse.json({ success: true })
  }

  // Publish immediately
  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
  if (!settings?.linkedinAccessToken) {
    return NextResponse.json({
      success: false,
      error: 'LinkedIn not connected. Go to Settings → LinkedIn to connect your account.',
    })
  }

  // Company page posting requires LinkedIn Marketing Developer Platform approval
  if (publishAs === 'COMPANY' && !settings.linkedinOrgId) {
    return NextResponse.json({
      success: false,
      error: 'Company Page publishing requires an Organization ID in Settings → LinkedIn.',
    })
  }

  if (publishAs === 'COMPANY') {
    return NextResponse.json({
      success: false,
      error: 'Company Page publishing requires LinkedIn Marketing Developer Platform approval (pending). Use "My Profile" to publish now, or use "Copy text + open LinkedIn" to post manually to the company page.',
    })
  }

  const result = await publishToLinkedIn(settings, post)

  if (result.success) {
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'PUBLISHED',
        publishAs,
        linkedinPostId: result.linkedinPostId,
        publishedAt: new Date(),
      },
    })
    return NextResponse.json({ success: true, linkedinPostId: result.linkedinPostId, linkedinPostUrl: result.linkedinPostUrl })
  } else {
    await prisma.post.update({
      where: { id: postId },
      data: { status: 'FAILED', publishAs },
    })
    return NextResponse.json({ success: false, error: result.error })
  }
}
