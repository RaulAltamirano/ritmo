import type { EquipmentProfile, Exercise } from '@prisma/client'

export type SubstitutionValidation = { ok: true } | { ok: false; reason: string }

export class CatalogValidator {
  validateSubstitution(
    from: Exercise,
    to: Exercise,
    _equipment: EquipmentProfile,
  ): SubstitutionValidation {
    if (from.family !== to.family) {
      return { ok: false, reason: 'exercise_family_mismatch' }
    }

    return { ok: true }
  }
}
