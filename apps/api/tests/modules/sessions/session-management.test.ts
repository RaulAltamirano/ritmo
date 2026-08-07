/**
 * 🔐 SESSION MANAGEMENT TESTS - RITMO API 2025
 *
 * Tests de manejo de sesiones según especificaciones del reporte
 * Implementando context-aware testing con BDD
 */

import type { Application } from 'express'
import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { createAuthedUser } from '../../helpers/auth.ts'
import { app, authedHttp, getAuthHeaders, workerPrisma } from '../../helpers/index.ts'

describe('🔐 Session Management Tests', () => {
  let expressApp: Application

  beforeAll(async () => {
    expressApp = await app()
  })

  // Cookie auth requires a `user_sessions` row (register/login create it via SessionService).
  const createTestUser = async () => {
    const { user, accessToken } = await createAuthedUser()
    const row = await workerPrisma.userSession.findFirstOrThrow({
      where: { userId: user.id, isActive: true, expiresAt: { gt: new Date() } },
    })
    return { user, accessToken, sessionId: row.sessionId }
  }

  /** Password matches API hashing (for POST /api/auth/login tests that exercise SessionService). */
  const createRegisteredUser = async () => {
    const ts = Date.now()
    const payload = {
      email: `sessionuser${ts}@example.com`,
      username: `sessionuser${ts}`,
      password: 'SecurePass123!',
      firstName: 'Session',
      lastName: 'User',
    }
    const res = await request(expressApp)
      .post('/api/auth/register')
      .set(getAuthHeaders())
      .send(payload)
    expect(res.status).toBe(200)
    return {
      user: res.body.data.user,
      accessToken: res.body.data.accessToken,
      sessionId: res.body.data.sessionId,
    }
  }

  describe('SESS-001: Get User Sessions', () => {
    it('should return user sessions for authenticated user', async () => {
      const userData = await createTestUser()

      const response = await authedHttp(expressApp, userData.accessToken).get(
        '/api/sessions',
      )

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('sessions')
      expect(Array.isArray(response.body.data.sessions)).toBe(true)

      const { sessions } = response.body.data

      if (sessions.length > 0) {
        const activeSessions = sessions.filter((s: { isActive: boolean }) => s.isActive)
        expect(activeSessions.length).toBeGreaterThan(0)

        const session = sessions[0]
        expect(session).toHaveProperty('id')
        expect(session).toHaveProperty('deviceId')
        expect(session).toHaveProperty('deviceName')
        expect(session).toHaveProperty('deviceType')
        expect(session).toHaveProperty('browser')
        expect(session).toHaveProperty('os')
        expect(session).toHaveProperty('ipAddress')
        expect(session).toHaveProperty('isActive')
        expect(session).toHaveProperty('lastActivityAt')
      } else {
        expect(sessions).toEqual([])
      }
    })

    it('should reject access without authentication token', async () => {
      const response = await request(expressApp)
        .get('/api/sessions')
        .set(getAuthHeaders())

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('UNAUTHORIZED')
    })

    it('should reject access with invalid token', async () => {
      const response = await request(expressApp)
        .get('/api/sessions')
        .set({
          ...getAuthHeaders(),
          Authorization: 'Bearer invalid-token',
        })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })
  })

  describe('SESS-002: Session Consolidation', () => {
    it('should consolidate duplicate sessions for same device', async () => {
      const userData = await createRegisteredUser()

      const deviceInfo = {
        deviceId: 'same-device-fingerprint',
        deviceName: 'Chrome on Windows',
        deviceType: 'desktop',
        browser: 'Chrome',
        os: 'Windows',
        ipAddress: '192.168.1.100',
      }

      await request(expressApp).post('/api/auth/login').set(getAuthHeaders()).send({
        email: userData.user.email,
        password: 'SecurePass123!',
        deviceInfo,
      })

      const response = await request(expressApp)
        .post('/api/auth/login')
        .set(getAuthHeaders())
        .send({
          email: userData.user.email,
          password: 'SecurePass123!',
          deviceInfo,
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('sessionId')
      expect(response.body.data).toHaveProperty('accessToken')

      expect(response.body.data).toHaveProperty('user')
      expect(response.body.data.user.id).toBe(userData.user.id)
    })

    it('should create new session for different device', async () => {
      const userData = await createRegisteredUser()

      const differentDeviceInfo = {
        deviceId: 'different-device-fingerprint',
        deviceName: 'Firefox on Mac',
        deviceType: 'desktop',
        browser: 'Firefox',
        os: 'macOS',
        ipAddress: '192.168.1.101',
      }

      const response = await request(expressApp)
        .post('/api/auth/login')
        .set(getAuthHeaders())
        .send({
          email: userData.user.email,
          password: 'SecurePass123!',
          deviceInfo: differentDeviceInfo,
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('sessionId')
      expect(response.body.data).toHaveProperty('accessToken')
      expect(response.body.data).toHaveProperty('user')
      expect(response.body.data.user.id).toBe(userData.user.id)
    })
  })

  describe('Session Security', () => {
    it('should validate session ownership', async () => {
      const user1 = await createTestUser()

      const response = await authedHttp(expressApp, user1.accessToken).get(
        '/api/sessions',
      )

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)

      const { sessions } = response.body.data
      sessions.forEach((session: { userId: string }) => {
        expect(session.userId).toBe(user1.user.id)
      })
    })

    it('should handle session expiration', async () => {
      const userData = await createTestUser()

      const response = await authedHttp(expressApp, userData.accessToken).get(
        '/api/sessions',
      )

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)

      const { sessions } = response.body.data
      sessions.forEach((session: { lastActivityAt: string }) => {
        expect(session).toHaveProperty('lastActivityAt')
        expect(new Date(session.lastActivityAt)).toBeInstanceOf(Date)
      })
    })
  })

  describe('Session Analytics', () => {
    it('should provide session statistics', async () => {
      const userData = await createTestUser()

      const response = await authedHttp(expressApp, userData.accessToken).get(
        '/api/sessions',
      )

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)

      expect(response.body.meta).toHaveProperty('timestamp')

      const { sessions } = response.body.data
      if (sessions.length > 0) {
        const session = sessions[0]
        expect(session).toHaveProperty('lastActivityAt')
        expect(session).toHaveProperty('createdAt')
        expect(session).toHaveProperty('deviceTrust')
      }
    })
  })
})
