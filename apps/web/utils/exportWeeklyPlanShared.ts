import type { TrainingDayFocus } from '~/types/training'

export const PROGRESSION_TIP =
  'Si logras completar todas las repeticiones con buena técnica en RIR 1–3 durante 1 o 2 sesiones, aumenta el peso ligeramente en la siguiente (2.5–5 kg en básicos, 1–2 kg en aislados).'

export const DELOAD_TIP =
  'Cada 4 a 6 semanas de entrenamiento intenso, realiza una semana de descarga bajando el número de series al 50-70% o trabajando con un RIR 3–4 (más lejos del fallo) para permitir la recuperación.'

export const RIR_DEFINITION =
  'RIR (Repeticiones en Reserva) = cuántas repeticiones más podrías hacer con buena técnica antes del fallo. Ejemplo: terminas 10 reps y sientes que podrías hacer 2 más → RIR 2. En esta rutina apunta a RIR 1–3 en series efectivas (cerca del esfuerzo, sin llegar al fallo feo).'

export const RPE_DEFINITION =
  'RPE (Esfuerzo Percibido) = escala 1–10 de qué tan duro se sintió la serie. RPE 7 ≈ fácil-duro (quedan ~3 reps); RPE 8 ≈ duro (quedan ~2); RPE 9 ≈ muy duro (~1). Regla práctica: RPE ≈ 10 − RIR. Si la técnica se rompe, el peso está alto aunque “creas” que queda RIR.'

export const HOW_TO_APPLY =
  'Cómo saberlo: al terminar la serie, pregunta “¿cuántas más con la misma técnica?”. Ese número es el RIR. Compáralo con el RIR Objetivo de la fila. Si quedaste más lejos del fallo (RIR más alto de lo pedido) varias sesiones seguidas, sube carga. Si no llegas a las reps o la técnica falla, bájala o quédate en el mismo peso.'

export function dateIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Export header matching the source tables: "Día 1: Empuje / Tracción A". */
export function trainingSessionBanner(day: {
  dayNumber: number
  name: string
}): string {
  return `Día ${day.dayNumber}: ${day.name}`
}

export function trainingDayStyleId(focus: TrainingDayFocus): string {
  return focus === 'upper' ? 'DayUpper' : 'DayLower'
}

export function escapeCsvCell(value: string, separator: string): string {
  const needsQuotes =
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r') ||
    value.includes(separator)
  const escaped = value.replace(/"/g, '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

export function toCsvLine(cells: string[], separator: string): string {
  return cells.map(cell => escapeCsvCell(cell, separator)).join(separator)
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
