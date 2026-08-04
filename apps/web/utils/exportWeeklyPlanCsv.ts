import type { WeeklyPlan } from '~/types/training'
import {
  DELOAD_TIP,
  HOW_TO_APPLY,
  PROGRESSION_TIP,
  RIR_DEFINITION,
  RPE_DEFINITION,
  toCsvLine,
  trainingSessionBanner,
} from '~/utils/exportWeeklyPlanShared'
import { addDays, formatWeekLabel } from '~/utils/trainingWeek'

function appendGuideCsv(lines: string[], separator: string): void {
  lines.push('')
  lines.push(toCsvLine(['══ Guía rápida: RIR y RPE ══'], separator))
  lines.push(toCsvLine(['Qué es RIR', RIR_DEFINITION], separator))
  lines.push(toCsvLine(['Qué es RPE', RPE_DEFINITION], separator))
  lines.push(toCsvLine(['Cómo aplicarlos', HOW_TO_APPLY], separator))
  lines.push('')
  lines.push(toCsvLine(['📈 Reglas de Progresión y Descarga'], separator))
  lines.push(toCsvLine(['Progresión', PROGRESSION_TIP], separator))
  lines.push(toCsvLine(['Descarga (Deload)', DELOAD_TIP], separator))
}

/** CSV with the same Día 1–4 tables as the source routine. */
export function buildWeeklyPlanCsv(plan: WeeklyPlan, weekStart: Date): string {
  const separator = ','
  const lines: string[] = []
  const weekEnd = addDays(weekStart, 6)
  const weekLabel = formatWeekLabel(weekStart, weekEnd)

  lines.push(toCsvLine(['Plan', plan.title], separator))
  lines.push(toCsvLine(['Programa', plan.programLabel], separator))
  lines.push(toCsvLine(['Semana', weekLabel], separator))
  lines.push('')

  const sessions = [...plan.days].sort((a, b) => a.dayNumber - b.dayNumber)

  for (const day of sessions) {
    lines.push(toCsvLine([trainingSessionBanner(day)], separator))
    lines.push(
      toCsvLine(
        ['Bloque', 'Ejercicio', 'Series y Repeticiones', 'RIR Objetivo', 'RPE'],
        separator,
      ),
    )

    for (const exercise of day.exercises) {
      lines.push(
        toCsvLine(
          [
            exercise.block,
            exercise.name,
            exercise.setsReps,
            exercise.targetRir,
            exercise.rpe,
          ],
          separator,
        ),
      )
    }
    lines.push('')
  }

  appendGuideCsv(lines, separator)
  return `\uFEFF${lines.join('\r\n')}`
}
