import { PrismaClient } from '@prisma/client'
import { AuthService } from '../../services/AuthService'
import type { RegisterCredentials } from '~/types/auth'

const prisma = new PrismaClient()
const authService = new AuthService(prisma)

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<RegisterCredentials>(event)
    
    // Validate required fields
    if (!body.email || !body.password || !body.name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email, password, and name are required'
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

    // Validate name length
    if (body.name.trim().length < 2) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name must be at least 2 characters long'
      })
    }

    // Validate terms acceptance
    if (!body.acceptTerms) {
      throw createError({
        statusCode: 400,
        statusMessage: 'You must accept the terms and conditions'
      })
    }

    // Attempt registration
    const result = await authService.register({
      email: body.email.toLowerCase().trim(),
      password: body.password,
      name: body.name.trim(),
      acceptTerms: body.acceptTerms
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
      message: 'Registration successful'
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    
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
    case 'EMAIL_ALREADY_EXISTS':
      return 409
    case 'WEAK_PASSWORD':
      return 400
    case 'RATE_LIMIT_EXCEEDED':
      return 429
    default:
      return 400
  }
} 