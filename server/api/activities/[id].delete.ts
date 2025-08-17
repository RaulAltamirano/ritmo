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

    // Check if activity exists
    const existingActivity = await activityService.findById(id)
    if (!existingActivity) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Activity not found'
      })
    }

    // Delete activity
    await activityService.delete(id)

    return {
      success: true,
      message: 'Activity deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting activity:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete activity'
    })
  }
}) 