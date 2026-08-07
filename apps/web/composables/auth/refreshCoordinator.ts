const CHANNEL_NAME = 'ritmo-auth-refresh'
const LOCK_KEY = 'ritmo-auth-refresh-lock'
const REFRESH_TIMEOUT_MS = 10_000
const CLAIM_WINDOW_MS = 25
const CLAIM_SETTLE_MS = 125
const LEADER_CONFIRM_MS = 25

interface RefreshLock {
  owner: string
  timestamp: number
  status: 'refreshing' | 'done'
  success?: boolean
}

interface RefreshMessage {
  type: 'claim' | 'leader' | 'leader-conflict' | 'done'
  owner: string
  success?: boolean
}

interface StorageSnapshot {
  storage: Storage
  lock: RefreshLock | null
}

const getStorageSnapshot = (): StorageSnapshot | null => {
  try {
    if (typeof localStorage === 'undefined') return null
    return { storage: localStorage, lock: parseLock(localStorage.getItem(LOCK_KEY)) }
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

const isActiveLock = (lock: RefreshLock | null): lock is RefreshLock =>
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

const delay = (milliseconds: number) =>
  new Promise(resolve => setTimeout(resolve, milliseconds))

const createObserver = (
  channel: BroadcastChannel | null,
  storage: Storage | null,
  owner: string,
) => {
  const claims = new Set([owner])
  const leaders = new Set<string>()
  const results = new Map<string, boolean>()
  const resultListeners = new Set<() => void>()
  let isLeader = false

  const notifyResult = (resultOwner: string, success: boolean) => {
    results.set(resultOwner, success)
    for (const listener of resultListeners) listener()
  }
  const onMessage = (event: MessageEvent<RefreshMessage>) => {
    const message = event.data
    if (!message?.owner) return
    if (message.type === 'claim') {
      const isNewClaim = !claims.has(message.owner)
      claims.add(message.owner)
      if (isLeader) {
        channel?.postMessage({ type: 'leader', owner } satisfies RefreshMessage)
      } else if (isNewClaim) {
        channel?.postMessage({ type: 'claim', owner } satisfies RefreshMessage)
      }
    } else if (message.type === 'leader') {
      leaders.add(message.owner)
      const lowestClaim = [...claims].sort()[0]
      if (lowestClaim && lowestClaim < message.owner) {
        channel?.postMessage({
          type: 'leader-conflict',
          owner: lowestClaim,
        } satisfies RefreshMessage)
      }
    } else if (message.type === 'leader-conflict') {
      claims.add(message.owner)
    } else if (message.type === 'done') {
      notifyResult(message.owner, message.success === true)
    }
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key !== LOCK_KEY || !event.newValue) return
    const lock = parseLock(event.newValue)
    if (lock?.status === 'done') notifyResult(lock.owner, lock.success === true)
  }
  channel?.addEventListener('message', onMessage)
  globalThis.addEventListener?.('storage', onStorage)

  const waitForResult = (leaderOwner: string): Promise<boolean> =>
    new Promise(resolve => {
      const finish = (success: boolean) => {
        clearTimeout(timeout)
        clearInterval(poll)
        resultListeners.delete(checkResult)
        resolve(success)
      }
      const checkResult = () => {
        if (results.has(leaderOwner)) {
          finish(results.get(leaderOwner) === true)
          return
        }
        const lock = storage ? readLock(storage) : null
        if (lock?.owner === leaderOwner && lock.status === 'done') {
          finish(lock.success === true)
        }
      }
      const poll = setInterval(checkResult, CLAIM_WINDOW_MS)
      const timeout = setTimeout(() => finish(false), REFRESH_TIMEOUT_MS)
      resultListeners.add(checkResult)
      checkResult()
    })

  return {
    claims,
    leaders,
    markLeader: () => {
      isLeader = true
    },
    waitForResult,
    close: () => {
      channel?.removeEventListener('message', onMessage)
      globalThis.removeEventListener?.('storage', onStorage)
    },
  }
}

const acquireLock = (
  storage: Storage,
  owner: string,
): 'acquired' | 'contended' | 'unavailable' => {
  const existingLock = readLock(storage)
  if (isActiveLock(existingLock)) return 'contended'

  try {
    storage.setItem(
      LOCK_KEY,
      JSON.stringify({
        owner,
        timestamp: Date.now(),
        status: 'refreshing',
      } satisfies RefreshLock),
    )
    return readLock(storage)?.owner === owner ? 'acquired' : 'contended'
  } catch {
    return 'unavailable'
  }
}

const publishResult = (
  channel: BroadcastChannel | null,
  storage: Storage | null,
  owner: string,
  success: boolean,
) => {
  channel?.postMessage({ type: 'done', owner, success } satisfies RefreshMessage)
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
  } catch {
    // Storage can become unavailable while a refresh is in flight.
  }
}

const electChannelLeader = async (
  channel: BroadcastChannel,
  observer: ReturnType<typeof createObserver>,
  owner: string,
): Promise<string> => {
  channel.postMessage({ type: 'claim', owner } satisfies RefreshMessage)
  await delay(CLAIM_SETTLE_MS)
  return [...observer.claims, ...observer.leaders].sort()[0] ?? owner
}

const confirmChannelLeadership = async (
  channel: BroadcastChannel,
  observer: ReturnType<typeof createObserver>,
  owner: string,
): Promise<string> => {
  channel.postMessage({ type: 'leader', owner } satisfies RefreshMessage)
  await delay(LEADER_CONFIRM_MS)
  return [...observer.claims, ...observer.leaders].sort()[0] ?? owner
}

export const coordinateRefresh = async (
  doRefresh: () => Promise<boolean>,
): Promise<boolean> => {
  const channel = createChannel()
  const storageSnapshot = getStorageSnapshot()
  let storage = storageSnapshot?.storage ?? null
  const owner = `${Date.now()}-${Math.random()}`
  const observer = createObserver(channel, storage, owner)
  const existingLock = storageSnapshot?.lock ?? null

  if (isActiveLock(existingLock)) {
    const result = await observer.waitForResult(existingLock.owner)
    observer.close()
    channel?.close()
    return result
  }

  if (storage) {
    const lockResult = acquireLock(storage, owner)
    if (lockResult === 'contended') {
      const lockOwner = readLock(storage)?.owner
      const result = lockOwner ? await observer.waitForResult(lockOwner) : false
      observer.close()
      channel?.close()
      return result
    }
    if (lockResult === 'unavailable') {
      storage = null
    }
  }

  if (channel) {
    const electedOwner = await electChannelLeader(channel, observer, owner)
    if (electedOwner !== owner) {
      const result = await observer.waitForResult(electedOwner)
      observer.close()
      channel.close()
      return result
    }
    const confirmedOwner = await confirmChannelLeadership(channel, observer, owner)
    if (confirmedOwner !== owner) {
      const result = await observer.waitForResult(confirmedOwner)
      observer.close()
      channel.close()
      return result
    }
  }

  observer.markLeader()
  let success = false
  try {
    success = await doRefresh()
    return success
  } catch {
    return false
  } finally {
    publishResult(channel, storage, owner, success)
    observer.close()
    channel?.close()
  }
}
