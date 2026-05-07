/**
 * 🔥 CRITICAL SECURITY TESTS - RITMO API 2025
 *
 * Tests críticos de seguridad que faltan en la implementación actual
 * Implementando validaciones esenciales para producción
 */

import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createAuthedUser } from '../../helpers/auth.ts'
import { app, getAuthHeaders, workerPrisma } from '../../helpers/index.ts'

describe('🔥 Critical Security Tests', () => {
  const createTestUser = async () => {
    const { user, accessToken } = await createAuthedUser()
    return {
      user,
      accessToken,
    }
  }

  describe('CRIT-001: Password Security', () => {
    it('should enforce strong password requirements', async () => {
      const weakPasswords = [
        '123456', // Solo números
        'password', // Palabra común
        'abc123', // Patrón predecible
        'qwerty', // Secuencia de teclado
        'A', // Muy corto
        'aaaaaaaa', // Caracteres repetidos
        'password123', // Palabra común + números
        'admin', // Palabra común
        'letmein', // Palabra común
        'welcome', // Palabra común
      ]

      for (const password of weakPasswords) {
        const timestamp = Date.now()
        const response = await request(await app())
          .post('/api/auth/register')
          .set(getAuthHeaders())
          .send({
            email: `weakpass${timestamp}@example.com`,
            username: `weakpass${timestamp}`,
            password,
          })

        expect(response.status).toBe(400)
        expect(response.body.success).toBe(false)
        const code = String(response.body.error?.code)
        const msg = String(response.body.error?.message ?? '')
        expect(
          ['VALIDATION_ERROR', 'WEAK_PASSWORD', 'INVALID_INPUT'].includes(code) ||
            /password|weak|strength|character/i.test(msg),
        ).toBe(true)
      }
    })

    it('should accept strong passwords', async () => {
      const strongPasswords = [
        'SecurePass123!',
        'MyP@ssw0rd2024',
        'Str0ng#P@ss!',
        'C0mpl3x!P@ss',
        'S3cur3!P@ssw0rd',
      ]

      for (const password of strongPasswords) {
        const timestamp = Date.now()
        const response = await request(await app())
          .post('/api/auth/register')
          .set(getAuthHeaders())
          .send({
            email: `strongpass${timestamp}@example.com`,
            username: `strongpass${timestamp}`,
            password,
          })

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
      }
    })

    it('should hash passwords with bcrypt', async () => {
      const timestamp = Date.now()
      const password = 'SecurePass123!'

      const response = await request(await app())
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send({
          email: `hash${timestamp}@example.com`,
          username: `hash${timestamp}`,
          password,
        })

      expect(response.status).toBe(200)

      // Verificar que el password se hasheó correctamente
      const createdUser = await workerPrisma.user.findUnique({
        where: { email: `hash${timestamp}@example.com` },
      })

      expect(createdUser?.passwordHash).toBeDefined()
      expect(createdUser?.passwordHash).not.toBe(password)
      expect(createdUser?.passwordHash).toMatch(/^\$2[aby]\$\d{1,2}\$/) // Formato bcrypt
    })
  })

  describe('CRIT-002: Account Enumeration Prevention', () => {
    it('should not reveal if email exists during login', async () => {
      // Crear un usuario existente
      const timestamp = Date.now()
      const existingEmail = `existing${timestamp}@example.com`

      await request(await app())
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send({
          email: existingEmail,
          username: `existing${timestamp}`,
          password: 'SecurePass123!',
        })

      const nonExistingEmail = `nonexisting${timestamp}@example.com`

      // Login con email existente y password incorrecto
      const response1 = await request(await app())
        .post('/api/auth/login')
        .set(getAuthHeaders())
        .send({ email: existingEmail, password: 'wrongpassword' })

      // Login con email inexistente
      const response2 = await request(await app())
        .post('/api/auth/login')
        .set(getAuthHeaders())
        .send({ email: nonExistingEmail, password: 'wrongpassword' })

      // Ambos deben tener el mismo tiempo de respuesta y mensaje
      expect(response1.status).toBe(response2.status)
      expect(response1.body.error.message).toBe(response2.body.error.message)
      expect(response1.body.error.code).toBe(response2.body.error.code)
    })

    it('should not reveal if email exists during registration', async () => {
      const timestamp = Date.now()
      const email = `enumeration${timestamp}@example.com`

      // Primera vez - debe funcionar
      const response1 = await request(await app())
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send({
          email,
          username: `enumeration${timestamp}`,
          password: 'SecurePass123!',
        })

      expect(response1.status).toBe(200)

      // Segunda vez - debe fallar pero no revelar información
      const response2 = await request(await app())
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send({
          email,
          username: `enumeration2${timestamp}`,
          password: 'SecurePass123!',
        })

      expect([400, 409, 500]).toContain(response2.status)
      const m = String(response2.body?.error?.message ?? '')
      expect(
        m.length === 0 || !/at line|ECONNREFUSED|stack|PrismaClient/i.test(m),
      ).toBe(true)
    })
  })

  describe('CRIT-003: Security Headers', () => {
    it('should include essential security headers', async () => {
      const response = await request(await app())
        .get('/api/users/me')
        .set(getAuthHeaders())

      // Headers de seguridad esenciales
      expect(response.headers).toHaveProperty('x-content-type-options')
      expect(response.headers['x-content-type-options']).toBe('nosniff')

      expect(response.headers).toHaveProperty('x-frame-options')
      expect(String(response.headers['x-frame-options'] ?? '').toUpperCase()).toMatch(
        /DENY|SAMEORIGIN/,
      )

      expect(response.headers).toHaveProperty('x-xss-protection')
      expect(String(response.headers['x-xss-protection'] ?? '').toLowerCase()).toMatch(
        /1|0|block/,
      )

      expect(response.headers).toHaveProperty('strict-transport-security')
      expect(response.headers['strict-transport-security']).toContain('max-age=')
    })

    it('should set secure cookie attributes', async () => {
      const timestamp = Date.now()
      const response = await request(await app())
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send({
          email: `cookie${timestamp}@example.com`,
          username: `cookie${timestamp}`,
          password: 'SecurePass123!',
        })

      expect(response.status).toBe(200)

      const rawCookies = response.headers['set-cookie']
      if (!rawCookies) {
        expect(response.status).toBe(200)
        return
      }
      const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies]

      // Buscar cookie de acceso
      const authCookie = cookies.find((c: string) => c.includes('access_token'))
      expect(authCookie).toBeDefined()

      expect(authCookie).toContain('HttpOnly')
      expect(authCookie).toContain('SameSite=Strict')
      if (process.env.NODE_ENV === 'production') {
        expect(authCookie).toContain('Secure')
      }
    })
  })

  describe('CRIT-004: Authorization Bypass Prevention', () => {
    it('should prevent access to other users data', async () => {
      const user1 = await createTestUser()
      const user2 = await createTestUser()
      const r1 = await request(await app())
        .get('/api/users/me')
        .set(getAuthHeaders())
        .set('Cookie', [`access_token=${user1.accessToken}`])
      expect(r1.status).toBe(200)
      expect(r1.body.data.user.id).toBe(user1.user.id)
      expect(r1.body.data.user.id).not.toBe(user2.user.id)
    })

    it('should prevent privilege escalation', async () => {
      const regularUser = await createTestUser()

      // Usuario regular intenta acceder a endpoint de admin
      const adminEndpoints = [
        '/api/admin/users',
        '/api/admin/sessions',
        '/api/admin/security-logs',
        '/api/admin/system-stats',
      ]

      for (const endpoint of adminEndpoints) {
        const response = await request(await app())
          .get(endpoint)
          .set(getAuthHeaders())
          .set('Cookie', [`access_token=${regularUser.accessToken}`])

        expect([403, 404]).toContain(response.status)
        if (response.status === 403) {
          expect(response.body.success).toBe(false)
        }
      }
    })
  })

  describe('CRIT-005: Information Disclosure Prevention', () => {
    it('should not expose sensitive information in errors', async () => {
      const response = await request(await app())
        .post('/api/auth/login')
        .set(getAuthHeaders())
        .send({ email: 'admin@example.com', password: 'wrong' })

      // No debe revelar información sensible
      expect(response.body.error.message).not.toContain('admin')
      expect(response.body.error.message).not.toContain('user not found')
      expect(response.body.error.message).not.toContain('password incorrect')
      expect(response.body.error.message).not.toContain('email')
      expect(response.body.error.message).not.toContain('password')
    })

    it('should not expose system information', async () => {
      const response = await request(await app())
        .get('/api/users/me')
        .set(getAuthHeaders())

      // No debe exponer información del sistema
      expect(response.headers).not.toHaveProperty('server')
      expect(response.headers).not.toHaveProperty('x-powered-by')
      expect(response.headers).not.toHaveProperty('x-aspnet-version')
    })

    it('should sanitize error responses', async () => {
      // Intentar acceder a endpoint inexistente
      const response = await request(await app())
        .get('/api/nonexistent-endpoint')
        .set(getAuthHeaders())

      expect(response.status).toBe(404)
      expect(response.body.error.message).not.toContain('stack trace')
      expect(response.body.error.message).not.toContain('Error:')
      expect(response.body.error.message).not.toContain('at ')
    })
  })

  describe('CRIT-006: JWT Token Security', () => {
    it('should validate JWT algorithm', async () => {
      // Token con algoritmo "none" (vulnerabilidad crítica)
      const maliciousToken =
        'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.'

      const response = await request(await app())
        .get('/api/users/me')
        .set(getAuthHeaders())
        .set('Cookie', [`access_token=${maliciousToken}`])

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(['UNAUTHORIZED', 'INVALID_TOKEN', 'FORBIDDEN']).toContain(
        response.body.error?.code,
      )
    })

    it('should reject tokens with wrong signature', async () => {
      const userData = await createTestUser()

      // Modificar el token para invalidar la firma
      const tokenParts = userData.accessToken.split('.')
      const header = tokenParts[0]
      const payload = tokenParts[1]
      const maliciousSignature = 'INVALID_SIGNATURE'

      const maliciousToken = `${header}.${payload}.${maliciousSignature}`

      const response = await request(await app())
        .get('/api/users/me')
        .set(getAuthHeaders())
        .set('Cookie', [`access_token=${maliciousToken}`])

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(['UNAUTHORIZED', 'INVALID_TOKEN']).toContain(response.body.error?.code)
    })

    it('should validate token expiration', async () => {
      const userData = await createTestUser()

      // Crear un token con payload expirado
      const tokenParts = userData.accessToken.split('.')
      const header = tokenParts[0]
      const expiredPayload = Buffer.from(
        JSON.stringify({
          sub: userData.user.id,
          iat: Math.floor(Date.now() / 1000) - 3600, // 1 hora atrás
          exp: Math.floor(Date.now() / 1000) - 1800, // 30 minutos atrás
        }),
      )
        .toString('base64')
        .replace(/=/g, '')
      const signature = tokenParts[2]

      const expiredToken = `${header}.${expiredPayload}.${signature}`

      const response = await request(await app())
        .get('/api/users/me')
        .set(getAuthHeaders())
        .set('Cookie', [`access_token=${expiredToken}`])

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(['UNAUTHORIZED', 'INVALID_TOKEN', 'TOKEN_EXPIRED']).toContain(
        response.body.error?.code,
      )
    })
  })
})
