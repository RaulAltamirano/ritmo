import { AUTH_TTL } from '@ritmo/config'
import type { NextFunction, Request, Response } from 'express'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SessionService } from '../../src/infrastructure/security/SessionService.js'
import { AuthController } from '../../src/modules/auth/controllers/AuthController.js'
import { AuthService } from '../../src/modules/auth/services/AuthService.js'

function createResponse(): Response {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
  }
  response.status.mockReturnValue(response)
  response.json.mockReturnValue(response)
  return response as unknown as Response
}

describe('SessionService.extendSessionOnRefresh', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('always extends an active unexpired session by its public sessionId', async () => {
    const now = new Date('2026-08-06T12:00:00.000Z')
    vi.useFakeTimers()
    vi.setSystemTime(now)
    const updateMany = vi.fn().mockResolvedValue({ count: 1 })
    const service = new SessionService({
      userSession: { updateMany },
    } as never)

    await expect(service.extendSessionOnRefresh('public-session-id')).resolves.toBe(
      true,
    )

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        sessionId: 'public-session-id',
        isActive: true,
        expiresAt: { gt: now },
      },
      data: {
        expiresAt: new Date(now.getTime() + AUTH_TTL.sessionMs),
        lastActivity: now,
        updatedAt: now,
      },
    })
  })

  it('returns false when no active unexpired session is updated', async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 0 })
    const service = new SessionService({
      userSession: { updateMany },
    } as never)

    await expect(service.extendSessionOnRefresh('missing-session')).resolves.toBe(false)
  })
})

describe('SessionService.isSessionActive', () => {
  it('checks the public sessionId for an active unexpired session', async () => {
    const now = new Date('2026-08-06T12:00:00.000Z')
    vi.useFakeTimers()
    vi.setSystemTime(now)
    const count = vi.fn().mockResolvedValue(1)
    const service = new SessionService({
      userSession: { count },
    } as never)

    await expect(service.isSessionActive('public-session-id')).resolves.toBe(true)

    expect(count).toHaveBeenCalledWith({
      where: {
        sessionId: 'public-session-id',
        isActive: true,
        expiresAt: { gt: now },
      },
    })
    vi.useRealTimers()
  })
})

describe('AuthService.refreshToken', () => {
  it('extends the session after successful token rotation', async () => {
    const service = new AuthService()
    const isSessionActive = vi.fn().mockResolvedValue(true)
    const extendSessionOnRefresh = vi.fn().mockResolvedValue(true)
    const internals = service as unknown as {
      getTokenInfo: () => Promise<{ userId: string; sessionId: string }>
      sessionService: {
        isSessionActive: typeof isSessionActive
        extendSessionOnRefresh: typeof extendSessionOnRefresh
      }
    }
    internals.getTokenInfo = vi
      .fn()
      .mockResolvedValue({ userId: 'user-id', sessionId: 'public-session-id' })
    internals.sessionService = { isSessionActive, extendSessionOnRefresh }
    service.tokenRotationService = {
      rotateRefreshToken: vi.fn().mockResolvedValue({
        success: true,
        newAccessToken: 'new-access',
        newRefreshToken: 'new-refresh',
      }),
    } as never

    const result = await service.refreshToken('refresh-token', {
      ipAddress: '127.0.0.1',
      userAgent: 'vitest',
    })

    expect(result.success).toBe(true)
    expect(isSessionActive).toHaveBeenCalledWith('public-session-id')
    expect(extendSessionOnRefresh).toHaveBeenCalledWith('public-session-id')
  })

  it('does not rotate when the refresh token session is invalid', async () => {
    const service = new AuthService()
    const rotateRefreshToken = vi.fn()
    const extendSessionOnRefresh = vi.fn()
    const internals = service as unknown as {
      getTokenInfo: () => Promise<{ userId: string; sessionId: string }>
      sessionService: {
        isSessionActive: () => Promise<boolean>
        extendSessionOnRefresh: typeof extendSessionOnRefresh
      }
    }
    internals.getTokenInfo = vi
      .fn()
      .mockResolvedValue({ userId: 'user-id', sessionId: 'expired-session' })
    internals.sessionService = {
      isSessionActive: vi.fn().mockResolvedValue(false),
      extendSessionOnRefresh,
    }
    service.tokenRotationService = {
      rotateRefreshToken,
    } as never

    await expect(
      service.refreshToken('refresh-token', {
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
      }),
    ).resolves.toEqual({
      success: false,
      error: 'Session is invalid or expired',
    })
    expect(rotateRefreshToken).not.toHaveBeenCalled()
    expect(extendSessionOnRefresh).not.toHaveBeenCalled()
  })

  it('does not extend the session when token rotation fails', async () => {
    const service = new AuthService()
    const extendSessionOnRefresh = vi.fn()
    const internals = service as unknown as {
      getTokenInfo: () => Promise<{ userId: string; sessionId: string }>
      sessionService: {
        isSessionActive: () => Promise<boolean>
        extendSessionOnRefresh: typeof extendSessionOnRefresh
      }
    }
    internals.getTokenInfo = vi
      .fn()
      .mockResolvedValue({ userId: 'user-id', sessionId: 'public-session-id' })
    internals.sessionService = {
      isSessionActive: vi.fn().mockResolvedValue(true),
      extendSessionOnRefresh,
    }
    service.tokenRotationService = {
      rotateRefreshToken: vi.fn().mockResolvedValue({
        success: false,
        error: 'Rotation failed',
      }),
    } as never

    await expect(
      service.refreshToken('refresh-token', {
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
      }),
    ).resolves.toEqual({
      success: false,
      error: 'Rotation failed',
    })
    expect(extendSessionOnRefresh).not.toHaveBeenCalled()
  })

  it('revokes the new refresh family when extend fails after rotation', async () => {
    const service = new AuthService()
    const isSessionActive = vi.fn().mockResolvedValue(true)
    const extendSessionOnRefresh = vi.fn().mockResolvedValue(false)
    const revokeRotatedRefreshFamily = vi.fn().mockResolvedValue(undefined)
    const internals = service as unknown as {
      getTokenInfo: () => Promise<{ userId: string; sessionId: string }>
      sessionService: {
        isSessionActive: typeof isSessionActive
        extendSessionOnRefresh: typeof extendSessionOnRefresh
      }
      revokeRotatedRefreshFamily: typeof revokeRotatedRefreshFamily
    }
    internals.getTokenInfo = vi
      .fn()
      .mockResolvedValue({ userId: 'user-id', sessionId: 'public-session-id' })
    internals.sessionService = { isSessionActive, extendSessionOnRefresh }
    internals.revokeRotatedRefreshFamily = revokeRotatedRefreshFamily
    service.tokenRotationService = {
      rotateRefreshToken: vi.fn().mockResolvedValue({
        success: true,
        newAccessToken: 'new-access',
        newRefreshToken: 'new-refresh',
      }),
    } as never

    await expect(
      service.refreshToken('refresh-token', {
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
      }),
    ).resolves.toEqual({
      success: false,
      error: 'Session is invalid or expired',
    })
    expect(revokeRotatedRefreshFamily).toHaveBeenCalledWith('new-refresh')
  })
})

describe('AuthController.refresh', () => {
  it('returns HTTP 401 when the refresh cookie is missing', async () => {
    const controller = new AuthController()
    const request = {
      cookies: {},
      headers: {},
    } as Request
    const response = createResponse()

    await controller.refresh(request, response, vi.fn() as NextFunction)

    expect(response.status).toHaveBeenCalledWith(401)
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
      }),
    )
  })

  it('returns HTTP 500 for unexpected refresh errors', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const controller = new AuthController()
    const internals = controller as unknown as {
      authService: { refreshToken: () => Promise<never> }
    }
    internals.authService = {
      refreshToken: vi.fn().mockRejectedValue(new Error('unexpected')),
    }
    const request = {
      cookies: { refresh_token: 'refresh-token' },
      headers: {},
      ip: '127.0.0.1',
    } as unknown as Request
    const response = createResponse()

    await controller.refresh(request, response, vi.fn() as NextFunction)

    expect(response.status).toHaveBeenCalledWith(500)
    expect(consoleError).toHaveBeenCalledWith('Refresh error:', expect.any(Error))
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'INTERNAL_ERROR' }),
      }),
    )
    consoleError.mockRestore()
  })
})
