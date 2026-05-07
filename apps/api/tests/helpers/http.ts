import type { Application } from 'express'
import request, { type Test } from 'supertest'
import { expect } from 'vitest'

/** One Express app per process; safe with Vitest single-thread pool. If maxThreads > 1 later, call `resetAppCache()` per worker or shard DBs. */
let cachedApp: Application | null = null

/** Lazy Express app — load after worker DATABASE_URL is configured. */
export async function app(): Promise<Application> {
  if (!cachedApp) {
    const mod = await import('../../src/app.js')
    cachedApp = mod.default
  }
  return cachedApp
}

/** Optional reset when tests need a fresh module graph (rare). */
export function resetAppCache(): void {
  cachedApp = null
}

export function defaultHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'User-Agent': 'RITMO-Test-Suite/1.0.0',
  }
}

/** Same as `defaultHeaders()` — used by tests that call `request(app)` without cookies. */
export function getAuthHeaders(): Record<string, string> {
  return defaultHeaders()
}

export interface AuthedHttp {
  get: (url: string) => request.Test
  post: (url: string) => request.Test
  put: (url: string) => request.Test
  patch: (url: string) => request.Test
  delete: (url: string) => request.Test
}

export function authedHttp(expressApp: Application, accessToken: string): AuthedHttp {
  const cookie = `access_token=${accessToken}`
  const agent = request(expressApp) as {
    [K in 'get' | 'post' | 'put' | 'patch' | 'delete']: (u: string) => Test
  }
  const withJson = (method: keyof AuthedHttp) => (url: string) =>
    agent[method](url)
      .set('Cookie', cookie)
      .set('Content-Type', 'application/json')
      .set('User-Agent', 'RITMO-Test-Suite/1.0.0')

  return {
    get: url => withJson('get')(url),
    post: url => withJson('post')(url),
    put: url => withJson('put')(url),
    patch: url => withJson('patch')(url),
    delete: url => withJson('delete')(url),
  }
}

/** Assert API error envelope ({ success, error.code }) used by ApiResponses. */
export function expectApiError(
  res: { status: number; body: { success?: boolean; error?: { code?: string } } },
  opts: { status: number; code: string },
): void {
  expect(res.status).toBe(opts.status)
  expect(res.body?.success).toBe(false)
  expect(res.body?.error?.code).toBe(opts.code)
}
