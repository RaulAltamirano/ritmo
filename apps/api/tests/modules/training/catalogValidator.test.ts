import { EquipmentProfile, ExerciseFamily, type Exercise } from '@prisma/client'
import { describe, expect, it } from 'vitest'

import { CatalogValidator } from '../../../src/modules/training/services/CatalogValidator.js'

const exercise = (
  id: string,
  family: ExerciseFamily,
  equipment: string[] = ['machine'],
): Exercise => ({
  id,
  slug: id,
  name: id,
  family,
  equipment,
  isCore: true,
})

describe('CatalogValidator', () => {
  const validator = new CatalogValidator()

  it('accepts substitutions from the same exercise family', () => {
    const result = validator.validateSubstitution(
      exercise('bench-press', ExerciseFamily.press_horizontal, ['barbell']),
      exercise('chest-press', ExerciseFamily.press_horizontal),
      EquipmentProfile.full_gym,
    )

    expect(result).toEqual({ ok: true })
  })

  it('rejects substitutions from a different exercise family', () => {
    const result = validator.validateSubstitution(
      exercise('bench-press', ExerciseFamily.press_horizontal),
      exercise('lat-pulldown', ExerciseFamily.jalon),
      EquipmentProfile.full_gym,
    )

    expect(result).toEqual({ ok: false, reason: 'exercise_family_mismatch' })
  })
})
