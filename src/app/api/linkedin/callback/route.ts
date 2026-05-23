import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return new Response(
      `<html><body><script>window.close()</script><p>Authentication failed: ${error}</p></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  }

  try {
    const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
    if (!settings) throw new Error('Settings not found')

    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${new URL(req.url).origin}/api/linkedin/callback`,
        client_id: settings.linkedinClientId,
        client_secret: settings.linkedinClientSecret,
      }),
    })

    const tokenData = await tokenResponse.json()
    if (!tokenData.access_token) throw new Error(`No access token received: ${JSON.stringify(tokenData)}`)

    // Get person URN via OpenID Connect userinfo endpoint
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const profile = await profileResponse.json()
    const personUrn = `urn:li:person:${profile.sub}`

    await prisma.settings.update({
      where: { id: 'singleton' },
      data: {
        linkedinAccessToken: tokenData.access_token,
        linkedinPersonUrn: personUrn,
      },
    })

    return new Response(
      `<html><body><script>window.opener?.postMessage('linkedin-connected', '*'); window.close();</script><p>Connected successfully. You can close this window.</p></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  } catch (err) {
    return new Response(
      `<html><body><script>window.close()</script><p>Error: ${err}</p></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  }
}
