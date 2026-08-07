import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockFetch = vi.fn()
const mockRefreshToken = vi.fn()
const mockRunSingleFlightRefresh = vi.fn((refresh: () => Promise<boolean>) => refresh())
const mockIsAuthenticationError = vi.fn((error: any) => error?.status === 401)

vi.mock('@/composables/shared/useHttpClient', () => ({
  useHttpClient: () => ({ fetch: mockFetch }),
}))

vi.mock('@/composables/auth/useAuthAPI', () => ({
  useAuthAPI: () => ({ refreshToken: mockRefreshToken }),
}))

vi.mock('@/composables/auth/useGlobalRefreshState', () => ({
  runSingleFlightRefresh: mockRunSingleFlightRefresh,
  getGlobalRefreshState: () => ({
    isRefreshing: false,
    hasRefreshPromise: false,
    queueLength: 0,
  }),
}))

vi.mock('@/utils/authError', () => ({
  isAuthenticationError: mockIsAuthenticationError,
}))

vi.mock('@/utils/deviceFingerprint', () => ({
  getCurrentDeviceFingerprint: () =>
    Promise.resolve({
      deviceId: 'device-id',
      deviceType: 'desktop',
      browser: 'test',
      os: 'test',
    }),
}))

// setup.ts globally stubs this composable — restore the real module for this suite
vi.unmock('~/composables/auth/useAuthenticatedHttpClient')
vi.unmock('@/composables/auth/useAuthenticatedHttpClient')

describe('useAuthenticatedHttpClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses the shared auth detector and single-flight refresh runner', async () => {
    mockFetch.mockRejectedValueOnce({ status: 401 }).mockResolvedValueOnce({ success: true })
    mockRefreshToken.mockResolvedValue({ success: true })
    const { useAuthenticatedHttpClient } = await import(
      '@/composables/auth/useAuthenticatedHttpClient'
    )

    const result = await useAuthenticatedHttpClient().get('/protected')

    expect(result).toEqual({ success: true })
    expect(mockIsAuthenticationError).toHaveBeenCalledWith({ status: 401 })
    expect(mockRunSingleFlightRefresh).toHaveBeenCalledOnce()
  })
})
