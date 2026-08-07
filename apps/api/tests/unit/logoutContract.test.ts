import * as crypto from 'crypto'
import type { NextFunction, Request, Response } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const prismaMocks = vi.hoisted(() => ({
  findRefreshToken: vi.fn(),
  deactivateSession: vi.fn(),
}))

vi.mock('../../src/core/database/prisma.js', () => ({
  default: {
    refreshToken: {
      findFirst: prismaMocks.findRefreshToken,
    },
    userSession: {
      updateMany: prismaMocks.deactivateSession,
    },
  },
}))

import { AuthController } from '../../src/modules/auth/controllers/AuthController.js'
import { AuthService } from '../../src/modules/auth/services/AuthService.js'

function createResponse(): Response {
  const response = {
    cookie: vi.fn(),
    clearCookie: vi.fn(),
    status: vi.fn(),
    json: vi.fn(),
  }
  response.status.mockReturnValue(response)
  response.json.mockReturnValue(response)
  return response as unknown as Response
}

describe('AuthController register and logout cookies', () => {
  it('sets access and refresh cookies after registration', async () => {
    const controller = new AuthController()
    const register = vi.fn().mockResolvedValue({
      user: { id: 'user-id' },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      sessionId: 'session-id',
    })
    ;(
      controller as unknown as { authService: { register: typeof register } }
    ).authService = { register }
    const request = {
      body: {
        email: 'user@example.com',
        username: 'user',
        password: 'SecurePass123!',
      },
      headers: {},
    } as Request
    const response = createResponse()

    await controller.register(request, response, vi.fn() as NextFunction)

    expect(response.cookie).toHaveBeenCalledWith(
      'access_token',
      'access-token',
      expect.objectContaining({ httpOnly: true, path: '/' }),
    )
    expect(response.cookie).toHaveBeenCalledWith(
      'refresh_token',
      'refresh-token',
      expect.objectContaining({ httpOnly: true, path: '/' }),
    )
  })

  it('revokes the refresh token and clears auth cookies on logout', async () => {
    const controller = new AuthController()
    const logoutWithRefreshToken = vi.fn().mockResolvedValue(undefined)
    ;(
      controller as unknown as {
        authService: { logoutWithRefreshToken: typeof logoutWithRefreshToken }
      }
    ).authService = { logoutWithRefreshToken }
    const request = {
      cookies: { refresh_token: 'refresh-token' },
    } as unknown as Request
    const response = createResponse()

    await controller.logout(request, response, vi.fn() as NextFunction)

    expect(logoutWithRefreshToken).toHaveBeenCalledWith('refresh-token')
    expect(response.clearCookie).toHaveBeenCalledWith('access_token', { path: '/' })
    expect(response.clearCookie).toHaveBeenCalledWith('refresh_token', { path: '/' })
  })

  it('still clears auth cookies when revocation fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const controller = new AuthController()
    const logoutWithRefreshToken = vi.fn().mockRejectedValue(new Error('database down'))
    ;(
      controller as unknown as {
        authService: { logoutWithRefreshToken: typeof logoutWithRefreshToken }
      }
    ).authService = { logoutWithRefreshToken }
    const request = {
      cookies: { refresh_token: 'refresh-token' },
    } as unknown as Request
    const response = createResponse()

    await controller.logout(request, response, vi.fn() as NextFunction)

    expect(response.clearCookie).toHaveBeenCalledWith('access_token', { path: '/' })
    expect(response.clearCookie).toHaveBeenCalledWith('refresh_token', { path: '/' })
    expect(consoleError).toHaveBeenCalledWith(
      'Logout revoke failed:',
      expect.any(Error),
    )
    consoleError.mockRestore()
  })
})

describe('AuthService.logoutWithRefreshToken', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('revokes the token family and deactivates its session', async () => {
    const refreshToken = 'refresh-token'
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
    prismaMocks.findRefreshToken.mockResolvedValue({
      familyId: 'family-id',
      sessionId: 'session-id',
    })
    prismaMocks.deactivateSession.mockResolvedValue({ count: 1 })
    const service = new AuthService()
    const revokeTokenFamily = vi.fn().mockResolvedValue(undefined)
    service.tokenRotationService = { revokeTokenFamily } as never

    await service.logoutWithRefreshToken(refreshToken)

    expect(prismaMocks.findRefreshToken).toHaveBeenCalledWith({
      where: { tokenHash },
      select: { familyId: true, sessionId: true },
    })
    expect(revokeTokenFamily).toHaveBeenCalledWith('family-id', 'logout')
    expect(prismaMocks.deactivateSession).toHaveBeenCalledWith({
      where: { sessionId: 'session-id', isActive: true },
      data: {
        isActive: false,
        updatedAt: expect.any(Date),
      },
    })
  })

  it('does nothing when the refresh token is unknown', async () => {
    prismaMocks.findRefreshToken.mockResolvedValue(null)
    const service = new AuthService()
    const revokeTokenFamily = vi.fn()
    service.tokenRotationService = { revokeTokenFamily } as never

    await service.logoutWithRefreshToken('unknown-token')

    expect(revokeTokenFamily).not.toHaveBeenCalled()
    expect(prismaMocks.deactivateSession).not.toHaveBeenCalled()
  })

  it('revokes a token family without deactivating when no session is linked', async () => {
    prismaMocks.findRefreshToken.mockResolvedValue({
      familyId: 'family-id',
      sessionId: null,
    })
    const service = new AuthService()
    const revokeTokenFamily = vi.fn().mockResolvedValue(undefined)
    service.tokenRotationService = { revokeTokenFamily } as never

    await service.logoutWithRefreshToken('refresh-token')

    expect(revokeTokenFamily).toHaveBeenCalledWith('family-id', 'logout')
    expect(prismaMocks.deactivateSession).not.toHaveBeenCalled()
  })
})
