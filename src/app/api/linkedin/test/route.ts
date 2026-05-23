import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
  if (!settings?.linkedinAccessToken) {
    return NextResponse.json({ error: 'No access token' }, { status: 400 })
  }
  try {
    const res = await fetch('https://api.linkedin.com/v2/me', {
      headers: { Authorization: `Bearer ${settings.linkedinAccessToken}` },
    })
    if (!res.ok) throw new Error('API returned ' + res.status)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Connection failed' }, { status: 401 })
  }
}
