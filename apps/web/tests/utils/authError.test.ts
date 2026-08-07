import { describe, expect, it } from 'vitest'
import { handleGenericError } from '@/utils/errorHandler'
import { isAuthenticationError } from '@/utils/authError'

describe('handleGenericError auth metadata', () => {
  it('preserves 401 status and UNAUTHORIZED code from ofetch error', () => {
    const raw = Object.assign(new Error('Unauthorized'), {
      status: 401,
      statusCode: 401,
      data: {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required - please login',
        },
      },
    })
    const enhanced = handleGenericError(raw, { logErrors: false })
    expect(enhanced.status).toBe(401)
    expect(isAuthenticationError(enhanced)).toBe(true)
  })

  it('treats SESSION_INVALID as auth error', () => {
    expect(
      isAuthenticationError({
        status: 401,
        data: { error: { code: 'SESSION_INVALID' } },
      }),
    ).toBe(true)
  })
})
