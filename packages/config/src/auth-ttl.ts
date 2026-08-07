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

/** Shared auth TTLs — reads JWT_*_EXPIRY after dotenv (lazy getters). */
export const AUTH_TTL = {
  get accessTokenExpiry(): string {
    return process.env.JWT_ACCESS_EXPIRY ?? '15m'
  },
  get refreshTokenExpiry(): string {
    return process.env.JWT_REFRESH_EXPIRY ?? '7d'
  },
  get accessTokenMs(): number {
    return parseDurationToMs(this.accessTokenExpiry)
  },
  get refreshTokenMs(): number {
    return parseDurationToMs(this.refreshTokenExpiry)
  },
  get sessionMs(): number {
    return this.refreshTokenMs
  },
}
