import type { LoadUnit } from '~/types/training'

const LBS_TO_KG = 0.453592

export function roundKgEq(kg: number): number {
  return Math.round(kg * 2) / 2
}

export function loadToKgEq(input: {
  load: number | null
  unit: LoadUnit
  plateKg: number | null
  bodyweightKg: number | null
}): number | null {
  const { load, unit, plateKg, bodyweightKg } = input
  if (unit === 'kg') {
    if (load == null) return null
    return roundKgEq(load)
  }
  if (unit === 'lbs') {
    if (load == null) return null
    return roundKgEq(load * LBS_TO_KG)
  }
  if (unit === 'plates') {
    if (load == null || plateKg == null) return null
    return roundKgEq(load * plateKg)
  }
  if (bodyweightKg == null) return null
  return roundKgEq(bodyweightKg + (load ?? 0))
}

export function formatNativeLoad(load: number | null, unit: LoadUnit): string {
  if (unit === 'kg') return `${load ?? 0}kg`
  if (unit === 'lbs') return `${load ?? 0}lbs`
  if (unit === 'plates') return `${load ?? 0}P`
  if (load == null || load === 0) return 'BW'
  return `BW+${load}kg`
}

export function estimated1Rm(kgEq: number, reps: number, rpe: number): number {
  const rir = 10 - rpe
  return roundKgEq(kgEq * (1 + (reps + rir) / 30))
}
