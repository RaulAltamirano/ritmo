import {
  breakElapsedSec,
  focusBillableSec,
  formatDurationSec,
} from '@/utils/workSessionDurations'

export type EndDaySessionState =
  | 'completed'
  | 'abandoned'
  | 'running'
  | 'paused'
  | 'on_break'
  | 'pending_feedback'
  | string

export type EndDaySessionRow = {
  id: string
  taskTitle: string
  state: EndDaySessionState
  stateLabel: string
  startTime: string
  endTime: string | null
  timeRangeLabel: string
  focusSec: number
  breakSec: number
  focusLabel: string
  breakLabel: string
  focusShare: number
}

const STATE_LABELS: Record<string, string> = {
  completed: 'Completada',
  abandoned: 'Abandonada',
  running: 'En curso',
  paused: 'Pausada',
  on_break: 'En descanso',
  pending_feedback: 'Pendiente de reflexión',
}

export function formatEndDayTimeRange(
  startIso: string,
  endIso: string | null,
): string {
  const start = new Date(startIso)
  const startLabel = start.toLocaleTimeString('es', {
    hour: '2-digit',
    minute: '2-digit',
  })
  if (!endIso) return `${startLabel} · en curso`
  const end = new Date(endIso)
  const endLabel = end.toLocaleTimeString('es', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${startLabel} – ${endLabel}`
}

export function extractWorkSessionItems(res: unknown): unknown[] {
  if (!res || typeof res !== 'object') return []
  const payload = (res as { data?: unknown }).data
  if (!payload || typeof payload !== 'object') return []
  const { items } = payload as { items?: unknown }
  return Array.isArray(items) ? items : []
}

export function mapWorkSessionToSummaryRow(
  raw: unknown,
  now: Date = new Date(),
): EndDaySessionRow | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  if (typeof o.id !== 'string' || typeof o.startTime !== 'string') return null

  const endTime = typeof o.endTime === 'string' ? o.endTime : null
  const breakStartedAt =
    typeof o.breakStartedAt === 'string' ? o.breakStartedAt : null
  const task = o.task as { title?: unknown } | undefined
  const taskTitle =
    typeof task?.title === 'string' && task.title.trim() ? task.title : 'Tarea'
  const state = typeof o.state === 'string' ? o.state : 'unknown'

  const focusSec = focusBillableSec(
    {
      startTime: o.startTime,
      endTime,
      pausedDurationSec:
        typeof o.pausedDurationSec === 'number' ? o.pausedDurationSec : 0,
      breakStartedAt,
    },
    now,
  )
  const breakSec = breakElapsedSec(
    {
      breakStartedAt,
      endTime,
      breakPausedDurationSec:
        typeof o.breakPausedDurationSec === 'number'
          ? o.breakPausedDurationSec
          : 0,
    },
    now,
  )
  const span = focusSec + breakSec

  return {
    id: o.id,
    taskTitle,
    state,
    stateLabel: STATE_LABELS[state] ?? state,
    startTime: o.startTime,
    endTime,
    timeRangeLabel: formatEndDayTimeRange(o.startTime, endTime),
    focusSec,
    breakSec,
    focusLabel: formatDurationSec(focusSec),
    breakLabel: breakSec > 0 ? formatDurationSec(breakSec) : '—',
    focusShare: span > 0 ? focusSec / span : 1,
  }
}

export function stateBadgeClass(state: string): string {
  if (state === 'completed') {
    return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
  }
  if (state === 'abandoned') {
    return 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300'
  }
  if (
    state === 'running' ||
    state === 'paused' ||
    state === 'on_break' ||
    state === 'pending_feedback'
  ) {
    return 'border-primary-500/30 bg-primary-500/10 text-primary-700 dark:text-primary-300'
  }
  return 'border-outline bg-surface text-content-secondary'
}
