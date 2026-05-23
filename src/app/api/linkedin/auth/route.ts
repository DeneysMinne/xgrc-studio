import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
  if (!settings?.linkedinClientId) {
    return NextResponse.json({ error: 'LinkedIn Client ID not configured' }, { status: 400 })
  }

  const { origin } = new URL(req.url)
  const redirectUri = `${origin}/api/linkedin/callback`

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: settings.linkedinClientId,
    redirect_uri: redirectUri,
    scope: 'openid profile email w_member_social',
    state: 'xgrc-linkedin-studio',
  })

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`
  return NextResponse.json({ url: authUrl })
}
