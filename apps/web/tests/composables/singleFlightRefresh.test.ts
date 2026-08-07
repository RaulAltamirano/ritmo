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
  static deliveryDelay:
    | ((
        sender: MockBroadcastChannel,
        receiver: MockBroadcastChannel,
        data: unknown,
      ) => number)
    | null = null

  constructor(private readonly channelName: string) {
    super()
    const channels = MockBroadcastChannel.channels.get(channelName) ?? new Set()
    channels.add(this)
    MockBroadcastChannel.channels.set(channelName, channels)
  }

  postMessage(data: unknown) {
    for (const channel of MockBroadcastChannel.channels.get(this.channelName) ?? []) {
      if (channel !== this) {
        const deliver = () =>
          channel.dispatchEvent(new MessageEvent('message', { data }))
        const delay = MockBroadcastChannel.deliveryDelay?.(this, channel, data) ?? 0
        if (delay > 0) {
          setTimeout(deliver, delay)
        } else {
          queueMicrotask(deliver)
        }
      }
    }
  }

  close() {
    MockBroadcastChannel.channels.get(this.channelName)?.delete(this)
  }

  static reset() {
    MockBroadcastChannel.channels.clear()
    MockBroadcastChannel.deliveryDelay = null
  }
}

describe('runSingleFlightRefresh', () => {
  const originalBroadcastChannel = globalThis.BroadcastChannel

  beforeEach(() => {
    resetGlobalRefreshState()
    localStorage.clear()
    MockBroadcastChannel.reset()
    globalThis.BroadcastChannel =
      MockBroadcastChannel as unknown as typeof BroadcastChannel
  })

  afterEach(() => {
    vi.useRealTimers()
    globalThis.BroadcastChannel = originalBroadcastChannel
    vi.unstubAllGlobals()
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

  it('settles delayed asymmetric claims before starting a refresh', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-06T12:00:00Z'))
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.1).mockReturnValueOnce(0.9)
    MockBroadcastChannel.deliveryDelay = (_sender, _receiver, data) => {
      const message = data as { owner?: string }
      return message.owner?.endsWith('-0.1') ? 60 : 0
    }
    const doRefresh = vi.fn().mockResolvedValue(true)

    const result = Promise.all([
      coordinateRefresh(doRefresh),
      coordinateRefresh(doRefresh),
    ])
    await vi.advanceTimersByTimeAsync(500)

    await expect(result).resolves.toEqual([true, true])
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

  it('elects one channel leader when storage is unavailable', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.9).mockReturnValueOnce(0.1)
    const doRefresh = vi.fn().mockResolvedValue(true)

    const [first, second] = await Promise.all([
      coordinateRefresh(doRefresh),
      coordinateRefresh(doRefresh),
    ])

    expect(first).toBe(true)
    expect(second).toBe(true)
    expect(doRefresh).toHaveBeenCalledTimes(1)
  })

  it('uses Web Locks ifAvailable so only one tab runs doRefresh', async () => {
    let held = false
    const locks = {
      request: vi.fn(
        async (
          _name: string,
          _options: { ifAvailable?: boolean },
          callback: (lock: { name: string } | null) => Promise<void>,
        ) => {
          if (held) {
            await callback(null)
            return
          }
          held = true
          try {
            await callback({ name: 'ritmo-auth-refresh-lock' })
          } finally {
            held = false
          }
        },
      ),
    }
    vi.stubGlobal('navigator', { locks })
    const doRefresh = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 30))
      return true
    })

    const results = await Promise.all([
      coordinateRefresh(doRefresh),
      coordinateRefresh(doRefresh),
    ])

    expect(results).toEqual([true, true])
    expect(doRefresh).toHaveBeenCalledTimes(1)
    expect(locks.request).toHaveBeenCalled()
  })

  it('does not poison retries after a recent failed done lock', async () => {
    localStorage.setItem(
      'ritmo-auth-refresh-lock',
      JSON.stringify({
        owner: 'other-tab',
        timestamp: Date.now(),
        status: 'done',
        success: false,
      }),
    )
    const doRefresh = vi.fn().mockResolvedValue(true)

    await expect(coordinateRefresh(doRefresh)).resolves.toBe(true)
    expect(doRefresh).toHaveBeenCalledTimes(1)
  })

  it('lets a Web Locks follower observe channel done without storage', async () => {
    let held = false
    const locks = {
      request: vi.fn(
        async (
          _name: string,
          _options: { ifAvailable?: boolean },
          callback: (lock: { name: string } | null) => Promise<void>,
        ) => {
          if (held) {
            await callback(null)
            return
          }
          held = true
          try {
            await callback({ name: 'ritmo-auth-refresh-lock' })
          } finally {
            held = false
          }
        },
      ),
    }
    vi.stubGlobal('navigator', { locks })
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })
    const doRefresh = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 20))
      return true
    })

    const results = await Promise.all([
      coordinateRefresh(doRefresh),
      coordinateRefresh(doRefresh),
    ])

    expect(results).toEqual([true, true])
    expect(doRefresh).toHaveBeenCalledTimes(1)
  })

  it('skips doRefresh when a successful done appears after acquiring the Web Lock', async () => {
    const locks = {
      request: vi.fn(
        async (
          _name: string,
          _options: { ifAvailable?: boolean },
          callback: (lock: { name: string } | null) => Promise<void>,
        ) => {
          // Peer finished while we waited for the exclusive lock.
          localStorage.setItem(
            'ritmo-auth-refresh-lock',
            JSON.stringify({
              owner: 'other-tab',
              timestamp: Date.now(),
              status: 'done',
              success: true,
            }),
          )
          await callback({ name: 'ritmo-auth-refresh-lock' })
        },
      ),
    }
    vi.stubGlobal('navigator', { locks })
    localStorage.setItem(
      'ritmo-auth-refresh-lock',
      JSON.stringify({
        owner: 'other-tab',
        timestamp: Date.now(),
        status: 'refreshing',
      }),
    )
    const doRefresh = vi.fn().mockResolvedValue(true)

    await expect(coordinateRefresh(doRefresh)).resolves.toBe(true)
    expect(doRefresh).not.toHaveBeenCalled()
  })
})
