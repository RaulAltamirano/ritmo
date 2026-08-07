export function parseDurationToMs(input: string): number {
  const match = /^(\d+)([mhd])$/i.exec(input.trim())
  if (!match) {
    throw new Error(`Unsupported duration: ${input}`)
  }
  const value = Number(match[1])
  const unit = match[2].toLowerCase()
  if (unit === 'm') return value * 60 * 1000
  if (unit === 'h') return value * 60 * 60 * 1000
  return value * 24 * 60 * 60 * 1000
}

export const AUTH_TTL = {
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  get accessTokenMs() {
    return parseDurationToMs(this.accessTokenExpiry)
  },
  get refreshTokenMs() {
    return parseDurationToMs(this.refreshTokenExpiry)
  },
  get sessionMs() {
    return this.refreshTokenMs
  },
} as const
