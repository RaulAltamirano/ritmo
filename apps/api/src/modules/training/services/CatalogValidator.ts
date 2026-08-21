import type { EquipmentProfile, Exercise } from '@prisma/client'

export type SubstitutionValidation = { ok: true } | { ok: false; reason: string }

const EQUIPMENT_BY_PROFILE: Record<EquipmentProfile, ReadonlySet<string>> = {
  full_gym: new Set([
    'barbell',
    'bodyweight',
    'cable',
    'dumbbells',
    'ez_bar',
    'machine',
    'step',
  ]),
  limited_machines: new Set(['bodyweight', 'cable', 'machine', 'step']),
  dumbbells_cables: new Set(['bodyweight', 'cable', 'dumbbells', 'step']),
  home: new Set(['bodyweight', 'dumbbells', 'step']),
}

export class CatalogValidator {
  validateSubstitution(
    from: Exercise,
    to: Exercise,
    equipment: EquipmentProfile,
  ): SubstitutionValidation {
    if (from.family !== to.family) {
      return { ok: false, reason: 'exercise_family_mismatch' }
    }
    if (!to.equipment.some(tag => EQUIPMENT_BY_PROFILE[equipment].has(tag))) {
      return { ok: false, reason: 'equipment_unavailable' }
    }

    return { ok: true }
  }
}
