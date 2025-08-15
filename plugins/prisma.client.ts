import { DatabaseManager } from '../server/lib/database'

export default defineNuxtPlugin(async () => {
  // Initialize database connection
  try {
    await DatabaseManager.initialize()
    console.log('✅ Prisma client initialized in Nuxt plugin')
  } catch (error) {
    console.error('❌ Failed to initialize Prisma client:', error)
  }

  // Provide database services to the app
  return {
    provide: {
      database: {
        healthCheck: DatabaseManager.healthCheck,
        getStats: DatabaseManager.getStats,
        reset: DatabaseManager.reset,
        seed: DatabaseManager.seed
      }
    }
  }
}) 