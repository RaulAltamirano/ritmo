/**
 * Normaliza errores de `$fetch` / ofetch (Nuxt) y el envelope `ApiResponse` del backend.
 * En respuestas HTTP de error, ofetch suele exponer el JSON en `error.data`.
 */

export type ApiWorkSessionState = 'running' | 'paused' | 'pending_feedback'

export interface ParsedFetchError {
  /** Código HTTP si viene en el error de red / ofetch */
  status: number | undefined
  /** `error.code` del envelope API */
  code: string | undefined
  /** `error.message` del envelope API */
  message: string | undefined
  activeSessionId: string | undefined
  state: ApiWorkSessionState | undefined
  /** Cuerpo parseado cuando existe (`error.data` en ofetch) */
  data: unknown
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function pickErrorObject(body: unknown): Record<string, unknown> | undefined {
  if (!isRecord(body)) return undefined
  if (isRecord(body.error)) return body.error
  if (isRecord(body.data) && isRecord(body.data.error)) return body.data.error
  return undefined
}

function normalizeState(raw: unknown): ApiWorkSessionState | undefined {
  if (raw === 'running' || raw === 'paused' || raw === 'pending_feedback') return raw
  return undefined
}

/**
 * Extrae status HTTP de un error lanzado por `$fetch` u otro cliente compatible.
 */
export function getFetchErrorStatus(e: unknown): number | undefined {
  if (!isRecord(e)) return undefined
  const s = e.status
  const sc = e.statusCode
  if (typeof s === 'number') return s
  if (typeof sc === 'number') return sc
  return undefined
}

/**
 * Interpreta un `catch` de `$fetch`: prioriza `error.data` (ofetch) y luego el propio valor.
 */
export function parseFetchError(e: unknown): ParsedFetchError {
  const dataFromFetch = isRecord(e) && 'data' in e ? e.data : undefined
  const body = dataFromFetch ?? e
  const err = pickErrorObject(body) ?? pickErrorObject(e)

  const code = typeof err?.code === 'string' ? err.code : undefined
  const message = typeof err?.message === 'string' ? err.message : undefined
  const activeSessionId =
    typeof err?.activeSessionId === 'string' ? err.activeSessionId : undefined
  const state = normalizeState(err?.state)

  return {
    status: getFetchErrorStatus(e),
    code,
    message,
    activeSessionId,
    state,
    data: body,
  }
}

/** Texto legible para UI: prioriza `message` del API y cae a código o status HTTP. */
export function fetchErrorUserMessage(e: unknown, fallback: string): string {
  const p = parseFetchError(e)
  if (p.message?.trim()) return p.message.trim()
  if (p.code) return `${fallback} (${p.code})`
  if (p.status !== null && p.status !== undefined)
    return `${fallback} (HTTP ${p.status})`
  return fallback
}
