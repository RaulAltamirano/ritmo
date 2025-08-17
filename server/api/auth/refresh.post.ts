import { PrismaClient } from '@prisma/client'
import { AuthService } from '../../services/AuthService'

const prisma = new PrismaClient()
const authService = new AuthService(prisma)

export default defineEventHandler(async (event) => {
  try {
    // Get refresh token from cookies
    const refreshToken = getCookie(event, 'refresh_token')

    if (!refreshToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No refresh token provided'
      })
    }

    // Refresh the access token
    const result = await authService.refreshToken(refreshToken)

    // Set new access token cookie
    setCookie(event, 'access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    })

    return {
      success: true,
      data: {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn
      },
      message: 'Token refreshed successfully'
    }
  } catch (error: any) {
    console.error('Token refresh error:', error)
    
    if (error.code === 'INVALID_TOKEN') {
      // Clear invalid refresh token
      deleteCookie(event, 'refresh_token', { path: '/' })
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid refresh token'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 