/**
 * Día civil `YYYY-MM-DD` en una zona IANA (alineado con servidor / User.timezone).
 * Usa `Intl` (sin Luxon en el cliente).
 */
export function getCivilDateYmd(timezoneIana: string, when: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezoneIana,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(when)
  } catch {
    return when.toISOString().slice(0, 10)
  }
}
