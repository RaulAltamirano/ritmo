import { authService } from '../../services/AuthService'
import { ok } from '../../utils/response'
import { isAppError } from '../../utils/errors'

export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, 'refresh_token')

  if (!refreshToken) {
    throw createError({ statusCode: 401, statusMessage: 'No refresh token provided' })
  }

  try {
    const result = authService.refreshAccessToken(refreshToken)

    setCookie(event, 'access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: result.expiresIn,
      path: '/',
    })

    return ok(result, 'Token refreshed successfully')
  } catch (error) {
    if (isAppError(error)) {
      deleteCookie(event, 'refresh_token', { path: '/' })
      throw createError({ statusCode: error.statusCode, statusMessage: error.message })
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
