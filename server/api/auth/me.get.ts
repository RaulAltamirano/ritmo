import { PrismaClient } from '@prisma/client'
import { AuthService } from '../../services/AuthService'

const prisma = new PrismaClient()
const authService = new AuthService(prisma)

export default defineEventHandler(async (event) => {
  try {
    // Get token from cookies or headers
    const token = getCookie(event, 'access_token') || 
                  getHeader(event, 'authorization')?.replace('Bearer ', '')

    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No authentication token provided'
      })
    }

    // Verify token and get user ID
    const decoded = authService.verifyToken(token)
    
    // Get user data
    const user = await authService.getUserById(decoded.userId)
    
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    return {
      success: true,
      data: user,
      message: 'User data retrieved successfully'
    }
  } catch (error: any) {
    console.error('Get user error:', error)
    
    if (error.code === 'INVALID_TOKEN' || error.code === 'TOKEN_EXPIRED') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 