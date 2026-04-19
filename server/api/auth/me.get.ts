import { authService } from '../../services/AuthService'
import { ok } from '../../utils/response'
import { isAppError } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  const token =
    getCookie(event, 'access_token') ||
    getHeader(event, 'authorization')?.replace('Bearer ', '')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'No authentication token provided' })
  }

  try {
    const { userId } = authService.verifyAccessToken(token)
    const user = await authService.getUserById(userId)

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    return ok(user)
  } catch (error) {
    if (isAppError(error)) {
      throw createError({ statusCode: error.statusCode, statusMessage: error.message })
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
