import { beforeEach, describe, expect, it, vi } from 'vitest'

const timerState: {
  activeTask: null | Record<string, unknown>
  remoteWorkSessionId: string | null
} = { activeTask: null, remoteWorkSessionId: null }

const timerStore = {
  get activeTask() {
    return timerState.activeTask
  },
  get remoteWorkSessionId() {
    return timerState.remoteWorkSessionId
  },
  hydrateFromActiveRemoteSession: vi.fn(),
  $state: {
    get activeTask() {
      return timerState.activeTask
    },
  },
}

const gate = {
  openFeedback: vi.fn(),
}

vi.mock('@/config/environment', () => ({
  loadConfig: () => ({ api: { baseUrl: 'http://localhost:3001/api' } }),
}))

vi.mock('@/stores/timer', () => ({
  useTimerStore: () => timerStore,
}))

vi.mock('@/stores/sessionGate', () => ({
  useSessionGateStore: () => gate,
}))

vi.mock('@/stores/workSessionRecovery', () => ({
  useWorkSessionRecoveryStore: () => ({
    dismissServerAbandonedBanner: vi.fn(),
    openServerAbandonedBanner: vi.fn(),
  }),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({ user: { timezone: 'UTC' } }),
}))

vi.mock('@/utils/lastTrackedWorkSession', () => ({
  getLastTrackedWorkSessionId: () => null,
}))

describe('restoreActiveWorkSessionIfAny — idempotency', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    timerState.activeTask = null
    timerState.remoteWorkSessionId = null
    const mod = await import('@/composables/timer/useActiveWorkSessionRestore')
    mod.__resetRestoreActiveWorkSessionCache()
  })

  it('deduplicates concurrent calls — exactly one fetch in-flight', async () => {
    let resolveFetch: (v: unknown) => void = () => {}
    const fetchMock = vi.fn(
      () =>
        new Promise(resolve => {
          resolveFetch = resolve
        }),
    )
    ;(globalThis as any).$fetch = fetchMock

    const { restoreActiveWorkSessionIfAny } = await import(
      '@/composables/timer/useActiveWorkSessionRestore'
    )

    const p1 = restoreActiveWorkSessionIfAny()
    const p2 = restoreActiveWorkSessionIfAny()
    const p3 = restoreActiveWorkSessionIfAny()

    resolveFetch({ data: { data: null } })
    await Promise.all([p1, p2, p3])

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('runs a new fetch for each sequential restore (dedup is concurrent-only)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ data: { data: null } })
    ;(globalThis as any).$fetch = fetchMock

    const { restoreActiveWorkSessionIfAny } = await import(
      '@/composables/timer/useActiveWorkSessionRestore'
    )

    await restoreActiveWorkSessionIfAny()
    await restoreActiveWorkSessionIfAny()
    await restoreActiveWorkSessionIfAny()

    expect(fetchMock).toHaveBeenCalledTimes(3)
  })
})
