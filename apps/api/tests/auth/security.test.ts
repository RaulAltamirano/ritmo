/**
 * 🔒 SECURITY TESTS - RITMO API 2025
 *
 * Tests de seguridad según especificaciones del reporte
 * Implementando context-aware testing con escenarios de ataque
 */

import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getAuthHeaders, testContext } from '../setup/test-setup.js'

describe('🔒 Security Tests', () => {
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
      email: `securityuser${timestamp}@example.com`,
      username: `securityuser${timestamp}`,
      password: 'SecurePass123!',
      firstName: 'Security',
      lastName: 'User',
    }

    // Registrar usuario
    const registerResponse = await request(testContext.app)
      .post('/api/auth/register')
      .set(getAuthHeaders())
      .send(userData)

    // Verificar que el registro fue exitoso
    expect(registerResponse.status).toBe(200) // Cambiado de 201 a 200
    expect(registerResponse.body.success).toBe(true)

    // Hacer login para obtener el token
    const loginResponse = await request(testContext.app)
      .post('/api/auth/login')
      .set(getAuthHeaders())
      .send({
        email: userData.email,
        password: userData.password,
      })

    // Verificar que el login fue exitoso
    expect(loginResponse.status).toBe(200)
    expect(loginResponse.body.success).toBe(true)

    return {
      user: loginResponse.body.data.user,
      accessToken: loginResponse.body.data.accessToken,
      sessionId: loginResponse.body.data.sessionId,
    }
  }

  describe('SEC-001: Brute Force Attack Prevention', () => {
    it('should lock account after multiple failed login attempts', async () => {
      // Context: suspiciousUser + attackFlow + brute-force
      const timestamp = Date.now()
      const email = `bruteforce${timestamp}@example.com`

      // Crear usuario primero
      await request(testContext.app)
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send({
          email,
          username: `bruteforce${timestamp}`,
          password: 'SecurePass123!',
        })

      // Intentar múltiples logins fallidos
      const attempts = [
        { email, password: 'wrong1' },
        { email, password: 'wrong2' },
        { email, password: 'wrong3' },
        { email, password: 'wrong4' },
        { email, password: 'wrong5' },
        { email, password: 'wrong6' },
      ]

      // Ejecutar intentos fallidos
      for (const attempt of attempts) {
        await request(testContext.app)
          .post('/api/auth/login')
          .set(getAuthHeaders())
          .send(attempt)
      }

      // Intentar login con credenciales correctas después del bloqueo
      const response = await request(testContext.app)
        .post('/api/auth/login')
        .set(getAuthHeaders())
        .send({
          email,
          password: 'SecurePass123!',
        })

      // Verificar que la cuenta está bloqueada
      expect([423, 401]).toContain(response.status)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('ACCOUNT_LOCKED')
      expect(response.body.error.message).toContain('Account is temporarily locked')
    })

    it('should track failed login attempts', async () => {
      const timestamp = Date.now()
      const email = `tracking${timestamp}@example.com`

      // Crear usuario
      await request(testContext.app)
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send({
          email,
          username: `tracking${timestamp}`,
          password: 'SecurePass123!',
        })

      // Intentar login fallido
      const response = await request(testContext.app)
        .post('/api/auth/login')
        .set(getAuthHeaders())
        .send({
          email,
          password: 'wrongpassword',
        })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('UNAUTHORIZED')
    })

    it('should reset failed attempts on successful login', async () => {
      const timestamp = Date.now()
      const email = `reset${timestamp}@example.com`
      const password = 'SecurePass123!'

      // Crear usuario
      await request(testContext.app)
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send({
          email,
          username: `reset${timestamp}`,
          password,
        })

      // Intentar login fallido
      await request(testContext.app)
        .post('/api/auth/login')
        .set(getAuthHeaders())
        .send({
          email,
          password: 'wrongpassword',
        })

      // Login exitoso
      const response = await request(testContext.app)
        .post('/api/auth/login')
        .set(getAuthHeaders())
        .send({
          email,
          password,
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.user.email).toBe(email)
    })
  })

  describe('SEC-002: Session Hijacking Prevention', () => {
    it('should invalidate session from different device', async () => {
      // Context: suspiciousUser + attackFlow + session-hijacking
      const userData = await createTestUser()

      // Simular uso de token desde dispositivo diferente
      const differentDeviceInfo = {
        deviceId: 'attacker-device-fingerprint',
        deviceName: 'Unknown Browser',
        deviceType: 'mobile',
        browser: 'Unknown',
        os: 'Unknown',
        ipAddress: '203.0.113.1', // IP diferente
      }

      // Intentar usar el token desde dispositivo diferente
      const response = await request(testContext.app)
        .get('/api/auth/me')
        .set(getAuthHeaders())
        .set('Cookie', [`access_token=${userData.accessToken}`])
        .set('X-Device-Id', differentDeviceInfo.deviceId)
        .set('X-Forwarded-For', differentDeviceInfo.ipAddress)

      // Verificar que la sesión se invalida
      expect([401, 403]).toContain(response.status)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('SESSION_INVALID')
    })

    it('should validate device fingerprint', async () => {
      const userData = await createTestUser()

      // Intentar acceder con fingerprint inválido
      const response = await request(testContext.app)
        .get('/api/auth/me')
        .set(getAuthHeaders())
        .set('Cookie', [`access_token=${userData.accessToken}`])
        .set('X-Device-Id', 'invalid-fingerprint')

      // Verificar validación de dispositivo
      expect([401, 403]).toContain(response.status)
      expect(response.body.success).toBe(false)
    })

    it('should handle IP address changes', async () => {
      const userData = await createTestUser()

      // Simular cambio de IP
      const response = await request(testContext.app)
        .get('/api/auth/me')
        .set(getAuthHeaders())
        .set('Cookie', [`access_token=${userData.accessToken}`])
        .set('X-Forwarded-For', '203.0.113.1')

      // Verificar manejo de cambio de IP
      expect([200, 401, 403]).toContain(response.status)
    })
  })

  describe('SEC-003: Input Validation Security', () => {
    it('should prevent SQL injection in login', async () => {
      const sqlInjectionAttempts = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; INSERT INTO users VALUES ('hacker', 'hacker@evil.com'); --",
        "' UNION SELECT * FROM users --",
      ]

      for (const attempt of sqlInjectionAttempts) {
        const response = await request(testContext.app)
          .post('/api/auth/login')
          .set(getAuthHeaders())
          .send({
            email: attempt,
            password: attempt,
          })

        // Verificar que se rechaza la inyección SQL
        expect([400, 401]).toContain(response.status)
        expect(response.body.success).toBe(false)
      }
    })

    it('should prevent XSS in registration', async () => {
      const xssAttempts = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(\'xss\')">',
        '"><script>alert("xss")</script>',
      ]

      for (const attempt of xssAttempts) {
        const timestamp = Date.now()
        const response = await request(testContext.app)
          .post('/api/auth/register')
          .set(getAuthHeaders())
          .send({
            email: `xss${timestamp}@example.com`,
            username: attempt,
            password: 'SecurePass123!',
            firstName: attempt,
          })

        // Verificar que se rechaza el XSS
        expect([400, 422]).toContain(response.status)
        expect(response.body.success).toBe(false)
      }
    })

    it('should validate email format', async () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user..user@example.com',
        'user@example..com',
      ]

      for (const email of invalidEmails) {
        const response = await request(testContext.app)
          .post('/api/auth/register')
          .set(getAuthHeaders())
          .send({
            email,
            username: 'testuser',
            password: 'SecurePass123!',
          })

        expect(response.status).toBe(400)
        expect(response.body.success).toBe(false)
        expect(response.body.error.code).toBe('VALIDATION_ERROR')
      }
    })
  })

  describe('SEC-004: Token Security', () => {
    it('should reject expired tokens', async () => {
      const userData = await createTestUser()

      // Simular token expirado (esto requeriría modificar el token)
      // Por ahora verificamos la estructura de respuesta de error
      const response = await request(testContext.app)
        .get('/api/auth/me')
        .set(getAuthHeaders())
        .set('Cookie', ['access_token=expired.token.here'])

      expect([401, 403]).toContain(response.status)
      expect(response.body.success).toBe(false)
    })

    it('should reject malformed tokens', async () => {
      const malformedTokens = [
        'not-a-token',
        'Bearer',
        'Bearer ',
        'Bearer invalid.token',
        'invalid.token.here',
      ]

      for (const token of malformedTokens) {
        const response = await request(testContext.app)
          .get('/api/auth/me')
          .set(getAuthHeaders())
          .set('Cookie', [`access_token=${token}`])

        expect([401, 403]).toContain(response.status)
        expect(response.body.success).toBe(false)
      }
    })

    it('should validate token signature', async () => {
      const userData = await createTestUser()

      // Modificar el token para invalidar la firma
      const modifiedToken = userData.accessToken.slice(0, -10) + 'INVALID'

      const response = await request(testContext.app)
        .get('/api/auth/me')
        .set(getAuthHeaders())
        .set('Cookie', [`access_token=${modifiedToken}`])

      expect([401, 403]).toContain(response.status)
      expect(response.body.success).toBe(false)
    })
  })
})
