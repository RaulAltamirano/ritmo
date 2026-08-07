import {
  acquireLockWithSettle,
  delay,
  forceWriteRefreshing,
  getStorageSnapshot,
  isActiveLock,
  isRecentSuccessfulDone,
  publishStorageResult,
  readLock,
  refreshLockConstants,
  releaseOwnLock,
  tryWriteLock,
} from './refreshLockStorage'
import {
  confirmChannelLeadership,
  createChannel,
  createObserver,
  electChannelLeader,
  safePostMessage,
  type Observer,
} from './refreshChannelObserver'

const { CLAIM_WINDOW_MS, LOCK_KEY, REFRESH_TIMEOUT_MS } = refreshLockConstants

const webLocks = (): LockManager | null => {
  try {
    return typeof navigator !== 'undefined' && navigator.locks ? navigator.locks : null
  } catch {
    return null
  }
}

const publishResult = (
  channel: BroadcastChannel | null,
  storage: Storage | null,
  owner: string,
  success: boolean,
  force = false,
) => {
  safePostMessage(channel, { type: 'done', owner, success })
  publishStorageResult(storage, owner, success, { force })
}

const waitForPeerResult = async (
  observer: Observer,
  storage: Storage | null,
  fallbackOwner?: string,
  timeoutMs = REFRESH_TIMEOUT_MS,
): Promise<boolean> => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const any = observer.peekAnyResult()
    if (any !== undefined) return any

    const lock = storage ? readLock(storage) : null
    if (isRecentSuccessfulDone(lock)) return true
    if (lock?.status === 'done' && lock.success === false) return false

    const leaderOwner = (isActiveLock(lock) ? lock.owner : null) ?? fallbackOwner
    if (leaderOwner) {
      return observer.waitForResult(leaderOwner, deadline - Date.now())
    }
    await delay(CLAIM_WINDOW_MS)
  }
  return observer.peekAnyResult() ?? false
}

const runAsLeader = async (
  doRefresh: () => Promise<boolean>,
  channel: BroadcastChannel | null,
  storage: Storage | null,
  owner: string,
  observer: Observer,
  forceStorage = false,
): Promise<boolean> => {
  observer.markLeader()
  if (storage) {
    if (forceStorage) forceWriteRefreshing(storage, owner)
    else tryWriteLock(storage, owner)
  }
  let success = false
  try {
    success = await doRefresh()
    return success
  } catch {
    return false
  } finally {
    publishResult(channel, storage, owner, success, forceStorage)
  }
}

const demoteAndWait = async (
  observer: Observer,
  storage: Storage | null,
  owner: string,
  leaderOwner: string,
  timeoutMs = REFRESH_TIMEOUT_MS,
): Promise<boolean> => {
  releaseOwnLock(storage, owner)
  return observer.waitForResult(leaderOwner, timeoutMs)
}

const coordinateWithWebLocks = async (
  doRefresh: () => Promise<boolean>,
  locks: LockManager,
  channel: BroadcastChannel | null,
  storage: Storage | null,
  owner: string,
  observer: Observer,
): Promise<boolean> => {
  let led = false
  let leaderResult = false

  await locks.request(LOCK_KEY, { ifAvailable: true, mode: 'exclusive' }, async lock => {
    if (!lock) return
    led = true

    // Re-check after the lock is granted — another tab may have finished while we waited.
    const channelDone = observer.peekAnyResult()
    if (channelDone === true) {
      leaderResult = true
      return
    }
    if (storage && isRecentSuccessfulDone(readLock(storage))) {
      leaderResult = true
      return
    }

    leaderResult = await runAsLeader(
      doRefresh,
      channel,
      storage,
      owner,
      observer,
      true,
    )
  })

  if (led) return leaderResult
  return waitForPeerResult(observer, storage)
}

const coordinateWithStorageAndChannel = async (
  doRefresh: () => Promise<boolean>,
  channel: BroadcastChannel | null,
  storage: Storage | null,
  owner: string,
  observer: Observer,
): Promise<boolean> => {
  let activeStorage = storage
  let holdsStorageLock = false

  if (activeStorage) {
    const lockResult = await acquireLockWithSettle(activeStorage, owner)
    if (lockResult === 'contended') {
      const lockOwner = readLock(activeStorage)?.owner
      return lockOwner
        ? waitForPeerResult(observer, activeStorage, lockOwner)
        : waitForPeerResult(observer, activeStorage)
    }
    if (lockResult === 'unavailable') activeStorage = null
    else holdsStorageLock = true
  }

  // Channel election only when storage could not elect a leader.
  // A storage lock holder must not demote — that deadlocks followers waiting on storage.
  if (channel && !holdsStorageLock) {
    const electedOwner = await electChannelLeader(channel, observer, owner)
    if (electedOwner !== owner) {
      return demoteAndWait(observer, activeStorage, owner, electedOwner)
    }
    const confirmedOwner = await confirmChannelLeadership(channel, observer, owner)
    if (confirmedOwner !== owner) {
      return demoteAndWait(observer, activeStorage, owner, confirmedOwner)
    }
  }

  return runAsLeader(doRefresh, channel, activeStorage, owner, observer)
}

export const coordinateRefresh = async (
  doRefresh: () => Promise<boolean>,
): Promise<boolean> => {
  const channel = createChannel()
  const storageSnapshot = getStorageSnapshot()
  const storage = storageSnapshot?.storage ?? null
  const owner = `${Date.now()}-${Math.random()}`
  const observer = createObserver(channel, storage, owner)
  const existingLock = storageSnapshot?.lock ?? null

  try {
    // Only reuse a recent *successful* refresh; failed done must not poison retries.
    if (isRecentSuccessfulDone(existingLock)) return true

    const locks = webLocks()

    // Prefer Web Locks steal over waiting forever on a crashed storage holder.
    if (locks) {
      return await coordinateWithWebLocks(
        doRefresh,
        locks,
        channel,
        storage,
        owner,
        observer,
      )
    }

    if (isActiveLock(existingLock)) {
      return await waitForPeerResult(observer, storage, existingLock.owner)
    }

    return await coordinateWithStorageAndChannel(
      doRefresh,
      channel,
      storage,
      owner,
      observer,
    )
  } finally {
    observer.close()
    try {
      channel?.close()
    } catch {
      // ignore already-closed channels
    }
  }
}
