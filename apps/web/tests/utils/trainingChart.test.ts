import { describe, expect, it } from 'vitest'
import { linePoints } from '@/utils/trainingChart'

describe('linePoints', () => {
  it('maps 10,20 to two x,y pairs', () => {
    const points = linePoints([10, 20], 320, 120)
    const pairs = points.split(' ')
    expect(pairs).toHaveLength(2)
    expect(pairs[0]).toMatch(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/)
    expect(pairs[1]).toMatch(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/)
  })
})
