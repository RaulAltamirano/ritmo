import { PrismaClient } from '@prisma/client'
import { ActivityService } from '../../services/ActivityService'

const prisma = new PrismaClient()
const activityService = new ActivityService(prisma)

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Activity ID is required'
      })
    }

    const activity = await activityService.findById(id)

    if (!activity) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Activity not found'
      })
    }

    return {
      success: true,
      data: activity
    }
  } catch (error) {
    console.error('Error fetching activity:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch activity'
    })
  }
}) 