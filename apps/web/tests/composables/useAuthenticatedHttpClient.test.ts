import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockFetch = vi.fn()
const mockRefreshToken = vi.fn()
const mockRunSingleFlightRefresh = vi.fn((refresh: () => Promise<boolean>) => refresh())
const mockIsAuthenticationError = vi.fn((error: any) => error?.status === 401)
const mockClearAuth = vi.fn()
const mockNavigateTo = vi.fn()

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

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({ clearAuth: mockClearAuth }),
}))

vi.stubGlobal('navigateTo', mockNavigateTo)
vi.stubGlobal('process', { client: true })

// setup.ts globally stubs this composable — restore the real module for this suite
vi.unmock('~/composables/auth/useAuthenticatedHttpClient')
vi.unmock('@/composables/auth/useAuthenticatedHttpClient')

describe('useAuthenticatedHttpClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRunSingleFlightRefresh.mockImplementation((refresh: () => Promise<boolean>) =>
      refresh(),
    )
  })

  it('retries once on auth error before refreshing (interceptor may have rotated)', async () => {
    mockFetch
      .mockRejectedValueOnce({ status: 401 })
      .mockResolvedValueOnce({ success: true })
    const { useAuthenticatedHttpClient } = await import(
      '@/composables/auth/useAuthenticatedHttpClient'
    )

    const result = await useAuthenticatedHttpClient().get('/protected')

    expect(result).toEqual({ success: true })
    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(mockRunSingleFlightRefresh).not.toHaveBeenCalled()
    expect(mockRefreshToken).not.toHaveBeenCalled()
  })

  it('runs single-flight refresh then retries when the first retry still auth-fails', async () => {
    mockFetch
      .mockRejectedValueOnce({ status: 401 })
      .mockRejectedValueOnce({ status: 401 })
      .mockResolvedValueOnce({ success: true })
    mockRefreshToken.mockResolvedValue({ success: true })
    const { useAuthenticatedHttpClient } = await import(
      '@/composables/auth/useAuthenticatedHttpClient'
    )

    const result = await useAuthenticatedHttpClient().get('/protected')

    expect(result).toEqual({ success: true })
    expect(mockIsAuthenticationError).toHaveBeenCalledWith({ status: 401 })
    expect(mockRunSingleFlightRefresh).toHaveBeenCalledOnce()
    expect(mockFetch).toHaveBeenCalledTimes(3)
  })

  it('clears auth when refresh fails after the first retry', async () => {
    mockFetch.mockRejectedValue({ status: 401 })
    mockRefreshToken.mockResolvedValue({ success: false })
    const { useAuthenticatedHttpClient } = await import(
      '@/composables/auth/useAuthenticatedHttpClient'
    )

    await expect(useAuthenticatedHttpClient().get('/protected')).rejects.toThrow(
      'Authentication required',
    )

    expect(mockRunSingleFlightRefresh).toHaveBeenCalledOnce()
    expect(mockClearAuth).toHaveBeenCalledOnce()
    expect(mockNavigateTo).toHaveBeenCalledWith(
      '/auth/login?reason=authentication_required',
    )
  })
})
