import { loadConfig } from '@/config/environment'

function base() {
  return `${loadConfig().api.baseUrl}/work-sessions`
}

export async function getActiveWorkSession() {
  return $fetch(`${base()}/active`, { credentials: 'include' })
}

export async function createWorkSession(body: {
  taskId: string
  targetDurationSec: number
  timerMode: string
  presetKey?: string
}) {
  return $fetch(base(), {
    method: 'POST',
    credentials: 'include',
    body,
  })
}

export async function patchWorkSession(
  sessionId: string,
  body: {
    lastClientSeenAt: string
    state: 'running' | 'paused' | 'pending_feedback'
    pausedDurationSec: number
  },
) {
  return $fetch(`${base()}/${sessionId}`, {
    method: 'PATCH',
    credentials: 'include',
    body,
  })
}

export async function completeWorkSession(
  sessionId: string,
  headers: { 'Idempotency-Key': string },
  body: Record<string, unknown>,
) {
  return $fetch(`${base()}/${sessionId}/complete`, {
    method: 'POST',
    credentials: 'include',
    headers: headers as HeadersInit,
    body,
  })
}

export async function abandonWorkSession(sessionId: string) {
  return $fetch(`${base()}/${sessionId}/abandon`, {
    method: 'POST',
    credentials: 'include',
  })
}

export async function listWorkSessions(params: {
  state?: string
  from?: string
  to?: string
  limit?: number
  cursor?: string
}) {
  const q = new URLSearchParams()
  if (params.state) q.set('state', params.state)
  if (params.from) q.set('from', params.from)
  if (params.to) q.set('to', params.to)
  if (params.limit !== null && params.limit !== undefined)
    q.set('limit', String(params.limit))
  if (params.cursor) q.set('cursor', params.cursor)
  const qs = q.toString()
  return $fetch(qs ? `${base()}?${qs}` : base(), { credentials: 'include' })
}
