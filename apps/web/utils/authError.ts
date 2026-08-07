const AUTH_CODES = new Set(['UNAUTHORIZED', 'SESSION_INVALID'])

export function isAuthenticationError(error: any): boolean {
  if (!error) return false
  if (error.status === 401 || error.statusCode === 401) return true
  const code =
    error.code ?? error.error?.code ?? error.data?.error?.code ?? error.data?.code
  return typeof code === 'string' && AUTH_CODES.has(code)
}
