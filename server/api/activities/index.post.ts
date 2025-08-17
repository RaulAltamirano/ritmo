import { PrismaClient } from '@prisma/client'
import { ActivityService } from '../../services/ActivityService'

const prisma = new PrismaClient()
const activityService = new ActivityService(prisma)

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // Validate required fields
    if (!body.title) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Title is required'
      })
    }

    // Get or create demo user
    let userId = body.userId
    
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
        const hashedPassword = await bcrypt.hash('Demo123!', 12)
        
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

    // Set default values
    const now = new Date()
    const startTime = body.startTime ? new Date(body.startTime) : now
    const duration = body.duration || 25 // Default 25 minutes
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000)

    const activityData = {
      userId,
      title: body.title,
      description: body.description,
      type: body.type || 'WORK',
      duration,
      startTime,
      endTime,
      priority: body.priority || 'MEDIUM',
      tags: body.tags || []
    }

    const activity = await activityService.create(activityData)

    return {
      success: true,
      data: activity,
      message: 'Activity created successfully'
    }
  } catch (error) {
    console.error('Error creating activity:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create activity'
    })
  }
}) 