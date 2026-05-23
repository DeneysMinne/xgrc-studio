const cron = require('node-cron') as typeof import('node-cron')
import { prisma } from './db'

let schedulerStarted = false

export function startScheduler() {
  if (schedulerStarted) return
  schedulerStarted = true

  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date()
      const duePosts = await prisma.post.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledAt: { lte: now },
        },
      })

      for (const post of duePosts) {
        try {
          const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
          if (!settings?.linkedinAccessToken) {
            await prisma.post.update({
              where: { id: post.id },
              data: { status: 'FAILED' },
            })
            continue
          }

          const { publishToLinkedIn } = await import('./linkedin')
          const result = await publishToLinkedIn(settings, post)

          await prisma.post.update({
            where: { id: post.id },
            data: {
              status: result.success ? 'PUBLISHED' : 'FAILED',
              linkedinPostId: result.linkedinPostId,
              publishedAt: result.success ? new Date() : undefined,
            },
          })
        } catch {
          await prisma.post.update({
            where: { id: post.id },
            data: { status: 'FAILED' },
          })
        }
      }
    } catch {
      // Scheduler error — continue
    }
  })
}
