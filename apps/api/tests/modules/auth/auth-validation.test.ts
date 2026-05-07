/**
 * 🔍 AUTH VALIDATION TESTS - RITMO API 2025
 *
 * Tests específicos para validar el comportamiento de las funciones de autenticación
 * Verificando que cada función hace exactamente lo que se espera
 */

import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app, getAuthHeaders, workerPrisma } from '../../helpers/index.ts'

describe('🔍 Auth Function Validation Tests', () => {
  describe('User Registration Validation', () => {
    it('should create user with all required fields and return proper response structure', async () => {
      const timestamp = Date.now()
      const userData = {
        email: `validation${timestamp}@example.com`,
        username: `validation${timestamp}`,
        password: 'SecurePass123!',
        firstName: 'Validation',
        lastName: 'Test',
      }

      const response = await request(await app())
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send(userData)

      // Verificar estructura de respuesta
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
      expect(response.body.data.user).toBeDefined()
      expect(response.body.data.accessToken).toBeDefined()
      expect(response.body.data.refreshToken).toBeDefined()
      expect(response.body.data.sessionId).toBeDefined()

      // Verificar datos del usuario
      expect(response.body.data.user.email).toBe(userData.email)
      expect(response.body.data.user.username).toBe(userData.username)
      expect(response.body.data.user.firstName).toBe(userData.firstName)
      expect(response.body.data.user.lastName).toBe(userData.lastName)
      expect(response.body.data.user.id).toBeDefined()
      expect(response.body.data.user.passwordHash).toBeUndefined() // No debe incluir password hash

      // Verificar que el usuario se creó en la BD
      const createdUser = await workerPrisma.user.findUnique({
        where: { email: userData.email },
      })
      expect(createdUser).toBeDefined()
      expect(createdUser?.email).toBe(userData.email)
      expect(createdUser?.username).toBe(userData.username)
      expect(createdUser?.passwordHash).toBeDefined() // Debe tener hash de password
    })

    it('should hash password correctly and not store plain text', async () => {
      const timestamp = Date.now()
      const password = 'SecurePass123!'
      const userData = {
        email: `hash${timestamp}@example.com`,
        username: `hash${timestamp}`,
        password,
      }

      const response = await request(await app())
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send(userData)

      expect(response.status).toBe(200)

      // Verificar que el password se hasheó correctamente
      const createdUser = await workerPrisma.user.findUnique({
        where: { email: userData.email },
      })
      expect(createdUser?.passwordHash).toBeDefined()
      expect(createdUser?.passwordHash).not.toBe(password) // No debe ser plain text
      expect(createdUser?.passwordHash).toMatch(/^\$2[aby]\$\d{1,2}\$/) // Formato bcrypt
    })

    it('should set default values for optional fields', async () => {
      const timestamp = Date.now()
      const userData = {
        email: `defaults${timestamp}@example.com`,
        username: `defaults${timestamp}`,
        password: 'SecurePass123!',
        // Sin firstName, lastName, timezone, language
      }

      const response = await request(await app())
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send(userData)

      expect(response.status).toBe(200)

      const createdUser = await workerPrisma.user.findUnique({
        where: { email: userData.email },
      })
      expect(createdUser?.timezone).toBe('UTC') // Valor por defecto
      expect(createdUser?.language).toBe('es') // Valor por defecto
      expect(createdUser?.isActive).toBe(true) // Valor por defecto
      expect(createdUser?.isEmailVerified).toBe(false) // Valor por defecto
      expect(createdUser?.role).toBe('user') // Valor por defecto
      expect(createdUser?.failedLoginAttempts).toBe(0) // Valor por defecto
    })
  })

  describe('User Login Validation', () => {
    it('should authenticate user with correct credentials and return session data', async () => {
      const timestamp = Date.now()
      const email = `loginval${timestamp}@example.com`
      const password = 'SecurePass123!'

      // Registrar usuario primero
      await request(await app())
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send({
          email,
          username: `loginval${timestamp}`,
          password,
        })

      // Login
      const response = await request(await app())
        .post('/api/auth/login')
        .set(getAuthHeaders())
        .send({ email, password })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.user.email).toBe(email)
      expect(response.body.data.accessToken).toBeDefined()
      expect(response.body.data.refreshToken).toBeDefined()
      expect(response.body.data.sessionId).toBeDefined()

      // Verificar que se actualizó lastLoginAt
      const user = await workerPrisma.user.findUnique({
        where: { email },
      })
      expect(user?.lastLoginAt).toBeDefined()
      expect(user?.failedLoginAttempts).toBe(0) // Debe resetear intentos fallidos
    })

    it('should increment failed login attempts on wrong password', async () => {
      const timestamp = Date.now()
      const email = `failed${timestamp}@example.com`
      const password = 'SecurePass123!'

      // Registrar usuario
      await request(await app())
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send({
          email,
          username: `failed${timestamp}`,
          password,
        })

      // Intentar login con password incorrecto
      const response = await request(await app())
        .post('/api/auth/login')
        .set(getAuthHeaders())
        .send({ email, password: 'WrongPassword123!' })

      expect(response.status).toBe(401)

      // Verificar que se incrementó el contador de intentos fallidos
      const user = await workerPrisma.user.findUnique({
        where: { email },
      })
      expect(user?.failedLoginAttempts).toBe(1)
    })

    it('should handle multiple failed attempts correctly', async () => {
      const timestamp = Date.now()
      const email = `multiple${timestamp}@example.com`
      const password = 'SecurePass123!'

      // Registrar usuario
      await request(await app())
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send({
          email,
          username: `multiple${timestamp}`,
          password,
        })

      // Intentar login múltiples veces con password incorrecto
      for (let i = 0; i < 3; i++) {
        const response = await request(await app())
          .post('/api/auth/login')
          .set(getAuthHeaders())
          .send({ email, password: 'WrongPassword123!' })

        expect(response.status).toBe(401)
      }

      // Verificar que se incrementó el contador correctamente
      const user = await workerPrisma.user.findUnique({
        where: { email },
      })
      expect(user?.failedLoginAttempts).toBe(3)
    })
  })

  describe('Token Validation', () => {
    it('should generate valid JWT tokens with correct structure', async () => {
      const timestamp = Date.now()
      const userData = {
        email: `token${timestamp}@example.com`,
        username: `token${timestamp}`,
        password: 'SecurePass123!',
      }

      const response = await request(await app())
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send(userData)

      expect(response.status).toBe(200)

      const { accessToken, refreshToken } = response.body.data

      // Access = JWT; refresh = opaque hex from TokenRotationService.createTokenFamily
      expect(accessToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)
      expect(refreshToken).toMatch(/^[a-f0-9]{128}$/i)
      expect(accessToken).not.toBe(refreshToken)
    })

    it('should include sessionId in token generation', async () => {
      const timestamp = Date.now()
      const userData = {
        email: `session${timestamp}@example.com`,
        username: `session${timestamp}`,
        password: 'SecurePass123!',
      }

      const response = await request(await app())
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send(userData)

      expect(response.status).toBe(200)
      expect(response.body.data.sessionId).toBeDefined()
      expect(typeof response.body.data.sessionId).toBe('string')
      expect(response.body.data.sessionId.length).toBeGreaterThan(0)
    })
  })

  describe('Error Handling Validation', () => {
    it('should return proper error structure for validation errors', async () => {
      const response = await request(await app())
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send({
          email: 'invalid-email',
          username: 'a', // Muy corto
          password: '123', // Muy débil
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBeDefined()
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
      expect(response.body.error.message).toBeDefined()
    })

    it('should return proper error structure for authentication errors', async () => {
      const response = await request(await app())
        .post('/api/auth/login')
        .set(getAuthHeaders())
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBeDefined()
      expect(response.body.error.code).toBe('UNAUTHORIZED')
      expect(response.body.error.message).toBeDefined()
    })
  })

  describe('Database Integrity', () => {
    it('should maintain referential integrity between users and sessions', async () => {
      const timestamp = Date.now()
      const userData = {
        email: `integrity${timestamp}@example.com`,
        username: `integrity${timestamp}`,
        password: 'SecurePass123!',
      }

      const response = await request(await app())
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send(userData)

      expect(response.status).toBe(200)

      const userId = response.body.data.user.id
      const { sessionId } = response.body.data

      // Verificar que el usuario existe
      const user = await workerPrisma.user.findUnique({
        where: { id: userId },
      })
      expect(user).toBeDefined()

      // Register creates refresh token row (sessionId) but not UserSession until first HTTP session flow
      const tokenRow = await workerPrisma.refreshToken.findFirst({
        where: { userId, sessionId },
      })
      expect(tokenRow).toBeDefined()
      expect(tokenRow?.userId).toBe(userId)
    })
  })
})
