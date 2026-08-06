import { describe, expect, it } from 'vitest'
import {
  extractWorkSessionItems,
  formatEndDayTimeRange,
  mapWorkSessionToSummaryRow,
  stateBadgeClass,
} from '@/utils/endDaySummary'

describe('endDaySummary', () => {
  it('extracts items from API envelope', () => {
    expect(extractWorkSessionItems({ data: { items: [{ id: '1' }] } })).toEqual([
      { id: '1' },
    ])
    expect(extractWorkSessionItems({})).toEqual([])
  })

  it('maps a session row with focus share', () => {
    const row = mapWorkSessionToSummaryRow(
      {
        id: 'ws-1',
        state: 'completed',
        startTime: '2026-08-05T10:00:00.000Z',
        endTime: '2026-08-05T10:30:00.000Z',
        pausedDurationSec: 0,
        breakStartedAt: '2026-08-05T10:25:00.000Z',
        breakPausedDurationSec: 0,
        task: { id: 't1', title: 'Leer' },
      },
      new Date('2026-08-05T12:00:00.000Z'),
    )
    expect(row).toMatchObject({
      id: 'ws-1',
      taskTitle: 'Leer',
      focusSec: 25 * 60,
      breakSec: 5 * 60,
      stateLabel: 'Completada',
    })
    expect(row?.focusShare).toBeCloseTo(25 / 30)
  })

  it('formats open ranges', () => {
    const label = formatEndDayTimeRange('2026-08-05T10:00:00.000Z', null)
    expect(label).toMatch(/en curso/)
  })

  it('returns semantic badge classes', () => {
    expect(stateBadgeClass('completed')).toMatch(/emerald/)
    expect(stateBadgeClass('abandoned')).toMatch(/rose/)
    expect(stateBadgeClass('running')).toMatch(/primary/)
  })
})
