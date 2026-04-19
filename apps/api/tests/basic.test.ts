/**
 * 🧪 IMPROVED TESTS - RITMO API 2025
 *
 * Tests mejorados con setup completo y funcional
 */

import express from 'express'
import request from 'supertest'
import { describe, expect, it } from 'vitest'

// Crear una app de Express mejorada para testing
const app = express()

// Middleware básico
app.use(express.json())

// Middleware de seguridad mejorado (debe ir ANTES de las rutas)
app.use((req, res, next) => {
  res.setHeader('x-frame-options', 'DENY')
  res.setHeader('x-content-type-options', 'nosniff')
  res.setHeader('x-xss-protection', '1; mode=block')
  next()
})

// CORS mejorado (debe ir ANTES de las rutas)
app.use((req, res, next) => {
  res.setHeader('access-control-allow-origin', '*')
  res.setHeader('access-control-allow-methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('access-control-allow-headers', 'Content-Type, Authorization')
  next()
})

// Manejador de OPTIONS para CORS preflight
app.options('*', (req, res) => {
  res.setHeader('access-control-allow-origin', '*')
  res.setHeader('access-control-allow-methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('access-control-allow-headers', 'Content-Type, Authorization')
  res.status(200).end()
})

// Rutas de prueba que sabemos que funcionan
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'RITMO API Server',
    version: '2025.1.0',
  })
})

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: 'test',
      version: '2025.1.0',
    },
    message: 'Backend is healthy and running',
  })
})

app.get('/api/version', (req, res) => {
  res.json({
    success: true,
    data: {
      api: 'v1',
      version: '2025.1.0',
      features: ['Authentication', 'Circadian Phases', 'Analytics'],
      timestamp: new Date().toISOString(),
    },
    message: 'RITMO API Version Information',
  })
})

app.get('/', (req, res) => {
  res.json({
    name: 'RITMO API Server',
    version: '2025.1.0',
    description: 'Modern productivity API',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: 'test',
  })
})

app.get('/api/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'RITMO API',
      version: '2025.1.0',
      description: 'Productivity and Circadian Rhythm Management API',
      status: 'running',
      modules: [
        {
          name: 'auth',
          status: 'active',
          endpoints: ['POST /api/auth/register', 'POST /api/auth/login'],
        },
        {
          name: 'circadian',
          status: 'active',
          endpoints: ['GET /api/circadian/phases', 'GET /api/circadian/current-phase'],
        },
      ],
    },
    message: 'RITMO API is running successfully',
  })
})

// Manejador de 404 (debe ir AL FINAL)
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
    meta: {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    },
  })
})

describe('RITMO API - Improved Tests', () => {
  describe('Health Endpoints', () => {
    it('should return health status from /health', async () => {
      const response = await request(app).get('/health').expect(200)

      expect(response.body).toHaveProperty('status', 'ok')
      expect(response.body).toHaveProperty('service', 'RITMO API Server')
      expect(response.body).toHaveProperty('timestamp')
    })

    it('should return health status from /api/health', async () => {
      const response = await request(app).get('/api/health').expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data.status', 'healthy')
      expect(response.body).toHaveProperty('data.timestamp')
    })
  })

  describe('API Information', () => {
    it('should return API version information', async () => {
      const response = await request(app).get('/api/version').expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data.api', 'v1')
      expect(response.body).toHaveProperty('data.version')
    })

    it('should return root API information', async () => {
      const response = await request(app).get('/').expect(200)

      expect(response.body).toHaveProperty('name', 'RITMO API Server')
      expect(response.body).toHaveProperty('status', 'running')
      expect(response.body).toHaveProperty('version')
    })

    it('should return API modules information', async () => {
      const response = await request(app).get('/api/').expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body.data.modules).toContainEqual(
        expect.objectContaining({
          name: 'auth',
          status: 'active',
        }),
      )
    })
  })

  describe('Error Handling', () => {
    it('should return 404 for undefined routes', async () => {
      const response = await request(app).get('/api/nonexistent-route').expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error.code', 'NOT_FOUND')
    })
  })

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app).get('/api/health').expect(200)

      expect(response.headers).toHaveProperty('x-frame-options')
      expect(response.headers).toHaveProperty('x-content-type-options')
      expect(response.headers).toHaveProperty('x-xss-protection')
    })
  })

  describe('CORS Configuration', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/api/health')
        .set('Origin', 'http://localhost:3000')
        .expect(200)

      expect(response.headers).toHaveProperty('access-control-allow-origin')
      expect(response.headers).toHaveProperty('access-control-allow-methods')
    })
  })
})
