import { PrismaClient } from '@prisma/client'
import { AuthService } from '../../services/AuthService'
import type { LoginCredentials } from '~/types/auth'

const prisma = new PrismaClient()
const authService = new AuthService(prisma)

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<LoginCredentials>(event)
    
    // Validate required fields
    if (!body.email || !body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and password are required'
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email format'
      })
    }

    // Attempt login
    const result = await authService.login({
      email: body.email.toLowerCase().trim(),
      password: body.password,
      rememberMe: body.rememberMe
    })

    // Set HTTP-only cookies for security
    setCookie(event, 'access_token', result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    })

    setCookie(event, 'refresh_token', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return {
      success: true,
      data: {
        user: result.user,
        tokens: result.tokens
      },
      message: 'Login successful'
    }
  } catch (error: any) {
    console.error('Login error:', error)
    
    // Handle specific auth errors
    if (error.code) {
      const statusCode = getAuthErrorStatusCode(error.code)
      throw createError({
        statusCode,
        statusMessage: error.message
      })
    }

    // Handle generic errors
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})

function getAuthErrorStatusCode(errorCode: string): number {
  switch (errorCode) {
    case 'INVALID_CREDENTIALS':
    case 'USER_NOT_FOUND':
      return 401
    case 'EMAIL_NOT_VERIFIED':
      return 403
    case 'ACCOUNT_LOCKED':
      return 423
    case 'RATE_LIMIT_EXCEEDED':
      return 429
    default:
      return 400
  }
} 