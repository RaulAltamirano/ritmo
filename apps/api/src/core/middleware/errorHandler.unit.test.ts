import { describe, expect, it, vi } from 'vitest'
import type { Request, Response } from 'express'
import { ApiError } from '../../../src/core/middleware/errorHandler.js'
import { errorHandler } from '../../../src/core/middleware/errorHandler.js'

function mockRes() {
  const res = {
    statusCode: 0,
    body: null as unknown,
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(payload: unknown) {
      this.body = payload
      return this
    },
  }
  return res as unknown as Response & { statusCode: number; body: any }
}

describe('errorHandler ApiError', () => {
  it('preserves the ApiError code instead of forcing INTERNAL_ERROR', () => {
    const req = {
      requestId: 'req-1',
      path: '/x',
      method: 'GET',
      get: () => undefined,
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' },
      body: {},
      query: {},
      params: {},
    } as unknown as Request
    const res = mockRes()
    const err = new ApiError(400, 'VALIDATION_ERROR', 'Bad input')

    errorHandler(err, req, res, vi.fn())

    expect(res.statusCode).toBe(400)
    expect(res.body?.error?.code).toBe('VALIDATION_ERROR')
    expect(res.body?.error?.message).toBe('Bad input')
  })
})
