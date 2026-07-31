/**
 * Pure wall-clock helpers for the focus → break → reflection cycle.
 *
 * These functions are intentionally free of side-effects and store references
 * so they can be unit-tested with fixed `nowMs` values.
 */

/** Effective paused seconds including an open pause span. */
export function effectivePausedSec(
  accumulatedSec: number,
  pausedAt: Date | null | undefined,
  nowMs: number,
): number {
  const open =
    pausedAt != null
      ? Math.max(0, Math.floor((nowMs - pausedAt.getTime()) / 1000))
      : 0
  return accumulatedSec + open
}

export function focusRemainingSec(input: {
  targetDurationSec: number
  startMs: number
  pausedAccumulatedSec: number
  pausedAt?: Date | null
  nowMs: number
}): number {
  const paused = effectivePausedSec(
    input.pausedAccumulatedSec,
    input.pausedAt,
    input.nowMs,
  )
  const worked = Math.max(
    0,
    Math.floor((input.nowMs - input.startMs) / 1000) - paused,
  )
  return Math.max(0, input.targetDurationSec - worked)
}

export function breakRemainingSec(input: {
  breakDurationSec: number
  breakStartedMs: number
  breakPausedAccumulatedSec: number
  pausedAt?: Date | null
  nowMs: number
}): number {
  const paused = effectivePausedSec(
    input.breakPausedAccumulatedSec,
    input.pausedAt,
    input.nowMs,
  )
  const elapsed = Math.max(
    0,
    Math.floor((input.nowMs - input.breakStartedMs) / 1000) - paused,
  )
  return Math.max(0, input.breakDurationSec - elapsed)
}
