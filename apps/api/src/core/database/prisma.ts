import { PrismaClient } from '@prisma/client'
import { config } from '@ritmo/config'

// Initialize Prisma client with unified configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.database.url,
    },
  },
})

export default prisma
