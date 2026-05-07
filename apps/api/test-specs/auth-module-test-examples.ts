/**
 * 🔐 AUTH MODULE TEST IMPLEMENTATION EXAMPLES
 *
 * Ejemplos de implementación de tests basados en la especificación JSON
 * Siguiendo las mejores prácticas de 2025 y Context Engineering
 */

import request from 'supertest'
import { prisma } from '../src/core/database/prisma.js'
import { app } from '../src/server.js'
import { generateTestSession, generateTestUser } from './fixtures/testData.js'

describe('Authentication Module - Context-Aware Tests', () => {
  let testUser: any
  let testSession: any

  beforeAll(async () => {
    // Setup test context
    testUser = await generateTestUser()
    testSession = await generateTestSession(testUser.id)
  })

  afterAll(async () => {
    // Cleanup test context
    await prisma.user.deleteMany({ where: { email: { contains: 'test' } } })
    await prisma.userSession.deleteMany({ where: { userId: testUser.id } })
  })

  describe('Authentication Flow Tests', () => {
    describe('AUTH-001: User Registration - New User', () => {
      const context = {
        userJourney: 'newUser',
        securityContext: 'normalFlow',
        deviceContext: 'desktop-chrome-windows',
      }

      it('should register a new user successfully', async () => {
        // Given a new user wants to register
        const registrationData = {
          email: 'newuser@example.com',
          username: 'newuser123',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
          timezone: 'UTC',
          language: 'es',
        }

        // When they provide valid registration data
        const response = await request(app)
          .post('/api/auth/register')
          .send(registrationData)
          .expect(201)

        // Then their account should be created successfully
        expect(response.body.success).toBe(true)
        expect(response.body.data.user.email).toBe(registrationData.email)
        expect(response.body.data.user.username).toBe(registrationData.username)
        expect(response.body.data.user.isEmailVerified).toBe(false)
        expect(response.body.data.user.role).toBe('user')

        // And they should receive tokens
        expect(response.body.data.accessToken).toBeDefined()
        expect(response.body.data.refreshToken).toBeDefined()
        expect(response.body.data.sessionId).toBeDefined()

        // Security checks
        expect(response.headers['set-cookie']).toBeDefined()
        const cookies = response.headers['set-cookie']
        expect(cookies.some((cookie: string) => cookie.includes('HttpOnly'))).toBe(true)
      })

      it('should hash password securely', async () => {
        const user = await prisma.user.findUnique({
          where: { email: 'newuser@example.com' },
        })

        expect(user?.passwordHash).not.toBe('SecurePass123!')
        expect(user?.passwordHash).toMatch(/^\$2[aby]\$\d{1,2}\$/) // bcrypt pattern
      })
    })

    describe('AUTH-002: User Login - Returning User', () => {
      const context = {
        userJourney: 'returningUser',
        securityContext: 'normalFlow',
        deviceContext: 'known-device',
      }

      it('should authenticate returning user successfully', async () => {
        // Given a registered user wants to login
        const loginData = {
          email: testUser.email,
          password: 'SecurePass123!',
          deviceInfo: {
            deviceId: 'known-device-fingerprint',
            deviceName: 'Chrome on Windows',
            deviceType: 'desktop',
            browser: 'Chrome',
            os: 'Windows',
            ipAddress: '192.168.1.100',
          },
        }

        // When they provide valid credentials
        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(200)

        // Then they should be authenticated successfully
        expect(response.body.success).toBe(true)
        expect(response.body.data.user.email).toBe(testUser.email)
        expect(response.body.data.deviceTrust).toBe('high')

        // And their session should be managed
        expect(response.body.data.sessionId).toBeDefined()
        expect(response.body.data.accessToken).toBeDefined()
        expect(response.body.data.refreshToken).toBeDefined()
      })

      it('should reuse existing session for known device', async () => {
        // Test session reuse logic
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: 'SecurePass123!',
            deviceInfo: {
              deviceId: 'known-device-fingerprint',
            },
          })

        expect(response.body.data.isNewSession).toBe(false)
        expect(response.body.message).toContain('reutilizada')
      })
    })

    describe('AUTH-003: User Login - Suspicious Activity', () => {
      const context = {
        userJourney: 'suspiciousUser',
        securityContext: 'highRiskFlow',
        deviceContext: 'unknown-device',
      }

      it('should handle suspicious login with enhanced security', async () => {
        // Given a user attempts login from unknown device
        const loginData = {
          email: testUser.email,
          password: 'SecurePass123!',
          deviceInfo: {
            deviceId: 'unknown-device-fingerprint',
            deviceName: 'Unknown Browser',
            deviceType: 'mobile',
            browser: 'Unknown',
            os: 'Unknown',
            ipAddress: '203.0.113.1',
          },
        }

        // When they provide valid credentials
        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(200)

        // Then they should be authenticated with enhanced security
        expect(response.body.success).toBe(true)
        expect(response.body.data.deviceTrust).toBe('low')

        // And security monitoring should be triggered
        // Check security logs
        const securityLogs = await prisma.securityLog.findMany({
          where: { userId: testUser.id },
        })
        expect(securityLogs.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Session Management Tests', () => {
    describe('SESS-001: Get User Sessions', () => {
      const context = {
        userJourney: 'returningUser',
        securityContext: 'normalFlow',
        sessionContext: 'multiple-active-sessions',
      }

      it('should return user sessions for authenticated user', async () => {
        // Given an authenticated user
        const loginResponse = await request(app).post('/api/auth/login').send({
          email: testUser.email,
          password: 'SecurePass123!',
        })

        const accessToken = loginResponse.body.data.accessToken

        // When they request their active sessions
        const response = await request(app)
          .get('/api/auth/sessions')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)

        // Then they should receive a list of their sessions
        expect(response.body.success).toBe(true)
        expect(response.body.data.sessions).toBeInstanceOf(Array)
        expect(response.body.data.sessions.length).toBeGreaterThan(0)

        // And session details should be accurate
        const session = response.body.data.sessions[0]
        expect(session.id).toBeDefined()
        expect(session.deviceId).toBeDefined()
        expect(session.isActive).toBe(true)
        expect(session.expiresAt).toBeDefined()
      })

      it("should only return user's own sessions", async () => {
        // Create another user and session
        const otherUser = await generateTestUser()
        const otherSession = await generateTestSession(otherUser.id)

        const loginResponse = await request(app).post('/api/auth/login').send({
          email: testUser.email,
          password: 'SecurePass123!',
        })

        const accessToken = loginResponse.body.data.accessToken

        const response = await request(app)
          .get('/api/auth/sessions')
          .set('Authorization', `Bearer ${accessToken}`)

        // Should only see own sessions
        const userSessions = response.body.data.sessions
        const otherUserSessions = userSessions.filter(
          (s: any) => s.userId === otherUser.id,
        )
        expect(otherUserSessions.length).toBe(0)

        // Cleanup
        await prisma.user.delete({ where: { id: otherUser.id } })
      })
    })
  })

  describe('Security Tests', () => {
    describe('SEC-001: Brute Force Attack Prevention', () => {
      const context = {
        userJourney: 'suspiciousUser',
        securityContext: 'attackFlow',
        attackType: 'brute-force',
      }

      it('should lock account after multiple failed attempts', async () => {
        // Given an attacker attempts multiple failed logins
        const attempts = [
          { email: testUser.email, password: 'wrong1' },
          { email: testUser.email, password: 'wrong2' },
          { email: testUser.email, password: 'wrong3' },
          { email: testUser.email, password: 'wrong4' },
          { email: testUser.email, password: 'wrong5' },
          { email: testUser.email, password: 'wrong6' },
        ]

        // When they exceed the maximum attempts
        for (const attempt of attempts) {
          await request(app).post('/api/auth/login').send(attempt).expect(401)
        }

        // Then the account should be locked
        const validLoginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: 'SecurePass123!',
          })
          .expect(423)

        expect(validLoginResponse.body.error.code).toBe('ACCOUNT_LOCKED')
        expect(validLoginResponse.body.error.message).toContain('temporarily locked')
      })
    })

    describe('SEC-002: Session Hijacking Prevention', () => {
      const context = {
        userJourney: 'suspiciousUser',
        securityContext: 'attackFlow',
        attackType: 'session-hijacking',
      }

      it('should detect session hijacking attempts', async () => {
        // Given a session token is compromised
        const loginResponse = await request(app).post('/api/auth/login').send({
          email: testUser.email,
          password: 'SecurePass123!',
        })

        const sessionId = loginResponse.body.data.sessionId

        // When an attacker uses it from a different device
        const hijackResponse = await request(app)
          .get('/api/auth/sessions')
          .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
          .set('X-Device-ID', 'attacker-device-fingerprint')
          .set('X-Forwarded-For', 'attacker-ip-address')

        // Then the session should be invalidated
        expect(hijackResponse.status).toBe(401)
        expect(hijackResponse.body.error.code).toBe('SESSION_INVALID')
      })
    })
  })

  describe('Error Handling Tests', () => {
    describe('ERR-001: Invalid Credentials', () => {
      const context = {
        userJourney: 'returningUser',
        errorContext: 'authentication-failure',
        userExperience: 'graceful-degradation',
      }

      it('should handle invalid credentials gracefully', async () => {
        // Given a user provides invalid credentials
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'wrongpassword',
          })
          .expect(401)

        // Then they should receive a clear error message
        expect(response.body.success).toBe(false)
        expect(response.body.error.code).toBe('INVALID_CREDENTIALS')
        expect(response.body.error.message).toBe('Invalid credentials')

        // And no sensitive information should be exposed
        expect(response.body.error.message).not.toContain('user')
        expect(response.body.error.message).not.toContain('email')
        expect(response.body.error.message).not.toContain('password')
      })
    })
  })
})

/**
 * Test Fixtures and Utilities
 */

export async function generateTestUser() {
  return await prisma.user.create({
    data: {
      email: `testuser-${Date.now()}@example.com`,
      username: `testuser-${Date.now()}`,
      passwordHash: '$2a$15$test.hash.for.testing.purposes',
      isActive: true,
      isEmailVerified: true,
      role: 'user',
      timezone: 'UTC',
      language: 'es',
    },
  })
}

export async function generateTestSession(userId: string) {
  return await prisma.userSession.create({
    data: {
      userId,
      sessionId: `test-session-${Date.now()}`,
      deviceId: 'test-device-fingerprint',
      deviceName: 'Test Device',
      deviceType: 'desktop',
      browser: 'Test Browser',
      os: 'Test OS',
      ipAddress: '127.0.0.1',
      isActive: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  })
}
