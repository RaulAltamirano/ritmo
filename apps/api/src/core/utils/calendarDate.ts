import { DateTime } from 'luxon'

/**
 * Día civil del usuario en su zona IANA, como `Date` a medianoche UTC de ese día
 * (coherente con columnas Prisma `DateTime @db.Date`).
 */
export function getCalendarDateForUser(nowUtc: Date, timezoneIana: string): Date {
  const local = DateTime.fromJSDate(nowUtc, { zone: 'utc' }).setZone(timezoneIana)
  const isoDate = local.toISODate()
  if (!isoDate) {
    throw new Error(`Invalid calendar date for timezone: ${timezoneIana}`)
  }
  return DateTime.fromISO(isoDate, { zone: 'utc' }).startOf('day').toJSDate()
}

/** Parsea `YYYY-MM-DD` a fecha solo-día (medianoche UTC). */
export function parseCalendarDateString(ymd: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    throw new Error(`Invalid calendar date string: ${ymd}`)
  }
  const dt = DateTime.fromISO(ymd, { zone: 'utc' })
  if (!dt.isValid) {
    throw new Error(`Invalid calendar date string: ${ymd}`)
  }
  return dt.startOf('day').toJSDate()
}
