import { beforeEach, describe, expect, it, vi } from 'vitest'

const prismaMocks = vi.hoisted(() => ({
  findUser: vi.fn(),
  createUser: vi.fn(),
}))

vi.mock('../../src/core/database/prisma.js', () => ({
  default: {
    user: {
      findFirst: prismaMocks.findUser,
      create: prismaMocks.createUser,
    },
    refreshToken: {
      findFirst: vi.fn(),
    },
    userSession: {
      updateMany: vi.fn(),
    },
  },
}))

vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn(),
}))

vi.mock('../../src/core/utils/jwtUtils.js', () => ({
  generateAccessToken: vi.fn().mockReturnValue('access-token'),
}))

import { AuthService } from '../../src/modules/auth/services/AuthService.js'

describe('AuthService.register session', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a UserSession via SessionService after issuing tokens', async () => {
    prismaMocks.findUser.mockResolvedValue(null)
    prismaMocks.createUser.mockResolvedValue({
      id: 'user-id',
      email: 'new@example.com',
      username: 'newuser',
      firstName: 'New',
      lastName: 'User',
      avatar: null,
      timezone: 'UTC',
      language: 'es',
      isActive: true,
      isEmailVerified: false,
      role: 'user',
      createdAt: new Date('2026-08-06T12:00:00.000Z'),
      updatedAt: new Date('2026-08-06T12:00:00.000Z'),
    })

    const service = new AuthService()
    const intelligentLogin = vi.fn().mockResolvedValue({ deviceTrust: 'medium' })
    const logAuthEvent = vi.fn().mockResolvedValue(undefined)
    const createTokenFamily = vi.fn().mockResolvedValue('refresh-token')
    const internals = service as unknown as {
      sessionService: { intelligentLogin: typeof intelligentLogin }
      loggingService: { logAuthEvent: typeof logAuthEvent }
    }
    internals.sessionService = { intelligentLogin }
    internals.loggingService = { logAuthEvent }
    service.tokenRotationService = { createTokenFamily } as never

    const result = await service.register({
      email: 'new@example.com',
      username: 'newuser',
      password: 'SecurePass123!',
      firstName: 'New',
      lastName: 'User',
      deviceInfo: {
        deviceId: 'device-1',
        deviceName: 'Test Device',
        deviceType: 'desktop',
        browser: 'vitest',
        os: 'linux',
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
      },
    })

    expect(createTokenFamily).toHaveBeenCalledWith('user-id', expect.any(String))
    expect(intelligentLogin).toHaveBeenCalledWith(
      'user-id',
      expect.objectContaining({
        deviceId: 'device-1',
        deviceName: 'Test Device',
        ipAddress: '127.0.0.1',
      }),
      expect.any(String),
      '127.0.0.1',
    )
    expect(logAuthEvent).toHaveBeenCalledWith(
      'register',
      'user-id',
      expect.any(String),
      '127.0.0.1',
      'vitest',
      'User registered successfully',
      'low',
      { deviceTrust: 'medium' },
    )
    expect(result).toEqual(
      expect.objectContaining({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        sessionId: expect.any(String),
        deviceTrust: 'medium',
      }),
    )
  })
})
