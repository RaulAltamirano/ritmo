const CHANNEL_NAME = 'ritmo-auth-refresh'
const LOCK_KEY = 'ritmo-auth-refresh-lock'
const REFRESH_TIMEOUT_MS = 10_000

interface RefreshLock {
  owner: string
  timestamp: number
  status: 'refreshing' | 'done'
  success?: boolean
}

interface RefreshMessage {
  type: 'start' | 'done'
  success?: boolean
}

const getStorage = (): Storage | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

const parseLock = (value: string | null): RefreshLock | null => {
  try {
    return value ? (JSON.parse(value) as RefreshLock) : null
  } catch {
    return null
  }
}

const readLock = (storage: Storage): RefreshLock | null => {
  try {
    return parseLock(storage.getItem(LOCK_KEY))
  } catch {
    return null
  }
}

const isActiveLock = (lock: RefreshLock | null) =>
  lock?.status === 'refreshing' && Date.now() - lock.timestamp < REFRESH_TIMEOUT_MS

const createChannel = (): BroadcastChannel | null => {
  try {
    return typeof BroadcastChannel === 'undefined'
      ? null
      : new BroadcastChannel(CHANNEL_NAME)
  } catch {
    return null
  }
}

const waitForLeader = (channel: BroadcastChannel | null): Promise<boolean> =>
  new Promise(resolve => {
    let settled = false
    const finish = (success: boolean) => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      channel?.removeEventListener('message', onMessage)
      globalThis.removeEventListener?.('storage', onStorage)
      resolve(success)
    }
    const onMessage = (event: MessageEvent<RefreshMessage>) => {
      if (event.data?.type === 'done') finish(event.data.success === true)
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key !== LOCK_KEY || !event.newValue) return
      const lock = parseLock(event.newValue)
      if (lock?.status === 'done') finish(lock.success === true)
    }
    const timeout = setTimeout(() => finish(false), REFRESH_TIMEOUT_MS)

    channel?.addEventListener('message', onMessage)
    globalThis.addEventListener?.('storage', onStorage)
  })

const acquireLock = (storage: Storage | null, owner: string): boolean => {
  if (!storage) return true
  const existingLock = readLock(storage)
  if (isActiveLock(existingLock)) return false

  try {
    storage.setItem(
      LOCK_KEY,
      JSON.stringify({
        owner,
        timestamp: Date.now(),
        status: 'refreshing',
      } satisfies RefreshLock),
    )
    return readLock(storage)?.owner === owner
  } catch {
    return true
  }
}

const publishResult = (
  channel: BroadcastChannel | null,
  storage: Storage | null,
  owner: string,
  success: boolean,
) => {
  channel?.postMessage({ type: 'done', success } satisfies RefreshMessage)
  if (!storage || readLock(storage)?.owner !== owner) return

  try {
    storage.setItem(
      LOCK_KEY,
      JSON.stringify({
        owner,
        timestamp: Date.now(),
        status: 'done',
        success,
      } satisfies RefreshLock),
    )
    storage.removeItem(LOCK_KEY)
  } catch {
    // Storage can become unavailable while a refresh is in flight.
  }
}

export const coordinateRefresh = async (
  doRefresh: () => Promise<boolean>,
): Promise<boolean> => {
  const channel = createChannel()
  const storage = getStorage()
  const owner = `${Date.now()}-${Math.random()}`

  if (!acquireLock(storage, owner)) {
    const result = await waitForLeader(channel)
    channel?.close()
    return result
  }

  channel?.postMessage({ type: 'start' } satisfies RefreshMessage)
  let success = false
  try {
    success = await doRefresh()
    return success
  } catch {
    return false
  } finally {
    publishResult(channel, storage, owner, success)
    channel?.close()
  }
}
