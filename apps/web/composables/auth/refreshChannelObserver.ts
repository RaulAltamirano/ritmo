import {
  delay,
  isActiveLock,
  isRecentDone,
  parseLock,
  readLock,
  refreshLockConstants,
} from './refreshLockStorage'

const CHANNEL_NAME = 'ritmo-auth-refresh'
const { CLAIM_WINDOW_MS, LOCK_KEY, REFRESH_TIMEOUT_MS } = refreshLockConstants
const CLAIM_SETTLE_MS = 125
const LEADER_CONFIRM_MS = 25

export interface RefreshMessage {
  type: 'claim' | 'leader' | 'leader-conflict' | 'done'
  owner: string
  success?: boolean
}

export type Observer = ReturnType<typeof createObserver>

export const createChannel = (): BroadcastChannel | null => {
  try {
    return typeof BroadcastChannel === 'undefined'
      ? null
      : new BroadcastChannel(CHANNEL_NAME)
  } catch {
    return null
  }
}

export const safePostMessage = (
  channel: BroadcastChannel | null,
  message: RefreshMessage,
) => {
  try {
    channel?.postMessage(message)
  } catch {
    // Channel may already be closed by a finished peer/tab.
  }
}

export const createObserver = (
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
        safePostMessage(channel, { type: 'leader', owner })
      } else if (isNewClaim) {
        safePostMessage(channel, { type: 'claim', owner })
      }
    } else if (message.type === 'leader') {
      leaders.add(message.owner)
      const lowestClaim = [...claims].sort()[0]
      if (lowestClaim && lowestClaim < message.owner) {
        safePostMessage(channel, {
          type: 'leader-conflict',
          owner: lowestClaim,
        })
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

  const peekAnyResult = (): boolean | undefined => {
    if (results.size === 0) return undefined
    return [...results.values()].at(-1)
  }

  const waitForResult = (
    leaderOwner: string,
    timeoutMs = REFRESH_TIMEOUT_MS,
  ): Promise<boolean> =>
    new Promise(resolve => {
      let currentOwner = leaderOwner
      const finish = (success: boolean) => {
        clearTimeout(timeout)
        clearInterval(poll)
        resultListeners.delete(checkResult)
        resolve(success)
      }
      const checkResult = () => {
        if (results.has(currentOwner)) {
          finish(results.get(currentOwner) === true)
          return
        }
        const lock = storage ? readLock(storage) : null
        if (isRecentDone(lock)) {
          finish(lock.success === true)
          return
        }
        if (isActiveLock(lock) && lock.owner !== currentOwner) {
          currentOwner = lock.owner
        }
        if (lock?.owner === currentOwner && lock.status === 'done') {
          finish(lock.success === true)
        }
      }
      const poll = setInterval(checkResult, CLAIM_WINDOW_MS)
      const timeout = setTimeout(
        () => finish(false),
        Math.max(CLAIM_WINDOW_MS, timeoutMs),
      )
      resultListeners.add(checkResult)
      checkResult()
    })

  return {
    claims,
    leaders,
    peekAnyResult,
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

export const electChannelLeader = async (
  channel: BroadcastChannel,
  observer: Observer,
  owner: string,
): Promise<string> => {
  safePostMessage(channel, { type: 'claim', owner })
  await delay(CLAIM_SETTLE_MS)
  return [...observer.claims, ...observer.leaders].sort()[0] ?? owner
}

export const confirmChannelLeadership = async (
  channel: BroadcastChannel,
  observer: Observer,
  owner: string,
): Promise<string> => {
  safePostMessage(channel, { type: 'leader', owner })
  await delay(LEADER_CONFIRM_MS)
  return [...observer.claims, ...observer.leaders].sort()[0] ?? owner
}
