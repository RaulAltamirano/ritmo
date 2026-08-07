import { describe, expect, it } from 'vitest'
import {
  breakElapsedSec,
  focusBillableSec,
  formatDurationMinutes,
  formatDurationSec,
} from '@/utils/workSessionDurations'

const t0 = new Date('2026-08-05T10:00:00.000Z')
const t25 = new Date('2026-08-05T10:25:00.000Z')
const t30 = new Date('2026-08-05T10:30:00.000Z')

describe('focusBillableSec', () => {
  it('counts wall minus pause when no break', () => {
    expect(
      focusBillableSec({
        startTime: t0,
        endTime: t25,
        pausedDurationSec: 60,
        breakStartedAt: null,
      }),
    ).toBe(24 * 60)
  })

  it('freezes focus at breakStartedAt', () => {
    expect(
      focusBillableSec({
        startTime: t0,
        endTime: t30,
        pausedDurationSec: 0,
        breakStartedAt: t25,
      }),
    ).toBe(25 * 60)
  })

  it('uses now when endTime is null', () => {
    expect(
      focusBillableSec(
        {
          startTime: t0,
          endTime: null,
          pausedDurationSec: 0,
          breakStartedAt: null,
        },
        t25,
      ),
    ).toBe(25 * 60)
  })
})

describe('breakElapsedSec', () => {
  it('returns 0 without breakStartedAt', () => {
    expect(
      breakElapsedSec({
        breakStartedAt: null,
        endTime: t30,
        breakPausedDurationSec: 0,
      }),
    ).toBe(0)
  })

  it('counts break wall minus break pause', () => {
    expect(
      breakElapsedSec({
        breakStartedAt: t25,
        endTime: t30,
        breakPausedDurationSec: 30,
      }),
    ).toBe(5 * 60 - 30)
  })
})

describe('formatDurationSec', () => {
  it('formats hours and minutes', () => {
    expect(formatDurationSec(3900)).toBe('1h 5m')
  })

  it('formats minutes only', () => {
    expect(formatDurationSec(720)).toBe('12m')
  })

  it('formats seconds under a minute', () => {
    expect(formatDurationSec(45)).toBe('45s')
  })
})

describe('formatDurationMinutes', () => {
  it('keeps minute granularity under one minute', () => {
    expect(formatDurationMinutes(45)).toBe('0m')
  })

  it('formats minutes only', () => {
    expect(formatDurationMinutes(780)).toBe('13m')
  })

  it('formats hours and minutes', () => {
    expect(formatDurationMinutes(3_780)).toBe('1h 3m')
  })
})
