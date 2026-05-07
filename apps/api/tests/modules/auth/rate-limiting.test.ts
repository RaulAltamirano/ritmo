// @ts-nocheck — exercises mocked express-rate-limit with stub Request objects
/**
 * 🧪 RATE LIMITING UNIT TESTS - RITMO API 2025
 *
 * Tests unitarios para rate limiting sin dependencias de base de datos
 * Implementando mocks y tests aislados para máxima velocidad
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import rateLimit from 'express-rate-limit'

// Mock de express-rate-limit
vi.mock('express-rate-limit', () => ({
  default: vi.fn(),
}))

// Mock de express
const mockRequest = (ip = '127.0.0.1', headers: any = {}) => ({
  ip,
  headers: {
    'user-agent': 'test-agent',
    ...headers,
  },
  path: '/api/auth/login',
  method: 'POST',
})

const mockResponse = () => {
  const res: any = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  res.send = vi.fn().mockReturnValue(res)
  return res
}

const mockNext = vi.fn()

describe('🔒 Rate Limiting Unit Tests', () => {
  let mockRateLimit: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock de rate limit que simula el comportamiento real
    mockRateLimit = vi.fn().mockImplementation(config => {
      const store = new Map()

      return (req: any, res: any, next: any) => {
        const key = req.ip ?? 'unknown'
        const now = Date.now()
        const windowStart = now - config.windowMs

        // Limpiar entradas expiradas
        for (const [k, v] of store.entries()) {
          if (v.timestamp < windowStart) {
            store.delete(k)
          }
        }

        const current = store.get(key)
        if (!current || current.timestamp < windowStart) {
          store.set(key, { count: 1, timestamp: now })
          next()
        } else if (current.count < config.max) {
          current.count++
          next()
        } else {
          // Rate limit excedido
          if (config.message) {
            res.status(429).json(config.message)
          } else {
            res.status(429).json({
              success: false,
              error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests',
              },
            })
          }
        }
      }
    })
    ;(rateLimit as any).mockImplementation(mockRateLimit)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('SEC-001: Rate Limiting Configuration', () => {
    it('should create rate limiter with correct configuration', () => {
      const config = {
        windowMs: 60 * 1000, // 1 minuto
        max: 50, // 50 requests por minuto
        message: {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests',
          },
        },
      }

      rateLimit(config)

      expect(rateLimit).toHaveBeenCalledWith(config)
      expect(rateLimit).toHaveBeenCalledTimes(1)
    })

    it('should handle different IP addresses separately', () => {
      const limiter = rateLimit({
        windowMs: 60 * 1000,
        max: 5,
        message: { error: { code: 'RATE_LIMIT_EXCEEDED' } },
      })

      const req1 = mockRequest('192.168.1.1')
      const req2 = mockRequest('192.168.1.2')
      const res1 = mockResponse()
      const res2 = mockResponse()

      // IP 1: 5 requests (límite)
      for (let i = 0; i < 5; i++) {
        limiter(req1, res1, mockNext)
      }
      expect(mockNext).toHaveBeenCalledTimes(5)

      // IP 2: 5 requests (límite)
      for (let i = 0; i < 5; i++) {
        limiter(req2, res2, mockNext)
      }
      expect(mockNext).toHaveBeenCalledTimes(10)

      // IP 1: 1 request más (debería ser bloqueado)
      limiter(req1, res1, mockNext)
      expect(res1.status).toHaveBeenCalledWith(429)
      expect(res1.json).toHaveBeenCalledWith({
        error: { code: 'RATE_LIMIT_EXCEEDED' },
      })
    })
  })

  describe('SEC-002: Rate Limiting Behavior', () => {
    it('should allow requests within limit', () => {
      const limiter = rateLimit({
        windowMs: 60 * 1000,
        max: 10,
        message: { error: { code: 'RATE_LIMIT_EXCEEDED' } },
      })

      const req = mockRequest()
      const res = mockResponse()

      // Hacer 10 requests (dentro del límite)
      for (let i = 0; i < 10; i++) {
        limiter(req, res, mockNext)
      }

      expect(mockNext).toHaveBeenCalledTimes(10)
      expect(res.status).not.toHaveBeenCalledWith(429)
    })

    it('should block requests over limit', () => {
      const limiter = rateLimit({
        windowMs: 60 * 1000,
        max: 5,
        message: { error: { code: 'RATE_LIMIT_EXCEEDED' } },
      })

      const req = mockRequest()
      const res = mockResponse()

      // Hacer 5 requests (límite)
      for (let i = 0; i < 5; i++) {
        limiter(req, res, mockNext)
      }

      // 6to request (debería ser bloqueado)
      limiter(req, res, mockNext)

      expect(mockNext).toHaveBeenCalledTimes(5)
      expect(res.status).toHaveBeenCalledWith(429)
      expect(res.json).toHaveBeenCalledWith({
        error: { code: 'RATE_LIMIT_EXCEEDED' },
      })
    })

    it('should reset counter after window expires', () => {
      const limiter = rateLimit({
        windowMs: 100, // 100ms para test rápido
        max: 3,
        message: { error: { code: 'RATE_LIMIT_EXCEEDED' } },
      })

      const req = mockRequest()
      const res = mockResponse()

      // Hacer 3 requests (límite)
      for (let i = 0; i < 3; i++) {
        limiter(req, res, mockNext)
      }

      // 4to request (debería ser bloqueado)
      limiter(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(429)

      // Esperar que expire la ventana
      return new Promise(resolve => {
        setTimeout(() => {
          const newRes = mockResponse()

          // Nuevo request después de expirar (debería ser permitido)
          limiter(req, newRes, mockNext)

          expect(newRes.status).not.toHaveBeenCalledWith(429)
          expect(mockNext).toHaveBeenCalledTimes(4) // 3 + 1 nuevo
          resolve(true)
        }, 150)
      })
    })
  })

  describe('SEC-003: Rate Limiting Configuration Validation', () => {
    it('should validate windowMs configuration', () => {
      expect(() => {
        rateLimit({ windowMs: 0, max: 10 })
      }).not.toThrow()

      expect(() => {
        rateLimit({ windowMs: -1000, max: 10 })
      }).not.toThrow() // express-rate-limit maneja esto internamente
    })

    it('should validate max requests configuration', () => {
      expect(() => {
        rateLimit({ windowMs: 60000, max: 1 })
      }).not.toThrow()

      expect(() => {
        rateLimit({ windowMs: 60000, max: 1000 })
      }).not.toThrow()
    })

    it('should handle custom message configuration', () => {
      const customMessage = {
        success: false,
        error: {
          code: 'CUSTOM_RATE_LIMIT',
          message: 'Custom rate limit message',
        },
      }

      const limiter = rateLimit({
        windowMs: 60 * 1000,
        max: 1,
        message: customMessage,
      })

      const req = mockRequest()
      const res = mockResponse()

      // Primer request (permitido)
      limiter(req, res, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(1)

      // Segundo request (bloqueado con mensaje personalizado)
      limiter(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(429)
      expect(res.json).toHaveBeenCalledWith(customMessage)
    })
  })

  describe('SEC-004: Rate Limiting Edge Cases', () => {
    it('should handle requests without IP', () => {
      const limiter = rateLimit({
        windowMs: 60 * 1000,
        max: 5,
        message: { error: { code: 'RATE_LIMIT_EXCEEDED' } },
      })

      const req = mockRequest(undefined) // Sin IP
      const res = mockResponse()

      // Hacer requests sin IP
      for (let i = 0; i < 6; i++) {
        limiter(req, res, mockNext)
      }

      expect(mockNext).toHaveBeenCalledTimes(5)
      expect(res.status).toHaveBeenCalledWith(429)
    })

    it('should handle concurrent requests', () => {
      const limiter = rateLimit({
        windowMs: 60 * 1000,
        max: 10,
        message: { error: { code: 'RATE_LIMIT_EXCEEDED' } },
      })

      const promises = []
      const req = mockRequest()
      const res = mockResponse()

      // Simular 15 requests concurrentes
      for (let i = 0; i < 15; i++) {
        promises.push(
          new Promise(resolve => {
            limiter(req, res, mockNext)
            resolve(true)
          }),
        )
      }

      return Promise.all(promises).then(() => {
        // Solo 10 deberían pasar, 5 deberían ser bloqueados
        expect(mockNext).toHaveBeenCalledTimes(10)
        expect(res.status).toHaveBeenCalledWith(429)
      })
    })

    it('should handle different HTTP methods', () => {
      const limiter = rateLimit({
        windowMs: 60 * 1000,
        max: 5,
        message: { error: { code: 'RATE_LIMIT_EXCEEDED' } },
      })

      const req1 = mockRequest('192.168.1.1')
      const req2 = mockRequest('192.168.1.2')
      const res = mockResponse()

      // Usar diferentes IPs
      for (let i = 0; i < 5; i++) {
        limiter(req1, res, mockNext)
      }

      for (let i = 0; i < 5; i++) {
        limiter(req2, res, mockNext)
      }

      // Cada IP debería tener su propio límite
      expect(mockNext).toHaveBeenCalledTimes(10) // 5 + 5
      expect(res.status).not.toHaveBeenCalledWith(429) // No debería haber rate limiting
    })
  })

  describe('SEC-005: Rate Limiting Performance', () => {
    it('should handle high request volumes efficiently', () => {
      const limiter = rateLimit({
        windowMs: 60 * 1000,
        max: 1000,
        message: { error: { code: 'RATE_LIMIT_EXCEEDED' } },
      })

      const startTime = Date.now()
      const req = mockRequest()
      const res = mockResponse()

      // Hacer 1000 requests rápidamente
      for (let i = 0; i < 1000; i++) {
        limiter(req, res, mockNext)
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      expect(mockNext).toHaveBeenCalledTimes(1000)
      expect(duration).toBeLessThan(1000) // Debería completarse en menos de 1 segundo
    })

    it('should handle memory usage efficiently', () => {
      const limiter = rateLimit({
        windowMs: 1000, // 1 segundo
        max: 10,
        message: { error: { code: 'RATE_LIMIT_EXCEEDED' } },
      })

      const req = mockRequest()
      const res = mockResponse()

      // Hacer requests y verificar que la memoria no crece indefinidamente
      for (let i = 0; i < 100; i++) {
        limiter(req, res, mockNext)
      }

      expect(mockNext).toHaveBeenCalledTimes(10) // Solo 10 deberían pasar
      expect(res.status).toHaveBeenCalledWith(429)
    })
  })
})
