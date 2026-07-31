import { describe, expect, it } from 'vitest'
import { parseActivePayload } from '@/composables/timer/useActiveWorkSessionRestore'

const base = {
  id: 'ws-1',
  state: 'running' as const,
  startTime: '2026-04-22T10:00:00Z',
  pausedDurationSec: 0,
  timerMode: 'pomodoro',
  task: { id: 'task-1', title: 'Write tests' },
}

describe('parseActivePayload — targetDurationSec guards', () => {
  it('accepts a positive integer target duration', () => {
    const row = parseActivePayload({ ...base, targetDurationSec: 25 * 60 })
    expect(row).not.toBeNull()
    expect(row!.targetDurationSec).toBe(25 * 60)
  })

  it('rejects payloads with null targetDurationSec (legacy / bad data)', () => {
    const row = parseActivePayload({ ...base, targetDurationSec: null })
    expect(row).toBeNull()
  })

  it('rejects payloads where targetDurationSec is missing', () => {
    const row = parseActivePayload({ ...base })
    expect(row).toBeNull()
  })

  it('rejects payloads with zero or negative targetDurationSec', () => {
    expect(parseActivePayload({ ...base, targetDurationSec: 0 })).toBeNull()
    expect(parseActivePayload({ ...base, targetDurationSec: -1 })).toBeNull()
  })

  it('rejects payloads with non-numeric targetDurationSec', () => {
    expect(parseActivePayload({ ...base, targetDurationSec: '1500' })).toBeNull()
    expect(parseActivePayload({ ...base, targetDurationSec: Number.NaN })).toBeNull()
  })

  it('accepts on_break state and break timing fields', () => {
    const row = parseActivePayload({
      ...base,
      state: 'on_break',
      targetDurationSec: 1500,
      breakDurationSec: 300,
      breakStartedAt: '2026-04-22T10:25:00Z',
      breakPausedDurationSec: 10,
    })
    expect(row).not.toBeNull()
    expect(row!.state).toBe('on_break')
    expect(row!.breakDurationSec).toBe(300)
    expect(row!.breakStartedAt).toBe('2026-04-22T10:25:00Z')
    expect(row!.breakPausedDurationSec).toBe(10)
  })

  it('rejects unknown states', () => {
    expect(parseActivePayload({ ...base, state: 'completed' })).toBeNull()
  })
})
