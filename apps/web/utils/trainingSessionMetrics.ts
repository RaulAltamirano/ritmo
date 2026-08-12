import type { ExerciseLog, SetLog } from '~/types/training'
import {
  estimated1Rm,
  formatNativeLoad,
  loadToKgEq,
} from '~/utils/trainingLoad'

export type ProgressMetric = 'load' | 'performance' | 'volume'

export interface SessionProgressPoint {
  dayKey: string
  kgEq: number | null
  e1rm: number | null
  volumeKg: number | null
  nativeLabel: string
  convertible: boolean
}

function setKgEq(
  set: SetLog,
  plateKg: number | null,
  bodyweightKg: number | null,
): number | null {
  return loadToKgEq({
    load: set.load,
    unit: set.unit,
    plateKg,
    bodyweightKg,
  })
}

export function bestCompletedSet(
  sets: SetLog[],
  plateKg: number | null,
  bodyweightKg: number | null,
): SetLog | null {
  let best: SetLog | null = null
  let bestKg = -Infinity
  let bestReps = -Infinity
  for (const set of sets) {
    if (!set.completed) continue
    const kg = setKgEq(set, plateKg, bodyweightKg)
    if (kg == null) continue
    const reps = set.reps ?? 0
    if (kg > bestKg || (kg === bestKg && reps > bestReps)) {
      best = set
      bestKg = kg
      bestReps = reps
    }
  }
  return best
}

export function sessionVolumeKg(
  sets: SetLog[],
  plateKg: number | null,
  bodyweightKg: number | null,
): number | null {
  let total = 0
  for (const set of sets) {
    if (!set.completed) continue
    const kg = setKgEq(set, plateKg, bodyweightKg)
    if (kg == null || set.reps == null) return null
    total += set.reps * kg
  }
  return total
}

export function formatLastSessionLine(set: SetLog): string {
  const rpe = set.rpe ?? 0
  const reps = set.reps ?? 0
  return `Last: ${reps} @${rpe} · ${formatNativeLoad(set.load, set.unit)}`
}

export function formatLoadDelta(todayKg: number, lastKg: number): string {
  const delta = Math.round((todayKg - lastKg) * 2) / 2
  if (delta === 0) return 'same'
  if (delta > 0) return `+${delta} kg`
  return `−${Math.abs(delta)} kg`
}

export function sessionProgressPoint(
  log: ExerciseLog,
  plateKg: number | null,
  bodyweightKg: number | null,
): SessionProgressPoint {
  const best = bestCompletedSet(log.sets, plateKg, bodyweightKg)
  const kgEq = best ? setKgEq(best, plateKg, bodyweightKg) : null
  const e1rm =
    best && kgEq != null && best.reps != null && best.rpe != null
      ? estimated1Rm(kgEq, best.reps, best.rpe)
      : null
  return {
    dayKey: log.dayKey,
    kgEq,
    e1rm,
    volumeKg: sessionVolumeKg(log.sets, plateKg, bodyweightKg),
    nativeLabel: best ? formatNativeLoad(best.load, best.unit) : '—',
    convertible: kgEq != null,
  }
}

export function shouldDrawLineChart(points: SessionProgressPoint[]): boolean {
  return points.filter(p => p.convertible).length >= 4
}
