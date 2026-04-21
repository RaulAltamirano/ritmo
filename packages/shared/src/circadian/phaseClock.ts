/**
 * Wall-clock helpers for circadian phase math (same logic on API + web).
 */

export function getWallClockInTimezone(
  date: Date,
  timeZone: string,
): { hour: number; minute: number } {
  const tz = timeZone?.trim() || 'UTC'
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    })
    const parts = formatter.formatToParts(date)
    const hour = Number(parts.find(p => p.type === 'hour')?.value ?? 0)
    const minute = Number(parts.find(p => p.type === 'minute')?.value ?? 0)
    return { hour, minute }
  } catch {
    const u = new Date(date)
    return { hour: u.getUTCHours(), minute: u.getUTCMinutes() }
  }
}

export function getFractionalHourInTimezone(date: Date, timeZone: string): number {
  const { hour, minute } = getWallClockInTimezone(date, timeZone)
  return hour + minute / 60
}

/** Half-open range [startHour, endHour) in local wall clock; wrap if startHour > endHour (e.g. 21–5). */
export function phaseContainsHour(
  startHour: number,
  endHour: number,
  hour: number,
): boolean {
  if (startHour === endHour) return false
  if (startHour < endHour) {
    return hour >= startHour && hour < endHour
  }
  return hour >= startHour || hour < endHour
}

/** Minutes from `wall` time until the end of the phase window (same half-open convention). */
export function minutesUntilPhaseEnd(
  startHour: number,
  endHour: number,
  wall: { hour: number; minute: number },
): number {
  const nowM = wall.hour * 60 + wall.minute
  if (startHour < endHour) {
    const endM = endHour * 60
    return Math.max(0, endM - nowM)
  }
  const endM = endHour * 60
  if (wall.hour >= startHour) {
    return Math.max(0, 24 * 60 - nowM + endM)
  }
  return Math.max(0, endM - nowM)
}
