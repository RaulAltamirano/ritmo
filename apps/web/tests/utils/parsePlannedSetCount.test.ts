import { describe, expect, it } from 'vitest'
import { parsePlannedSetCount } from '@/utils/parsePlannedSetCount'

describe('parsePlannedSetCount', () => {
  it('reads set count after x in 10x4rp', () => {
    expect(parsePlannedSetCount('10x4rp')).toBe(4)
    expect(parsePlannedSetCount('10x4rp (4 series de 10 reps)')).toBe(4)
    expect(parsePlannedSetCount('15x5rp')).toBe(5)
    expect(parsePlannedSetCount('10/10x4rp (10 por pierna)')).toBe(4)
  })

  it('counts ramp numbers', () => {
    expect(parsePlannedSetCount('20,15,10,10,10rp (Serie rampa)')).toBe(5)
  })

  it('defaults to 4 when unparseable', () => {
    expect(parsePlannedSetCount('')).toBe(4)
    expect(parsePlannedSetCount('AMRAP')).toBe(4)
  })
})
