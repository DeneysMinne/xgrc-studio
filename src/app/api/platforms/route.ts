import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
  const linkedinConnected = !!(settings?.linkedinAccessToken && settings?.linkedinPersonUrn)

  return NextResponse.json([
    {
      id: 'linkedin',
      displayName: 'LinkedIn',
      description: 'Publish posts to your personal LinkedIn profile or company page.',
      connected: linkedinConnected,
      available: true,
      settingsTab: 'linkedin',
    },
    {
      id: 'google_business',
      displayName: 'Google Business Profile',
      description: 'Publish posts to your Google Business Profile listing.',
      connected: false,
      available: false,
      setupInstructions: 'Before connecting, apply for Google Business Profile API access at developers.google.com/my-business. Your profile must be verified and active for 60+ days. Once approved by Google, return here to connect.',
    },
  ])
}
