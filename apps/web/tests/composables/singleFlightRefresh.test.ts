import {
  getGlobalRefreshState,
  getRefreshPromise,
  resetGlobalRefreshState,
  runSingleFlightRefresh,
} from '@/composables/auth/useGlobalRefreshState'
import { coordinateRefresh } from '@/composables/auth/refreshCoordinator'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

class MockBroadcastChannel extends EventTarget {
  static channels = new Map<string, Set<MockBroadcastChannel>>()

  constructor(private readonly channelName: string) {
    super()
    const channels = MockBroadcastChannel.channels.get(channelName) ?? new Set()
    channels.add(this)
    MockBroadcastChannel.channels.set(channelName, channels)
  }

  postMessage(data: unknown) {
    for (const channel of MockBroadcastChannel.channels.get(this.channelName) ?? []) {
      if (channel !== this) {
        queueMicrotask(() =>
          channel.dispatchEvent(new MessageEvent('message', { data })),
        )
      }
    }
  }

  close() {
    MockBroadcastChannel.channels.get(this.channelName)?.delete(this)
  }

  static reset() {
    MockBroadcastChannel.channels.clear()
  }
}

describe('runSingleFlightRefresh', () => {
  const originalBroadcastChannel = globalThis.BroadcastChannel

  beforeEach(() => {
    resetGlobalRefreshState()
    localStorage.clear()
    MockBroadcastChannel.reset()
  })

  afterEach(() => {
    vi.useRealTimers()
    globalThis.BroadcastChannel = originalBroadcastChannel
    vi.restoreAllMocks()
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

  it('elects one BroadcastChannel leader when storage is unavailable', async () => {
    globalThis.BroadcastChannel =
      MockBroadcastChannel as unknown as typeof BroadcastChannel
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })
    const doRefresh = vi.fn().mockResolvedValue(true)

    const first = coordinateRefresh(doRefresh)
    const second = coordinateRefresh(doRefresh)

    await expect(Promise.all([first, second])).resolves.toEqual([true, true])
    expect(doRefresh).toHaveBeenCalledTimes(1)
  })

  it('reads a persisted completion missed before follower subscription', async () => {
    vi.useFakeTimers()
    globalThis.BroadcastChannel = undefined as unknown as typeof BroadcastChannel
    const owner = 'other-tab'
    const activeLock = JSON.stringify({
      owner,
      timestamp: Date.now(),
      status: 'refreshing',
    })
    const completedLock = JSON.stringify({
      owner,
      timestamp: Date.now(),
      status: 'done',
      success: true,
    })
    vi.spyOn(Storage.prototype, 'getItem')
      .mockReturnValueOnce(activeLock)
      .mockReturnValue(completedLock)
    const doRefresh = vi.fn().mockResolvedValue(true)

    const refresh = coordinateRefresh(doRefresh)
    await vi.advanceTimersByTimeAsync(100)

    await expect(refresh).resolves.toBe(true)
    expect(doRefresh).not.toHaveBeenCalled()
  })
})
