/**
 * 🔐 AUTHENTICATION TESTS - RITMO API 2025
 *
 * Tests esenciales de autenticación usando API real y Docker
 * Implementando mejores prácticas de testing
 */

import type { Application } from 'express'
import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { userFactory } from '../../factories/user.factory.ts'
import { app, expectApiError, getAuthHeaders } from '../../helpers/index.ts'

describe('🔐 Authentication Tests', () => {
  let expressApp: Application

  beforeAll(async () => {
    expressApp = await app()
  })

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const built = userFactory.build()
      const userData = {
        email: built.email,
        username: built.username,
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User',
      }

      const response = await request(expressApp)
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send(userData)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.user.email).toBe(userData.email.toLowerCase())
      expect(response.body.data.user.username).toBe(userData.username)
      expect(response.body.data.accessToken).toBeTruthy()
      expect(response.body.data.refreshToken).toBeTruthy()
      expect(response.body.data.sessionId).toBeTruthy()
    })

    it('should reject registration with existing email', async () => {
      const built = userFactory.build()
      const userData = {
        email: built.email,
        username: built.username,
        password: 'SecurePass123!',
      }

      await request(expressApp)
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send(userData)

      const response = await request(expressApp)
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send(userData)

      expectApiError(response, { status: 409, code: 'RESOURCE_EXISTS' })
    })

    it('should reject registration with weak password', async () => {
      const timestamp = Date.now()
      const userData = {
        email: `weak${timestamp}@example.com`,
        username: `weak${timestamp}`,
        password: '123', // Weak password
      }

      const response = await request(expressApp)
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send(userData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should reject registration with missing required fields', async () => {
      const userData = {
        email: 'test@example.com',
        // Missing username and password
      }

      const response = await request(expressApp)
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send(userData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('User Login', () => {
    it('should login with valid credentials', async () => {
      const timestamp = Date.now()
      const email = `login${timestamp}@example.com`
      const password = 'SecurePass123!'

      // Register user first
      await request(expressApp)
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send({
          email,
          username: `login${timestamp}`,
          password,
        })

      // Login
      const response = await request(expressApp)
        .post('/api/auth/login')
        .set(getAuthHeaders())
        .send({ email, password })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.user.email).toBe(email)
      expect(response.headers['set-cookie']).toBeDefined()
    })

    it('should reject invalid credentials', async () => {
      const response = await request(expressApp)
        .post('/api/auth/login')
        .set(getAuthHeaders())
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('UNAUTHORIZED')
    })

    it('should reject login with missing credentials', async () => {
      const response = await request(expressApp)
        .post('/api/auth/login')
        .set(getAuthHeaders())
        .send({
          email: 'test@example.com',
          // Missing password
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('Protected Endpoints', () => {
    it('should reject access to /api/users/me without token', async () => {
      const response = await request(expressApp)
        .get('/api/users/me')
        .set(getAuthHeaders())

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('UNAUTHORIZED')
    })

    it('should reject access to /api/sessions without token', async () => {
      const response = await request(expressApp)
        .get('/api/sessions')
        .set(getAuthHeaders())

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('UNAUTHORIZED')
    })

    it('should reject access with invalid token', async () => {
      const response = await request(expressApp)
        .get('/api/users/me')
        .set({
          ...getAuthHeaders(),
          Authorization: 'Bearer invalid-token',
        })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })
  })

  describe('API Health', () => {
    it('should return health status', async () => {
      const response = await request(expressApp)
        .get('/api/health')
        .set(getAuthHeaders())

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.status).toBe('healthy')
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid JSON', async () => {
      const response = await request(expressApp)
        .post('/api/auth/register')
        .set({
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        })
        .send('invalid json')

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })

    it('should handle non-existent endpoints', async () => {
      const response = await request(expressApp)
        .get('/api/nonexistent')
        .set(getAuthHeaders())

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('NOT_FOUND')
    })
  })
})
