import { describe, expect, it } from 'vitest'
import {
  breakRemainingSec,
  effectivePausedSec,
  focusRemainingSec,
} from '@/composables/timer/timerClock'

describe('timerClock', () => {
  describe('effectivePausedSec', () => {
    it('returns accumulated seconds when not paused', () => {
      expect(effectivePausedSec(30, null, 1_000_000)).toBe(30)
    })

    it('adds the open pause span when pausedAt is set', () => {
      const pausedAt = new Date(900_000)
      const nowMs = 920_000
      expect(effectivePausedSec(10, pausedAt, nowMs)).toBe(30)
    })

    it('never returns negative when pausedAt is in the future', () => {
      const pausedAt = new Date(1_000_000)
      expect(effectivePausedSec(5, pausedAt, 900_000)).toBe(5)
    })
  })

  describe('focusRemainingSec', () => {
    it('counts down from the target using wall-clock minus pauses', () => {
      const startMs = 0
      const nowMs = 120_000
      expect(
        focusRemainingSec({
          targetDurationSec: 300,
          startMs,
          pausedAccumulatedSec: 20,
          nowMs,
        }),
      ).toBe(200)
    })

    it('includes an open pause span', () => {
      const startMs = 0
      const pausedAt = new Date(100_000)
      const nowMs = 130_000
      expect(
        focusRemainingSec({
          targetDurationSec: 300,
          startMs,
          pausedAccumulatedSec: 10,
          pausedAt,
          nowMs,
        }),
      ).toBe(210)
    })

    it('clamps at zero when focus has exceeded the target', () => {
      expect(
        focusRemainingSec({
          targetDurationSec: 60,
          startMs: 0,
          pausedAccumulatedSec: 0,
          nowMs: 120_000,
        }),
      ).toBe(0)
    })
  })

  describe('breakRemainingSec', () => {
    it('counts down break duration excluding break pauses', () => {
      const breakStartedMs = 0
      const nowMs = 180_000
      expect(
        breakRemainingSec({
          breakDurationSec: 300,
          breakStartedMs,
          breakPausedAccumulatedSec: 30,
          nowMs,
        }),
      ).toBe(150)
    })

    it('includes an open pause span', () => {
      const breakStartedMs = 0
      const pausedAt = new Date(100_000)
      const nowMs = 150_000
      expect(
        breakRemainingSec({
          breakDurationSec: 300,
          breakStartedMs,
          breakPausedAccumulatedSec: 10,
          pausedAt,
          nowMs,
        }),
      ).toBe(210)
    })

    it('clamps at zero when break is over', () => {
      expect(
        breakRemainingSec({
          breakDurationSec: 60,
          breakStartedMs: 0,
          breakPausedAccumulatedSec: 0,
          nowMs: 120_000,
        }),
      ).toBe(0)
    })
  })
})
