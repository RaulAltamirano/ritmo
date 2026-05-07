/**
 * ⚡ PERFORMANCE TESTS - RITMO API 2025
 *
 * Tests de rendimiento según especificaciones del reporte
 * Implementando load testing y stress testing
 */

import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getAuthHeaders, testContext } from '../setup/test-setup.js'

describe('⚡ Performance Tests', () => {
  beforeEach(async () => {
    // La limpieza se maneja automáticamente en test-setup.ts
  })

  afterEach(async () => {
    // La limpieza se maneja automáticamente en test-setup.ts
  })

  // Helper para crear usuarios de prueba
  const createTestUsers = async (count: number) => {
    const users: Array<{
      email: string
      username: string
      password: string
      accessToken: string
    }> = []

    for (let i = 0; i < count; i++) {
      const timestamp = Date.now() + i
      const userData = {
        email: `perfuser${timestamp}@example.com`,
        username: `perfuser${timestamp}`,
        password: 'SecurePass123!',
      }

      const response = await request(testContext.app)
        .post('/api/auth/register')
        .set(getAuthHeaders())
        .send(userData)

      if (response.status === 200) {
        users.push({
          ...userData,
          accessToken: response.body.data.accessToken,
        })
      }
    }
    return users
  }

  describe('PERF-001: Concurrent User Login', () => {
    it('should handle 10 concurrent login attempts', async () => {
      // Escenario: 10 usuarios concurrentes
      const users = await createTestUsers(10)

      const startTime = Date.now()

      const promises = users.map(user =>
        request(testContext.app).post('/api/auth/login').set(getAuthHeaders()).send({
          email: user.email,
          password: 'SecurePass123!',
        }),
      )

      const responses = await Promise.all(promises)
      const endTime = Date.now()
      const totalTime = endTime - startTime

      // Verificar que todos respondieron
      expect(responses.length).toBe(10)

      // Verificar tiempos de respuesta
      responses.forEach(response => {
        expect([200, 401]).toContain(response.status)
      })

      // Verificar tiempo total (debe ser menor a 5 segundos)
      expect(totalTime).toBeLessThan(5000)

      console.log(`⏱️ 10 concurrent logins completed in ${totalTime}ms`)
    })

    it('should maintain response time under 500ms for single login', async () => {
      const user = await createTestUsers(1)

      const startTime = Date.now()

      const response = await request(testContext.app)
        .post('/api/auth/login')
        .set(getAuthHeaders())
        .send({
          email: user[0].email,
          password: 'SecurePass123!',
        })

      const endTime = Date.now()
      const responseTime = endTime - startTime

      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(500)

      console.log(`⏱️ Single login completed in ${responseTime}ms`)
    })

    it('should handle mixed success/failure scenarios', async () => {
      const users = await createTestUsers(5)

      // Agregar credenciales incorrectas
      const mixedUsers = [
        ...users,
        { email: 'wrong@example.com', password: 'wrongpass' },
        { email: 'nonexistent@example.com', password: 'wrongpass' },
      ]

      const startTime = Date.now()

      const promises = mixedUsers.map(user =>
        request(testContext.app).post('/api/auth/login').set(getAuthHeaders()).send({
          email: user.email,
          password: user.password,
        }),
      )

      const responses = await Promise.all(promises)
      const endTime = Date.now()
      const totalTime = endTime - startTime

      // Verificar respuestas mixtas
      const successCount = responses.filter(r => r.status === 200).length
      const failureCount = responses.filter(r => r.status === 401).length

      expect(successCount).toBe(5) // Los usuarios válidos
      expect(failureCount).toBe(2) // Los usuarios inválidos
      expect(totalTime).toBeLessThan(3000)

      console.log(
        `⏱️ Mixed scenario: ${successCount} success, ${failureCount} failures in ${totalTime}ms`,
      )
    })
  })

  describe('PERF-002: Session Management Performance', () => {
    it('should handle multiple session requests efficiently', async () => {
      const users = await createTestUsers(3)

      const startTime = Date.now()

      const promises = users.map(user =>
        request(testContext.app)
          .get('/api/auth/sessions')
          .set({
            ...getAuthHeaders(),
            Authorization: `Bearer ${user.accessToken}`,
          }),
      )

      const responses = await Promise.all(promises)
      const endTime = Date.now()
      const totalTime = endTime - startTime

      // Verificar respuestas
      responses.forEach(response => {
        expect([200, 401]).toContain(response.status)
      })

      // Verificar tiempo total
      expect(totalTime).toBeLessThan(2000)

      console.log(`⏱️ Session requests completed in ${totalTime}ms`)
    })

    it('should handle session consolidation efficiently', async () => {
      const user = await createTestUsers(1)

      const deviceInfo = {
        deviceId: 'performance-test-device',
        deviceName: 'Performance Test Browser',
        deviceType: 'desktop',
        browser: 'Chrome',
        os: 'Windows',
        ipAddress: '192.168.1.100',
      }

      const startTime = Date.now()

      // Crear múltiples sesiones para el mismo dispositivo
      const promises = Array(5)
        .fill(null)
        .map(() =>
          request(testContext.app).post('/api/auth/login').set(getAuthHeaders()).send({
            email: user[0].email,
            password: 'SecurePass123!',
            deviceInfo,
          }),
        )

      const responses = await Promise.all(promises)
      const endTime = Date.now()
      const totalTime = endTime - startTime

      // Verificar respuestas
      responses.forEach(response => {
        expect([200, 401]).toContain(response.status)
      })

      expect(totalTime).toBeLessThan(3000)

      console.log(`⏱️ Session consolidation completed in ${totalTime}ms`)
    })
  })

  describe('PERF-003: Database Connection Pool', () => {
    it('should handle database connection stress', async () => {
      const users = await createTestUsers(20)

      const startTime = Date.now()

      // Múltiples operaciones de base de datos concurrentes
      const promises = users.map(user =>
        request(testContext.app).post('/api/auth/login').set(getAuthHeaders()).send({
          email: user.email,
          password: 'SecurePass123!',
        }),
      )

      const responses = await Promise.all(promises)
      const endTime = Date.now()
      const totalTime = endTime - startTime

      // Verificar que la mayoría de requests fueron exitosos
      const successCount = responses.filter(r => r.status === 200).length
      const errorRate = (responses.length - successCount) / responses.length

      expect(errorRate).toBeLessThan(0.05) // Menos del 5% de errores
      expect(totalTime).toBeLessThan(10000) // Menos de 10 segundos

      console.log(
        `⏱️ Database stress test: ${successCount}/${responses.length} success, ${(errorRate * 100).toFixed(1)}% error rate in ${totalTime}ms`,
      )
    })

    it('should maintain consistent response times under load', async () => {
      const users = await createTestUsers(10)
      const responseTimes: number[] = []

      // Medir tiempos de respuesta individuales
      for (const user of users) {
        const startTime = Date.now()

        const response = await request(testContext.app)
          .post('/api/auth/login')
          .set(getAuthHeaders())
          .send({
            email: user.email,
            password: 'SecurePass123!',
          })

        const endTime = Date.now()
        const responseTime = endTime - startTime

        responseTimes.push(responseTime)
        expect(response.status).toBe(200)
      }

      // Calcular estadísticas
      const avgResponseTime =
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      const maxResponseTime = Math.max(...responseTimes)
      const minResponseTime = Math.min(...responseTimes)

      expect(avgResponseTime).toBeLessThan(300) // Promedio menor a 300ms
      expect(maxResponseTime).toBeLessThan(1000) // Máximo menor a 1 segundo

      console.log(
        `⏱️ Response times - Avg: ${avgResponseTime.toFixed(0)}ms, Min: ${minResponseTime}ms, Max: ${maxResponseTime}ms`,
      )
    })
  })

  describe('PERF-004: Memory Usage', () => {
    it('should not leak memory during multiple operations', async () => {
      const initialMemory = process.memoryUsage()

      // Ejecutar múltiples operaciones
      for (let i = 0; i < 50; i++) {
        const timestamp = Date.now() + i
        const userData = {
          email: `memory${timestamp}@example.com`,
          username: `memory${timestamp}`,
          password: 'SecurePass123!',
        }

        await request(testContext.app)
          .post('/api/auth/register')
          .set(getAuthHeaders())
          .send(userData)

        await request(testContext.app)
          .post('/api/auth/login')
          .set(getAuthHeaders())
          .send({
            email: userData.email,
            password: userData.password,
          })
      }

      const finalMemory = process.memoryUsage()
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed

      // Verificar que el aumento de memoria es razonable (menos de 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)

      console.log(`💾 Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`)
    })
  })

  describe('PERF-005: Throughput Testing', () => {
    it('should achieve target throughput for login operations', async () => {
      const users = await createTestUsers(50)

      const startTime = Date.now()

      const promises = users.map(user =>
        request(testContext.app).post('/api/auth/login').set(getAuthHeaders()).send({
          email: user.email,
          password: 'SecurePass123!',
        }),
      )

      const responses = await Promise.all(promises)
      const endTime = Date.now()
      const totalTime = (endTime - startTime) / 1000 // Convertir a segundos

      const throughput = responses.length / totalTime // requests por segundo

      // Verificar throughput mínimo de 20 req/sec
      expect(throughput).toBeGreaterThan(20)

      console.log(`🚀 Throughput: ${throughput.toFixed(1)} requests/second`)
    })

    it('should handle burst requests gracefully', async () => {
      const users = await createTestUsers(30)

      // Simular burst de requests
      const burstPromises = users.map((user, index) => {
        // Pequeño delay para simular requests reales
        return new Promise(resolve => {
          setTimeout(() => {
            void (async () => {
              const response = await request(testContext.app)
                .post('/api/auth/login')
                .set(getAuthHeaders())
                .send({
                  email: user.email,
                  password: 'SecurePass123!',
                })
              resolve(response)
            })()
          }, index * 10) // 10ms entre requests
        })
      })

      const startTime = Date.now()
      const responses = await Promise.all(burstPromises)
      const endTime = Date.now()
      const totalTime = endTime - startTime

      // Verificar que todos los requests fueron procesados
      expect(responses.length).toBe(30)

      // Verificar que el tiempo total es razonable
      expect(totalTime).toBeLessThan(5000)

      console.log(`💥 Burst test completed in ${totalTime}ms`)
    })
  })
})
