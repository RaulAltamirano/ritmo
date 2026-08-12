import type { ExerciseLog, LoadUnit, SetLog } from '~/types/training'
import { formatNativeLoad } from '~/utils/trainingLoad'
import type {
  ProgressMetric,
  SessionProgressPoint,
} from '~/utils/trainingSessionMetrics'
import { bestCompletedSet, sessionProgressPoint } from '~/utils/trainingSessionMetrics'

const CHART_WIDTH = 320
const CHART_HEIGHT = 120
const CHART_PAD = 8
const CHART_INNER_W = CHART_WIDTH - CHART_PAD * 2
const CHART_INNER_H = CHART_HEIGHT - CHART_PAD * 2

export function linePoints(values: number[], width: number, height: number): string {
  if (values.length === 0) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  return values
    .map((value, index) => {
      const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width
      const y = height - ((value - min) / span) * height
      return `${x},${y}`
    })
    .join(' ')
}

export function chartCircles(values: number[]): Array<{ cx: number; cy: number }> {
  const raw = linePoints(values, CHART_INNER_W, CHART_INNER_H)
  if (!raw) return []
  return raw.split(' ').map(pair => {
    const [x, y] = pair.split(',')
    return { cx: Number(x) + CHART_PAD, cy: Number(y) + CHART_PAD }
  })
}

export function nativeBestSet(sets: SetLog[]): SetLog | null {
  const completed = sets.filter(set => set.completed)
  if (completed.length === 0) return null
  return completed.reduce((best, set) => {
    const load = set.load ?? Number.NEGATIVE_INFINITY
    const bestLoad = best.load ?? Number.NEGATIVE_INFINITY
    if (load > bestLoad) return set
    if (load === bestLoad && (set.reps ?? 0) > (best.reps ?? 0)) return set
    return best
  })
}

export function rowBestSet(
  log: ExerciseLog,
  plateKg: number | null,
  bodyweightKg: number | null,
): SetLog | null {
  return bestCompletedSet(log.sets, plateKg, bodyweightKg) ?? nativeBestSet(log.sets)
}

export function metricValue(
  point: SessionProgressPoint,
  metric: ProgressMetric,
): number | null {
  if (metric === 'performance') return point.e1rm
  if (metric === 'volume') return point.volumeKg
  return point.kgEq
}

export function compactSets(
  log: ExerciseLog,
  plateKg: number | null,
  bodyweightKg: number | null,
): string {
  const completed = log.sets.filter(set => set.completed)
  if (completed.length === 0) return '—'
  const last = completed[completed.length - 1]
  if (!last) return '—'
  const reps = completed.map(set => set.reps ?? '—').join('/')
  const best = rowBestSet(log, plateKg, bodyweightKg) ?? last
  return `${reps} @${best.rpe ?? '—'} · ${formatNativeLoad(best.load, best.unit)}`
}

export function parseKgInput(raw: string): number | null {
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) && n >= 0 ? n : null
}

export function logsNewestFirst(logs: ExerciseLog[]): ExerciseLog[] {
  return [...logs].sort((a, b) => b.dayKey.localeCompare(a.dayKey))
}

export function sessionPoints(
  logs: ExerciseLog[],
  plateKg: number | null,
  bodyweightKg: number | null,
): SessionProgressPoint[] {
  return logs.map(log => sessionProgressPoint(log, plateKg, bodyweightKg))
}

export function chartMetricValues(
  points: SessionProgressPoint[],
  metric: ProgressMetric,
): number[] {
  return [...points]
    .sort((a, b) => a.dayKey.localeCompare(b.dayKey))
    .map(point => metricValue(point, metric))
    .filter((value): value is number => typeof value === 'number')
}

export function todayConvertible(
  points: SessionProgressPoint[],
  todayKey: string,
): SessionProgressPoint | null {
  return points.find(p => p.dayKey === todayKey && p.convertible) ?? null
}

export function previousConvertible(
  points: SessionProgressPoint[],
  todayKey: string,
): SessionProgressPoint | null {
  return (
    points
      .filter(point => point.dayKey < todayKey && point.convertible)
      .sort((a, b) => b.dayKey.localeCompare(a.dayKey))[0] ?? null
  )
}

export function bestMetricPoint(
  points: SessionProgressPoint[],
  metric: ProgressMetric,
): SessionProgressPoint | null {
  let best: SessionProgressPoint | null = null
  let bestVal = Number.NEGATIVE_INFINITY
  for (const point of points) {
    const value = metricValue(point, metric)
    if (typeof value !== 'number' || value <= bestVal) continue
    best = point
    bestVal = value
  }
  return best
}

export function logsUseUnit(logs: ExerciseLog[], unit: LoadUnit): boolean {
  return logs.some(log => log.sets.some(set => set.unit === unit))
}

export function historyRows(
  logs: ExerciseLog[],
  plateKg: number | null,
  bodyweightKg: number | null,
) {
  return logsNewestFirst(logs).map(log => {
    const set = rowBestSet(log, plateKg, bodyweightKg)
    const point = sessionProgressPoint(log, plateKg, bodyweightKg)
    return {
      dayKey: log.dayKey,
      reps: set?.reps ?? '—',
      rpe: set?.rpe ?? '—',
      load: set ? formatNativeLoad(set.load, set.unit) : '—',
      kg: typeof point.kgEq === 'number' ? String(point.kgEq) : '—',
    }
  })
}

export function statCards(
  today: SessionProgressPoint | null,
  previous: SessionProgressPoint | null,
  best: SessionProgressPoint | null,
  metric: ProgressMetric,
) {
  return [
    { label: 'Today', value: today ? metricValue(today, metric) : null },
    { label: 'Previous', value: previous ? metricValue(previous, metric) : null },
    { label: 'Best', value: best ? metricValue(best, metric) : null },
  ].filter(card => typeof card.value === 'number')
}
