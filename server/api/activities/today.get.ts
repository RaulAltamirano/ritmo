import { PrismaClient } from '@prisma/client'
import { ActivityService } from '../../services/ActivityService'

const prisma = new PrismaClient()
const activityService = new ActivityService(prisma)

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    let userId = query.userId as string
    
    if (!userId) {
      // Try to find existing demo user
      const existingUser = await prisma.user.findFirst({
        where: { email: 'demo@ritmo.app' }
      })
      
      if (existingUser) {
        userId = existingUser.id
      } else {
        // Create demo user with hashed password
        const bcrypt = await import('bcryptjs')
        const demoPassword = process.env.DEMO_USER_PASSWORD || 'Demo123!'
        const hashedPassword = await bcrypt.hash(demoPassword, 12)
        
        const demoUser = await prisma.user.create({
          data: {
            email: 'demo@ritmo.app',
            name: 'Demo User',
            password: hashedPassword,
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            emailVerified: true
          }
        })
        userId = demoUser.id
      }
    } else {
      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })
      
      if (!user) {
        throw createError({
          statusCode: 400,
          statusMessage: 'User not found'
        })
      }
    }

    const activities = await activityService.getTodayActivities(userId)

    return {
      success: true,
      data: activities,
      count: activities.length
    }
  } catch (error) {
    console.error('Error fetching today activities:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch today activities'
    })
  }
}) 