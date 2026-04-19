import { PrismaService } from '../lib/prisma'
import { logger } from '../utils/logger'

export default defineNitroPlugin(async (nitroApp) => {
  const log = logger.child('lifecycle')

  try {
    await PrismaService.initialize()
    log.info('Database connection established')
  } catch (error) {
    log.error('Failed to connect to database', { error })
    process.exit(1)
  }

  nitroApp.hooks.hook('close', async () => {
    await PrismaService.disconnect()
    log.info('Database connection closed')
  })
})
