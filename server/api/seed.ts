export default defineEventHandler(async (event) => {
  // Import here to avoid issues with Prisma client initialization
  const { DatabaseManager } = await import('../lib/database')
  // Only allow seeding in development
  if (process.env.NODE_ENV !== 'development') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Seeding is only allowed in development mode'
    })
  }

  try {
    await DatabaseManager.seed()
    
    return {
      status: 'success',
      message: 'Database seeded successfully',
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Seeding failed:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to seed database'
    })
  }
}) 