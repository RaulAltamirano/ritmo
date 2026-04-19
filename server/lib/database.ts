import { PrismaService } from './prisma'
import { logger } from '../utils/logger'

const log = logger.child('database')

export class DatabaseManager {
  static async initialize(): Promise<void> {
    await PrismaService.initialize()
    log.info('Database initialized')
  }

  static async healthCheck(): Promise<boolean> {
    const healthy = await PrismaService.healthCheck()
    if (healthy) {
      log.debug('Health check passed')
    } else {
      log.error('Health check failed')
    }
    return healthy
  }

  static async disconnect(): Promise<void> {
    await PrismaService.disconnect()
    log.info('Database disconnected')
  }
}

export { PrismaService }
export const prisma = PrismaService.getInstance()
