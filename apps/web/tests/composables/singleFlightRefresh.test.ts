import {
  getGlobalRefreshState,
  getRefreshPromise,
  resetGlobalRefreshState,
  runSingleFlightRefresh,
} from '@/composables/auth/useGlobalRefreshState'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('runSingleFlightRefresh', () => {
  beforeEach(() => {
    resetGlobalRefreshState()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('invokes doRefresh once for concurrent callers', async () => {
    const doRefresh = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
      return true
    })

    const [first, second] = await Promise.all([
      runSingleFlightRefresh(doRefresh),
      runSingleFlightRefresh(doRefresh),
    ])

    expect(first).toBe(true)
    expect(second).toBe(true)
    expect(doRefresh).toHaveBeenCalledTimes(1)
  })

  it('clears shared state after a rejected refresh', async () => {
    const doRefresh = vi.fn().mockRejectedValue(new Error('refresh failed'))

    await expect(runSingleFlightRefresh(doRefresh)).resolves.toBe(false)

    expect(getRefreshPromise()).toBeNull()
    expect(getGlobalRefreshState()).toEqual({
      isRefreshing: false,
      hasRefreshPromise: false,
      queueLength: 0,
    })
  })

  it('waits for another tab through the localStorage fallback', async () => {
    vi.useFakeTimers()
    const doRefresh = vi.fn().mockResolvedValue(true)
    const owner = 'other-tab'
    localStorage.setItem(
      'ritmo-auth-refresh-lock',
      JSON.stringify({ owner, timestamp: Date.now(), status: 'refreshing' }),
    )

    const refresh = runSingleFlightRefresh(doRefresh)
    const completedLock = JSON.stringify({
      owner,
      timestamp: Date.now(),
      status: 'done',
      success: true,
    })
    localStorage.setItem('ritmo-auth-refresh-lock', completedLock)
    localStorage.removeItem('ritmo-auth-refresh-lock')
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'ritmo-auth-refresh-lock',
        newValue: completedLock,
      }),
    )
    await vi.advanceTimersByTimeAsync(10_000)

    await expect(refresh).resolves.toBe(true)
    expect(doRefresh).not.toHaveBeenCalled()
  })
})
