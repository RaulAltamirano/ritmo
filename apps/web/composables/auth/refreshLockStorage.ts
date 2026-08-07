const LOCK_KEY = 'ritmo-auth-refresh-lock'
const REFRESH_TIMEOUT_MS = 10_000
const CLAIM_WINDOW_MS = 25
const RECENT_DONE_MS = 5_000

export interface RefreshLock {
  owner: string
  timestamp: number
  status: 'refreshing' | 'done'
  success?: boolean
}

export const refreshLockConstants = {
  LOCK_KEY,
  REFRESH_TIMEOUT_MS,
  CLAIM_WINDOW_MS,
  RECENT_DONE_MS,
} as const

export const parseLock = (value: string | null): RefreshLock | null => {
  try {
    return value ? (JSON.parse(value) as RefreshLock) : null
  } catch {
    return null
  }
}

export const readLock = (storage: Storage): RefreshLock | null => {
  try {
    return parseLock(storage.getItem(LOCK_KEY))
  } catch {
    return null
  }
}

export const isActiveLock = (lock: RefreshLock | null): lock is RefreshLock =>
  lock?.status === 'refreshing' && Date.now() - lock.timestamp < REFRESH_TIMEOUT_MS

export const isRecentDone = (lock: RefreshLock | null): lock is RefreshLock =>
  lock?.status === 'done' && Date.now() - lock.timestamp < RECENT_DONE_MS

export const isRecentSuccessfulDone = (lock: RefreshLock | null): boolean =>
  isRecentDone(lock) && lock.success === true

export const getStorageSnapshot = (): {
  storage: Storage
  lock: RefreshLock | null
} | null => {
  try {
    if (typeof localStorage === 'undefined') return null
    return { storage: localStorage, lock: parseLock(localStorage.getItem(LOCK_KEY)) }
  } catch {
    return null
  }
}

export const delay = (milliseconds: number) =>
  new Promise(resolve => setTimeout(resolve, milliseconds))

/** Write + immediate owner check. Still TOCTOU across tabs; prefer Web Locks. */
export const tryWriteLock = (
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

/** Overwrite any refreshing/stale claim — used by Web Lock leaders. */
export const forceWriteRefreshing = (
  storage: Storage,
  owner: string,
): boolean => {
  try {
    storage.setItem(
      LOCK_KEY,
      JSON.stringify({
        owner,
        timestamp: Date.now(),
        status: 'refreshing',
      } satisfies RefreshLock),
    )
    return true
  } catch {
    return false
  }
}

export const acquireLockWithSettle = async (
  storage: Storage,
  owner: string,
): Promise<'acquired' | 'contended' | 'unavailable'> => {
  const written = tryWriteLock(storage, owner)
  if (written !== 'acquired') return written
  await delay(CLAIM_WINDOW_MS)
  const after = readLock(storage)
  if (after?.owner === owner && after.status === 'refreshing') return 'acquired'
  return 'contended'
}

export const releaseOwnLock = (storage: Storage | null, owner: string) => {
  if (!storage) return
  try {
    if (readLock(storage)?.owner === owner) storage.removeItem(LOCK_KEY)
  } catch {
    // Storage can become unavailable while coordinating.
  }
}

/**
 * Publish done for this owner.
 * - Never clobber another tab's `done`.
 * - Skip foreign `refreshing` unless `force` (Web Lock leader steal).
 */
export const publishStorageResult = (
  storage: Storage | null,
  owner: string,
  success: boolean,
  options: { force?: boolean } = {},
) => {
  if (!storage) return
  try {
    const current = readLock(storage)
    if (current && current.owner !== owner) {
      if (current.status === 'done') return
      if (current.status === 'refreshing' && !options.force) return
    }
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
