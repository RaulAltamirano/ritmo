import { vi } from 'vitest'

/** Fake timers at a fixed instant; call the returned unfreeze() when done. */
export function freezeTime(iso: string): () => void {
  vi.useFakeTimers({ shouldAdvanceTime: false })
  vi.setSystemTime(new Date(iso))
  return () => {
    vi.useRealTimers()
  }
}

/** Run fn with TZ set (restored after). */
export async function withTz<T>(tz: string, fn: () => Promise<T>): Promise<T> {
  const prev = process.env.TZ
  process.env.TZ = tz
  try {
    return await fn()
  } finally {
    if (prev === undefined) delete process.env.TZ
    else process.env.TZ = prev
  }
}
