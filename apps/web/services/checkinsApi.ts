import { loadConfig } from '@/config/environment'

export function checkinsDailyUrl(): string {
  return `${loadConfig().api.baseUrl}/checkins/daily`
}

export function checkinsDailyByDateUrl(ymd: string): string {
  return `${loadConfig().api.baseUrl}/checkins/daily/${ymd}`
}

export async function getDailyCheckin(ymd: string) {
  return $fetch(checkinsDailyByDateUrl(ymd), { credentials: 'include' })
}

export async function putDailyCheckin(body: { energy: number; stress: number }) {
  return $fetch(checkinsDailyUrl(), {
    method: 'PUT',
    credentials: 'include',
    body,
  })
}
