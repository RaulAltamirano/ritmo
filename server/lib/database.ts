import { PrismaService } from './prisma'

/**
 * Database Management Module
 * Handles database initialization, migrations, and health checks
 */
export class DatabaseManager {
  /**
   * Initialize the database connection
   */
  static async initialize(): Promise<void> {
    try {
      await PrismaService.initialize()
      console.log('✅ Database initialized successfully')
    } catch (error) {
      console.error('❌ Database initialization failed:', error)
      throw error
    }
  }

  /**
   * Perform database health check
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const isHealthy = await PrismaService.healthCheck()
      if (isHealthy) {
        console.log('✅ Database health check passed')
      } else {
        console.error('❌ Database health check failed')
      }
      return isHealthy
    } catch (error) {
      console.error('❌ Database health check error:', error)
      return false
    }
  }

  /**
   * Gracefully disconnect from database
   */
  static async disconnect(): Promise<void> {
    try {
      await PrismaService.disconnect()
      console.log('✅ Database disconnected successfully')
    } catch (error) {
      console.error('❌ Database disconnection error:', error)
      throw error
    }
  }

  /**
   * Reset database (for development/testing)
   */
  static async reset(): Promise<void> {
    try {
      const prisma = PrismaService.getInstance()
      
      // Delete all data in reverse order of dependencies
      await prisma.activityMetric.deleteMany()
      await prisma.scheduleBlock.deleteMany()
      await prisma.schedule.deleteMany()
      await prisma.activity.deleteMany()
      await prisma.userPreference.deleteMany()
      await prisma.profile.deleteMany()
      await prisma.user.deleteMany()
      
      console.log('✅ Database reset completed')
    } catch (error) {
      console.error('❌ Database reset failed:', error)
      throw error
    }
  }

  /**
   * Seed database with initial data
   */
  static async seed(): Promise<void> {
    try {
      const prisma = PrismaService.getInstance()
      
      // Create a sample user
      const user = await prisma.user.create({
        data: {
          email: 'demo@example.com',
          name: 'Demo User',
          profile: {
            create: {
              bio: 'This is a demo user for testing purposes',
              timezone: 'UTC',
              language: 'en'
            }
          }
        }
      })

      // Create sample activities
      const activities = await Promise.all([
        prisma.activity.create({
          data: {
            userId: user.id,
            title: 'Morning Workout',
            description: 'Daily exercise routine',
            type: 'EXERCISE',
            duration: 30,
            startTime: new Date('2024-01-01T07:00:00Z'),
            endTime: new Date('2024-01-01T07:30:00Z'),
            priority: 'HIGH',
            tags: ['fitness', 'morning']
          }
        }),
        prisma.activity.create({
          data: {
            userId: user.id,
            title: 'Project Planning',
            description: 'Plan the next sprint',
            type: 'WORK',
            duration: 60,
            startTime: new Date('2024-01-01T09:00:00Z'),
            endTime: new Date('2024-01-01T10:00:00Z'),
            priority: 'HIGH',
            tags: ['work', 'planning']
          }
        })
      ])

      // Create a sample schedule
      const schedule = await prisma.schedule.create({
        data: {
          userId: user.id,
          name: 'Weekday Schedule',
          description: 'Regular weekday routine',
          isActive: true
        }
      })

      // Create sample schedule blocks
      await Promise.all([
        prisma.scheduleBlock.create({
          data: {
            scheduleId: schedule.id,
            dayOfWeek: 1, // Monday
            startTime: '07:00',
            endTime: '07:30',
            activityType: 'EXERCISE',
            priority: 'HIGH'
          }
        }),
        prisma.scheduleBlock.create({
          data: {
            scheduleId: schedule.id,
            dayOfWeek: 1, // Monday
            startTime: '09:00',
            endTime: '12:00',
            activityType: 'WORK',
            priority: 'HIGH'
          }
        })
      ])

      console.log('✅ Database seeded successfully')
    } catch (error) {
      console.error('❌ Database seeding failed:', error)
      throw error
    }
  }

  /**
   * Get database statistics
   */
  static async getStats(): Promise<{
    users: number
    activities: number
    schedules: number
    scheduleBlocks: number
  }> {
    try {
      const prisma = PrismaService.getInstance()
      
      const [users, activities, schedules, scheduleBlocks] = await Promise.all([
        prisma.user.count(),
        prisma.activity.count(),
        prisma.schedule.count(),
        prisma.scheduleBlock.count()
      ])

      return {
        users,
        activities,
        schedules,
        scheduleBlocks
      }
    } catch (error) {
      console.error('❌ Failed to get database stats:', error)
      throw error
    }
  }
}

// Export the PrismaService instance for convenience
export { PrismaService }
export const prisma = PrismaService.getInstance() 