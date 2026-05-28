import { describe, expect, it } from 'vitest'
import { needsWorkSessionFeedback } from '@/utils/workSessionFeedback'

describe('needsWorkSessionFeedback', () => {
  it('is true for pending_feedback', () => {
    expect(
      needsWorkSessionFeedback({ state: 'pending_feedback', timeLeftSec: 99 }),
    ).toBe(true)
  })
  it('is true for running with no time left', () => {
    expect(needsWorkSessionFeedback({ state: 'running', timeLeftSec: 0 })).toBe(true)
  })
  it('is false for running with time left', () => {
    expect(needsWorkSessionFeedback({ state: 'running', timeLeftSec: 60 })).toBe(false)
  })
  it('is false for paused', () => {
    expect(needsWorkSessionFeedback({ state: 'paused', timeLeftSec: 0 })).toBe(false)
  })
})
