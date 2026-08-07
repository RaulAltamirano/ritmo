import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

const mockInitAuth = vi.fn()

vi.mock('~/composables/auth', () => ({
  useAuth: () => ({
    isAuthenticated: ref(false),
    initAuth: mockInitAuth,
  }),
}))

vi.mock('~/config/protected-routes', () => ({
  isPublicRoute: () => true,
  requiresAuthentication: () => false,
}))

describe('auth.global middleware', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    ;(globalThis as any).defineNuxtRouteMiddleware = (middleware: any) => middleware
  })

  it('retries authentication initialization after a transient failure', async () => {
    mockInitAuth
      .mockResolvedValueOnce({ success: false, shouldRedirect: false })
      .mockResolvedValueOnce({ success: true })
    const { default: middleware } = await import('~/middleware/auth.global')
    const route = { path: '/', fullPath: '/' }

    await middleware(route)
    await middleware(route)

    expect(mockInitAuth).toHaveBeenCalledTimes(2)
  })
})
