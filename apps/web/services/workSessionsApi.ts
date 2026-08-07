import { loadConfig } from '@/config/environment'
import { newIdempotencyKey } from '@/utils/idempotency'

function base() {
  return `${loadConfig().api.baseUrl}/work-sessions`
}

function withIdempotency(headers?: HeadersInit): HeadersInit {
  return {
    ...Object.fromEntries(new Headers(headers).entries()),
    'Idempotency-Key': newIdempotencyKey(),
  }
}

export async function getActiveWorkSession() {
  return $fetch(`${base()}/active`, { credentials: 'include' })
}

export async function createWorkSession(body: {
  taskId: string
  targetDurationSec: number
  timerMode: string
  breakDurationSec?: number
  presetKey?: string
}) {
  return $fetch(base(), {
    method: 'POST',
    credentials: 'include',
    headers: withIdempotency(),
    body,
  })
}

export async function patchWorkSession(
  sessionId: string,
  body: {
    lastClientSeenAt: string
    state: 'running' | 'paused' | 'on_break' | 'pending_feedback'
    pausedDurationSec: number
    breakPausedDurationSec?: number
  },
) {
  return $fetch(`${base()}/${sessionId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: withIdempotency(),
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
    headers: withIdempotency(),
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
