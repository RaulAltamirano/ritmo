import { PrismaClient } from '@prisma/client'
import { ActivityService } from '../../services/ActivityService'

const prisma = new PrismaClient()
const activityService = new ActivityService(prisma)

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    
    // Parse filters from query parameters
    const filters: any = {}
    
    if (query.userId) filters.userId = query.userId as string
    if (query.type) filters.type = query.type as string
    if (query.priority) filters.priority = query.priority as string
    if (query.isCompleted !== undefined) {
      filters.isCompleted = query.isCompleted === 'true'
    }
    if (query.startDate) filters.startDate = new Date(query.startDate as string)
    if (query.endDate) filters.endDate = new Date(query.endDate as string)
    if (query.tags) {
      filters.tags = Array.isArray(query.tags) ? query.tags : [query.tags as string]
    }

    // Get activities
    const activities = await activityService.findMany(filters)

    return {
      success: true,
      data: activities,
      count: activities.length
    }
  } catch (error) {
    console.error('Error fetching activities:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch activities'
    })
  }
}) 