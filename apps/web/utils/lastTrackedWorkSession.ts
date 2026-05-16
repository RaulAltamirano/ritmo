/** Seguimiento del último WorkSession remoto para detectar abandono servidor (spec §8.4 / §10). */

const STORAGE_KEY = 'ritmo:lastTrackedWorkSessionId'

export function setLastTrackedWorkSessionId(id: string): void {
  if (!import.meta.client) return
  try {
    sessionStorage.setItem(STORAGE_KEY, id)
  } catch {
    /* quota / privacy mode */
  }
}

export function getLastTrackedWorkSessionId(): string | null {
  if (!import.meta.client) return null
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function clearLastTrackedWorkSessionId(): void {
  if (!import.meta.client) return
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* noop */
  }
}
