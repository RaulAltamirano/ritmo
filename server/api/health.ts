export default defineEventHandler(async (event) => {
  // Import here to avoid issues with Prisma client initialization
  const { DatabaseManager } = await import('../lib/database')
  try {
    const isHealthy = await DatabaseManager.healthCheck()
    const stats = await DatabaseManager.getStats()
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        healthy: isHealthy,
        stats
      }
    }
  } catch (error) {
    console.error('Health check failed:', error)
    
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        healthy: false
      }
    }
  }
}) 