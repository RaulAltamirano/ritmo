import { authService } from '../../services/AuthService'
import { parseBody } from '../../utils/validate'
import { created } from '../../utils/response'
import { isAppError } from '../../utils/errors'
import { registerSchema } from '../../schemas/auth.schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const credentials = parseBody(registerSchema, body)

  try {
    const result = await authService.register(credentials)

    setCookie(event, 'access_token', result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: result.tokens.expiresIn,
      path: '/',
    })

    setCookie(event, 'refresh_token', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    setResponseStatus(event, 201)
    return created({ user: result.user, tokens: result.tokens }, 'Registration successful')
  } catch (error) {
    if (isAppError(error)) {
      throw createError({ statusCode: error.statusCode, statusMessage: error.message })
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
