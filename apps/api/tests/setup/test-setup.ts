/**
 * 🧪 TEST SETUP - RITMO API 2025
 *
 * Setup optimizado para tests con API real y Docker
 * Implementando mejores prácticas de testing con configuración optimizada de Prisma
 */

import { createServer } from 'http'
import { AddressInfo } from 'net'
import request from 'supertest'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'

// Importar la aplicación real
import app from '../../src/app.js'

// Importar configuración optimizada de Prisma
import {
  checkPrismaConnection,
  cleanupTestDatabase,
  clearTestDatabaseWithRetry,
  setupTestDatabase,
  testPrisma,
} from './prisma-test-config.js'

// ========================================
// GLOBAL TEST CONTEXT
// ========================================

export interface TestContext {
  app: any
  server: any
  baseUrl: string
  prisma: any
}

export const testContext: TestContext = {
  app: null,
  server: null,
  baseUrl: '',
  prisma: null as any,
}

// ========================================
// GLOBAL SETUP
// ========================================

beforeAll(async () => {
  console.log('🚀 Starting test setup...')

  // Setup test database con configuración optimizada
  await setupTestDatabase()

  // Usar la aplicación real de Express
  testContext.app = app

  // Start server on random port
  testContext.server = createServer(testContext.app)

  await new Promise<void>(resolve => {
    testContext.server.listen(0, () => {
      const address = testContext.server.address() as AddressInfo
      testContext.baseUrl = `http://localhost:${address.port}`
      resolve()
    })
  })

  // Set prisma client optimizado
  testContext.prisma = testPrisma

  console.log('✅ Test setup complete')
}, 60000) // 1 minuto para setup

// ========================================
// GLOBAL TEARDOWN
// ========================================

afterAll(async () => {
  console.log('🛑 Cleaning up test environment...')

  // Close server
  if (testContext.server) {
    await new Promise<void>(resolve => {
      testContext.server.close(() => resolve())
    })
  }

  // Cleanup test database con configuración optimizada
  await cleanupTestDatabase()

  console.log('✅ Test cleanup complete')
}, 15000) // 15 segundos para cleanup

// ========================================
// PER-TEST SETUP
// ========================================

beforeEach(async () => {
  // Verificar conexión antes de cada test
  const isConnected = await checkPrismaConnection()
  if (!isConnected) {
    console.log('🔄 Reconnecting before test...')
    await testPrisma.$connect()
  }

  // Clear test database con retry automático
  await clearTestDatabaseWithRetry()
}, 10000) // 10 segundos para setup por test

// ========================================
// PER-TEST TEARDOWN
// ========================================

afterEach(async () => {
  // Clear test database con retry automático
  await clearTestDatabaseWithRetry()
}, 5000) // 5 segundos para cleanup por test

// ========================================
// HELPER FUNCTIONS
// ========================================

export function getTestRequest() {
  return request(testContext.app)
}

export function getAuthHeaders(token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'RITMO-Test-Suite/1.0.0',
  }

  return headers
}

export function getAuthCookies(token?: string) {
  const cookies: Record<string, string> = {}

  if (token) {
    cookies['access_token'] = token
  }

  return cookies
}

// ========================================
// EXPORTS
// ========================================

export { request } from 'supertest'
