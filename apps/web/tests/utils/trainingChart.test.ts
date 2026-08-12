import { describe, expect, it } from 'vitest'
import { chartMetricValues, linePoints } from '@/utils/trainingChart'
import type { SessionProgressPoint } from '@/utils/trainingSessionMetrics'

describe('linePoints', () => {
  it('maps 10,20 to two x,y pairs', () => {
    const points = linePoints([10, 20], 320, 120)
    const pairs = points.split(' ')
    expect(pairs).toHaveLength(2)
    expect(pairs[0]).toMatch(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/)
    expect(pairs[1]).toMatch(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/)
  })
})

describe('chartMetricValues', () => {
  it('omits incomplete days even when volumeKg is 0', () => {
    const points: SessionProgressPoint[] = [
      {
        dayKey: '2026-08-09',
        kgEq: null,
        e1rm: null,
        volumeKg: 0,
        nativeLabel: '—',
        convertible: false,
      },
      {
        dayKey: '2026-08-10',
        kgEq: 70,
        e1rm: 98,
        volumeKg: 700,
        nativeLabel: '70kg',
        convertible: true,
      },
    ]
    expect(chartMetricValues(points, 'volume')).toEqual([700])
  })
})
