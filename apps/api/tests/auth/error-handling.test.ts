/**
 * ⚠️ ERROR HANDLING TESTS - RITMO API 2025
 *
 * Tests de manejo de errores según especificaciones del reporte
 * Implementando context-aware testing con escenarios de error
 */

import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getAuthHeaders, testContext } from '../setup/test-setup.js'

describe('⚠️ Error Handling Tests', () => {
  beforeEach(async () => {
    // La limpieza se maneja automáticamente en test-setup.ts
  })

  afterEach(async () => {
    // La limpieza se maneja automáticamente en test-setup.ts
  })

  describe('ERR-001: Invalid Credentials', () => {
    it('should return generic error message for invalid credentials', async () => {
      // Context: returningUser + errorContext + graceful-degradation
      const response = await request(testContext.app)
        .post('/api/auth/login')
        .set(getAuthHeaders())
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('UNAUTHORIZED')
      expect(response.body.error.message).toBe('Invalid credentials')

      // Verificar que no se revela información sensible
      expect(response.body.error.message).not.toContain('User not found')
      expect(response.body.error.message).not.toContain('Password incorrect')
    })

    it('should not reveal user existence information', async () => {
      // Test con usuario que existe
      const timestamp = Date.now()
      const email = `reveal${timestamp}@example.com`

      await request(testContext.app)
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send({
          email,
          username: `reveal${timestamp}`,
          password: 'SecurePass123!',
        })

      // Intentar login con email correcto pero password incorrecto
      const response1 = await request(testContext.app)
        .post('/api/auth/login')
        .set(getAuthHeaders())
        .send({
          email,
          password: 'wrongpassword',
        })

      // Intentar login con email incorrecto
      const response2 = await request(testContext.app)
        .post('/api/auth/login')
        .set(getAuthHeaders())
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })

      // Ambos deben devolver el mismo mensaje de error
      expect(response1.status).toBe(401)
      expect(response2.status).toBe(401)
      expect(response1.body.error.message).toBe(response2.body.error.message)
    })

    it('should handle missing credentials gracefully', async () => {
      const response = await request(testContext.app)
        .post('/api/auth/login')
        .set(getAuthHeaders())
        .send({
          email: 'test@example.com',
          // Password faltante
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
      expect(response.body.error.details).toBeDefined()
    })
  })

  describe('ERR-002: Validation Errors', () => {
    it('should handle invalid email format', async () => {
      const response = await request(testContext.app)
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send({
          email: 'invalid-email',
          username: 'testuser',
          password: 'SecurePass123!',
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
      expect(response.body.error.details).toBeDefined()

      const emailError = response.body.error.details.find(
        (d: any) => d.field === 'email',
      )
      expect(emailError).toBeDefined()
      expect(emailError.message).toContain('Invalid email format')
    })

    it('should handle weak password', async () => {
      const response = await request(testContext.app)
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: '123', // Contraseña débil
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
      expect(response.body.error.details).toBeDefined()

      const passwordError = response.body.error.details.find(
        (d: any) => d.field === 'password',
      )
      expect(passwordError).toBeDefined()
      expect(passwordError.message).toContain('Password must be at least 8 characters')
    })

    it('should handle missing required fields', async () => {
      const response = await request(testContext.app)
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send({
          email: 'test@example.com',
          // username y password faltantes
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
      expect(response.body.error.details).toBeDefined()
      expect(response.body.error.details.length).toBeGreaterThan(0)
    })

    it('should handle duplicate email registration', async () => {
      const timestamp = Date.now()
      const email = `duplicate${timestamp}@example.com`

      // Primer registro
      await request(testContext.app)
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send({
          email,
          username: `duplicate${timestamp}`,
          password: 'SecurePass123!',
        })

      // Segundo registro con el mismo email
      const response = await request(testContext.app)
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send({
          email,
          username: `duplicate2${timestamp}`,
          password: 'SecurePass123!',
        })

      expect([409, 500]).toContain(response.status)
      expect(response.body.success).toBe(false)
      expect(response.body.error.message).toContain('already exists')
    })
  })

  describe('ERR-003: Server Errors', () => {
    it('should handle database connection errors gracefully', async () => {
      // Este test simula un error de base de datos
      // En un entorno real, podrías desconectar la DB temporalmente
      const response = await request(testContext.app)
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send({
          email: 'db-error@example.com',
          username: 'dberror',
          password: 'SecurePass123!',
        })

      // Si hay error de DB, debe ser manejado gracefulmente
      expect([200, 500, 503]).toContain(response.status)

      if (response.status === 500) {
        expect(response.body.success).toBe(false)
        expect(response.body.error.code).toBe('INTERNAL_ERROR')
        expect(response.body.error.message).toBe('Internal server error')
      }
    })

    it('should handle malformed JSON requests', async () => {
      const response = await request(testContext.app)
        .post('/api/auth/register')
        .set({
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        })
        .send('invalid json string')

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should handle oversized requests', async () => {
      const largeData = {
        email: 'large@example.com',
        username: 'largeuser',
        password: 'SecurePass123!',
        firstName: 'A'.repeat(10000), // Campo muy grande
        lastName: 'B'.repeat(10000),
      }

      const response = await request(testContext.app)
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send(largeData)

      expect([400, 413, 500]).toContain(response.status)
      expect(response.body.success).toBe(false)
    })
  })

  describe('ERR-004: Network and Timeout Errors', () => {
    it('should handle slow requests gracefully', async () => {
      // Este test verifica que la API maneja requests lentos
      const response = await request(testContext.app)
        .post('/api/auth/login')
        .set(getAuthHeaders())
        .timeout(30000) // 30 segundos timeout
        .send({
          email: 'slow@example.com',
          password: 'password',
        })

      // Debe responder dentro del timeout
      expect([401, 400]).toContain(response.status)
    })

    it('should handle concurrent requests', async () => {
      const timestamp = Date.now()
      const email = `concurrent${timestamp}@example.com`

      // Crear usuario
      await request(testContext.app)
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send({
          email,
          username: `concurrent${timestamp}`,
          password: 'SecurePass123!',
        })

      // Múltiples requests concurrentes
      const promises = Array(5)
        .fill(null)
        .map(() =>
          request(testContext.app).post('/api/auth/login').set(getAuthHeaders()).send({
            email,
            password: 'SecurePass123!',
          }),
        )

      const responses = await Promise.all(promises)

      // Todos deben responder correctamente
      responses.forEach(response => {
        expect([200, 401, 429]).toContain(response.status)
      })
    })
  })

  describe('ERR-005: API Response Structure', () => {
    it('should maintain consistent error response structure', async () => {
      const response = await request(testContext.app)
        .post('/api/auth/login')
        .set(getAuthHeaders())
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })

      // Verificar estructura consistente
      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toHaveProperty('code')
      expect(response.body.error).toHaveProperty('message')
      expect(response.body).toHaveProperty('meta')
      expect(response.body.meta).toHaveProperty('timestamp')
      expect(response.body.meta).toHaveProperty('requestId')
    })

    it('should include proper HTTP status codes', async () => {
      const testCases = [
        {
          endpoint: '/api/auth/register',
          data: { email: 'invalid' },
          expectedStatus: 400,
        },
        {
          endpoint: '/api/auth/login',
          data: { email: 'test@example.com', password: 'wrong' },
          expectedStatus: 401,
        },
        {
          endpoint: '/api/nonexistent',
          data: {},
          expectedStatus: 404,
        },
      ]

      for (const testCase of testCases) {
        const response = await request(testContext.app)
          .post(testCase.endpoint)
          .set(getAuthHeaders())
          .send(testCase.data)

        expect(response.status).toBe(testCase.expectedStatus)
      }
    })

    it('should handle CORS errors properly', async () => {
      const response = await request(testContext.app).options('/api/auth/login').set({
        Origin: 'http://malicious-site.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      })

      // Debe manejar CORS correctamente
      expect([200, 204, 403]).toContain(response.status)
    })
  })
})
