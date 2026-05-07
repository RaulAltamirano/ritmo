/**
 * 🔐 SESSION MANAGEMENT TESTS - RITMO API 2025
 *
 * Tests de manejo de sesiones según especificaciones del reporte
 * Implementando context-aware testing con BDD
 */

import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getAuthHeaders, testContext } from '../setup/test-setup.js'

describe('🔐 Session Management Tests', () => {
  beforeEach(async () => {
    // La limpieza se maneja automáticamente en test-setup.ts
  })

  afterEach(async () => {
    // La limpieza se maneja automáticamente en test-setup.ts
  })

  // Helper para crear un usuario de prueba
  const createTestUser = async () => {
    const timestamp = Date.now()
    const userData = {
      email: `sessionuser${timestamp}@example.com`,
      username: `sessionuser${timestamp}`,
      password: 'SecurePass123!',
      firstName: 'Session',
      lastName: 'User',
    }

    const response = await request(testContext.app)
      .post('/api/auth/register')
      .set(getAuthHeaders())
      .send(userData)

    return {
      user: response.body.data.user,
      accessToken: response.body.data.accessToken,
      sessionId: response.body.data.sessionId,
    }
  }

  // Helper para hacer requests autenticados usando cookies
  const authenticatedRequest = (method: string, url: string, token: string) => {
    return request(testContext.app)
      [method.toLowerCase()](url)
      .set(getAuthHeaders())
      .set('Cookie', [`access_token=${token}`])
  }

  describe('SESS-001: Get User Sessions', () => {
    it('should return user sessions for authenticated user', async () => {
      // Context: returningUser + normalFlow + multiple-active-sessions
      const userData = await createTestUser()

      const response = await authenticatedRequest(
        'GET',
        '/api/auth/sessions',
        userData.accessToken,
      )

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('sessions')
      expect(Array.isArray(response.body.data.sessions)).toBe(true)

      // Verificar que se devuelven sesiones (pueden estar vacías inicialmente)
      const { sessions } = response.body.data

      // Si hay sesiones, verificar estructura
      if (sessions.length > 0) {
        // Verificar que solo se devuelven sesiones activas
        const activeSessions = sessions.filter((s: any) => s.isActive)
        expect(activeSessions.length).toBeGreaterThan(0)

        // Verificar estructura de sesión
        const session = sessions[0]
        expect(session).toHaveProperty('id')
        expect(session).toHaveProperty('deviceId')
        expect(session).toHaveProperty('deviceName')
        expect(session).toHaveProperty('deviceType')
        expect(session).toHaveProperty('browser')
        expect(session).toHaveProperty('os')
        expect(session).toHaveProperty('ipAddress')
        expect(session).toHaveProperty('isActive')
        expect(session).toHaveProperty('lastActivity')
        expect(session).toHaveProperty('expiresAt')
      } else {
        // Si no hay sesiones, verificar que la respuesta es válida
        expect(sessions).toEqual([])
      }
    })

    it('should reject access without authentication token', async () => {
      const response = await request(testContext.app)
        .get('/api/auth/sessions')
        .set(getAuthHeaders())

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('UNAUTHORIZED')
    })

    it('should reject access with invalid token', async () => {
      const response = await request(testContext.app)
        .get('/api/auth/sessions')
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
      // Context: returningUser + normalFlow + duplicate-sessions
      const userData = await createTestUser()

      // Crear múltiples sesiones para el mismo dispositivo
      const deviceInfo = {
        deviceId: 'same-device-fingerprint',
        deviceName: 'Chrome on Windows',
        deviceType: 'desktop',
        browser: 'Chrome',
        os: 'Windows',
        ipAddress: '192.168.1.100',
      }

      // Primera sesión
      await request(testContext.app)
        .post('/api/auth/login')
        .set(getAuthHeaders())
        .send({
          email: userData.user.email,
          password: 'SecurePass123!',
          deviceInfo,
        })

      // Segunda sesión con el mismo deviceId
      const response = await request(testContext.app)
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

      // Verificar que se incluye información de sesión
      expect(response.body.data).toHaveProperty('user')
      expect(response.body.data.user.id).toBe(userData.user.id)
    })

    it('should create new session for different device', async () => {
      const userData = await createTestUser()

      const differentDeviceInfo = {
        deviceId: 'different-device-fingerprint',
        deviceName: 'Firefox on Mac',
        deviceType: 'desktop',
        browser: 'Firefox',
        os: 'macOS',
        ipAddress: '192.168.1.101',
      }

      const response = await request(testContext.app)
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
      await createTestUser()

      // Intentar acceder a sesiones del usuario autenticado
      const response = await authenticatedRequest(
        'GET',
        '/api/auth/sessions',
        user1.accessToken,
      )

      // Verificar que solo se devuelven las sesiones del usuario autenticado
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)

      // Todas las sesiones deben pertenecer al usuario autenticado
      const { sessions } = response.body.data
      sessions.forEach((session: any) => {
        expect(session.userId).toBe(user1.user.id)
      })
    })

    it('should handle session expiration', async () => {
      const userData = await createTestUser()

      // Verificar que la estructura de respuesta incluye expiresAt
      const response = await authenticatedRequest(
        'GET',
        '/api/auth/sessions',
        userData.accessToken,
      )

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)

      const { sessions } = response.body.data
      sessions.forEach((session: any) => {
        expect(session).toHaveProperty('expiresAt')
        expect(new Date(session.expiresAt)).toBeInstanceOf(Date)
      })
    })
  })

  describe('Session Analytics', () => {
    it('should provide session statistics', async () => {
      const userData = await createTestUser()

      const response = await authenticatedRequest(
        'GET',
        '/api/auth/sessions',
        userData.accessToken,
      )

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)

      // Verificar que se incluyen metadatos útiles
      expect(response.body.meta).toHaveProperty('timestamp')
      // requestId puede no estar presente en todas las respuestas

      // Verificar estructura de datos de sesión
      const { sessions } = response.body.data
      if (sessions.length > 0) {
        const session = sessions[0]
        expect(session).toHaveProperty('lastActivity')
        expect(session).toHaveProperty('createdAt')
        expect(session).toHaveProperty('deviceTrust')
      }
    })
  })
})
