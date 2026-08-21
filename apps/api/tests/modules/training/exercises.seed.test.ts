import { describe, expect, it } from 'vitest'
import { EXERCISE_SEEDS } from '../../../src/modules/training/data/exercises.seed.js'

describe('EXERCISE_SEEDS', () => {
  it('includes core WFITNESS nuclei with unique slugs', () => {
    const slugs = EXERCISE_SEEDS.map(e => e.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(slugs).toEqual(
      expect.arrayContaining([
        'chest-press',
        'incline-chest-press',
        'shoulder-press',
        'pull-down-prono',
        'row-neutro',
        'squat',
        'deadlift',
        'hip-thrust',
        'face-pull',
      ]),
    )
    expect(EXERCISE_SEEDS.every(e => e.name.trim().length > 0)).toBe(true)
  })
})
