import { describe, expect, it } from 'vitest'
import { validatePausedDurationSec } from './pauseDurationGuard.js'

const t0 = new Date('2026-04-22T10:00:00Z')
const secondsAfter = (s: number) => new Date(t0.getTime() + s * 1000)

describe('validatePausedDurationSec', () => {
  it('accepts zero', () => {
    expect(() =>
      validatePausedDurationSec({
        incoming: 0,
        startTime: t0,
        currentStored: 0,
        now: secondsAfter(60),
      }),
    ).not.toThrow()
  })

  it('accepts a value equal to elapsed wall-clock seconds', () => {
    expect(() =>
      validatePausedDurationSec({
        incoming: 60,
        startTime: t0,
        currentStored: 0,
        now: secondsAfter(60),
      }),
    ).not.toThrow()
  })

  it('rejects a value larger than elapsed wall-clock seconds', () => {
    expect(() =>
      validatePausedDurationSec({
        incoming: 120,
        startTime: t0,
        currentStored: 0,
        now: secondsAfter(60),
      }),
    ).toThrow(/cannot exceed elapsed/i)
  })

  it('rejects a value below the currently stored pause (non-monotonic)', () => {
    expect(() =>
      validatePausedDurationSec({
        incoming: 30,
        startTime: t0,
        currentStored: 60,
        now: secondsAfter(3600),
      }),
    ).toThrow(/monotonic|cannot decrease/i)
  })

  it('accepts a value equal to the stored pause (idempotent heartbeat)', () => {
    expect(() =>
      validatePausedDurationSec({
        incoming: 60,
        startTime: t0,
        currentStored: 60,
        now: secondsAfter(3600),
      }),
    ).not.toThrow()
  })

  it('rejects negative values', () => {
    expect(() =>
      validatePausedDurationSec({
        incoming: -1,
        startTime: t0,
        currentStored: 0,
        now: secondsAfter(60),
      }),
    ).toThrow(/negative/i)
  })

  it('rejects non-finite values', () => {
    expect(() =>
      validatePausedDurationSec({
        incoming: Number.NaN,
        startTime: t0,
        currentStored: 0,
        now: secondsAfter(60),
      }),
    ).toThrow(/finite/i)
    expect(() =>
      validatePausedDurationSec({
        incoming: Number.POSITIVE_INFINITY,
        startTime: t0,
        currentStored: 0,
        now: secondsAfter(60),
      }),
    ).toThrow(/finite/i)
  })

  it('allows a small clock skew tolerance (±2s)', () => {
    expect(() =>
      validatePausedDurationSec({
        incoming: 62,
        startTime: t0,
        currentStored: 0,
        now: secondsAfter(60),
      }),
    ).not.toThrow()
  })
})
