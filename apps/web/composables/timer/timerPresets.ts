import type { TimerMode } from '@/types/task'

/** Presets por defecto locales (fallback si API no devuelve `timerPresets`). */
export const DEFAULT_TIMER_PRESETS: TimerMode[] = [
  {
    id: 'pomodoro-25-5',
    presetKey: '25_5',
    name: 'Pomodoro 25/5',
    description: '25 min foco · 5 min pausa',
    duration: '25 min',
    time: 25 * 60,
    breakSec: 300,
    color: 'bg-red-500',
    icon: 'Timer',
    minutes: 25,
  },
  {
    id: 'desk-52-17',
    presetKey: '52_17',
    name: '52/17',
    description: '52 min foco · 17 min pausa',
    duration: '52 min',
    time: 52 * 60,
    breakSec: 1020,
    color: 'bg-amber-500',
    icon: 'Timer',
    minutes: 52,
  },
  {
    id: 'ultradian-90-20',
    presetKey: '90_20',
    name: '90/20',
    description: '90 min foco · 20 min pausa',
    duration: '90 min',
    time: 90 * 60,
    breakSec: 1200,
    color: 'bg-violet-500',
    icon: 'Timer',
    minutes: 90,
  },
]

const COLOR_CYCLE = [
  'bg-red-500',
  'bg-amber-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-sky-500',
]

/** Forma alineada a `UserPreferences.timerPresets` (spec §5.4). */
export interface TimerPresetWire {
  key: string
  workSec: number
  breakSec: number
  label?: string
}

export function timerPresetsDtoToTimerModes(dto: {
  presets: TimerPresetWire[]
}): TimerMode[] {
  return dto.presets.map((p, i) => {
    const workMin = Math.max(1, Math.round(p.workSec / 60))
    const breakMin = Math.round(p.breakSec / 60)
    const title = p.label ?? `${workMin}/${breakMin}`
    return {
      id: `preset-${p.key}`,
      presetKey: p.key,
      name: title,
      description: `${workMin} min foco · ${breakMin} min pausa`,
      duration: `${workMin} min`,
      time: p.workSec,
      breakSec: p.breakSec,
      color: COLOR_CYCLE[i % COLOR_CYCLE.length] ?? 'bg-red-500',
      icon: 'Timer',
      minutes: workMin,
    }
  })
}

/** Familia conceptual del timer (spec §5.2 `timer_mode`). */
export type WorkSessionMode = 'pomodoro' | 'ultradian' | 'custom'

/** Etiqueta visible junto al icono del modo en la UI del timer. */
export function getModeDisplay(mode: WorkSessionMode): { label: string } {
  switch (mode) {
    case 'pomodoro':
      return { label: 'Pomodoro' }
    case 'ultradian':
      return { label: 'Ultradiano' }
    case 'custom':
    default:
      return { label: 'Personalizado' }
  }
}

/** Modo Pomodoro / ultradian / custom según la clave persistida en servidor. */
export function mapPresetKeyToTimerMode(key: string): WorkSessionMode {
  if (key === '25_5') return 'pomodoro'
  if (key === '90_20') return 'ultradian'
  if (key === '52_17') return 'custom'
  return 'custom'
}

/** Heurística por etiqueta cuando no hay `presetKey` (timers legacy / personalizados). */
export function mapModeLabelToTimerMode(label: string): WorkSessionMode {
  const s = label.trim().toLowerCase()
  if (!s) return 'custom'
  if (/\b52\s*\/\s*17\b/.test(s) || s.includes('52/17')) return 'custom'
  if (s.includes('pomodoro')) return 'pomodoro'
  if (s.includes('25') && s.includes('5')) return 'pomodoro'
  if (s.includes('ultradian') || s.includes('ultradiano')) return 'ultradian'
  if ((s.includes('90') && s.includes('20')) || /\b90\s*\/\s*20\b/.test(s))
    return 'ultradian'
  return 'custom'
}
