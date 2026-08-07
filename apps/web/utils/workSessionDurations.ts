export type FocusDurationInput = {
  startTime: Date | string
  endTime: Date | string | null
  pausedDurationSec: number | null
  breakStartedAt: Date | string | null
}

export type BreakDurationInput = {
  breakStartedAt: Date | string | null
  endTime: Date | string | null
  breakPausedDurationSec: number | null
}

function toDate(v: Date | string): Date {
  return v instanceof Date ? v : new Date(v)
}

/** Focus billable seconds; freezes at breakStartedAt; open sessions use `now`. */
export function focusBillableSec(
  s: FocusDurationInput,
  now: Date = new Date(),
): number {
  const start = toDate(s.startTime)
  const focusEnd = s.breakStartedAt
    ? toDate(s.breakStartedAt)
    : s.endTime
      ? toDate(s.endTime)
      : now
  const wall = Math.floor((focusEnd.getTime() - start.getTime()) / 1000)
  return Math.max(0, wall - (s.pausedDurationSec ?? 0))
}

/** Break elapsed seconds; 0 if no breakStartedAt; open sessions use `now`. */
export function breakElapsedSec(
  s: BreakDurationInput,
  now: Date = new Date(),
): number {
  if (!s.breakStartedAt) return 0
  const breakStart = toDate(s.breakStartedAt)
  const breakEnd = s.endTime ? toDate(s.endTime) : now
  const wall = Math.floor((breakEnd.getTime() - breakStart.getTime()) / 1000)
  return Math.max(0, wall - (s.breakPausedDurationSec ?? 0))
}

/** Human-readable duration for summary UI (e.g. `1h 5m`, `12m`, `45s`). */
export function formatDurationSec(sec: number): string {
  const s = Math.max(0, Math.floor(sec))
  if (s < 60) return `${s}s`
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`
  return `${m}m`
}

/** Minute-granularity totals for day strips (e.g. `0m`, `12m`, `1h 3m`). */
export function formatDurationMinutes(sec: number): string {
  const s = Math.max(0, Math.floor(sec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}
