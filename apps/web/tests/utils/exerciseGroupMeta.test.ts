import { describe, expect, it } from 'vitest'
import { getExerciseGroupMeta } from '@/utils/exerciseGroupMeta'

describe('getExerciseGroupMeta', () => {
  it('labels a single exercise as Straight set', () => {
    const meta = getExerciseGroupMeta(1)
    expect(meta.kind).toBe('single')
    expect(meta.tone).toBe('neutral')
    expect(meta.title).toBe('Straight set')
    expect(meta.hint).toMatch(/One exercise/i)
  })

  it('labels two exercises as Superset with follow-along hint', () => {
    const meta = getExerciseGroupMeta(2)
    expect(meta.kind).toBe('superset')
    expect(meta.tone).toBe('brand')
    expect(meta.title).toBe('Superset')
    expect(meta.hint).toMatch(/back-to-back/i)
    expect(meta.countLabel).toMatch(/2 exercises/i)
  })

  it('labels three exercises as Triset', () => {
    const meta = getExerciseGroupMeta(3)
    expect(meta.kind).toBe('triset')
    expect(meta.tone).toBe('warning')
    expect(meta.title).toBe('Triset')
    expect(meta.hint).toMatch(/three back-to-back/i)
  })

  it('labels four or more as Giant set', () => {
    const meta = getExerciseGroupMeta(4)
    expect(meta.kind).toBe('giant')
    expect(meta.tone).toBe('success')
    expect(meta.title).toBe('Giant set')
    expect(meta.hint).toMatch(/all 4 back-to-back/i)
  })
})
