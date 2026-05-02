/**
 * Marca como `abandoned` bloques en `running` o `paused` sin señal de cliente reciente.
 *
 * Criterio (spec §8.2 / plan):
 * - Solo `running` y `paused` — **no** se toca `pending_feedback` (requiere acción explícita).
 * - Umbral: `now - lastClientSeenAt` (o `startTime` si nunca hubo heartbeat) >
 *   `min(2 × targetDurationSec en segundos, 6 h)` en milisegundos.
 * - Si falta `targetDurationSec`, no se auto-abandona por este job.
 *
 * Ejecutar cada ~5 min junto al resto de jobs de mantenimiento.
 */

import { WorkSessionState } from '@prisma/client'
import prisma from '../../core/database/prisma.js'

const SIX_HOURS_MS = 6 * 60 * 60 * 1000

export async function runWorkSessionStaleAbandon(): Promise<{ abandoned: number }> {
  const now = Date.now()

  const candidates = await prisma.workSession.findMany({
    where: {
      state: { in: [WorkSessionState.running, WorkSessionState.paused] },
      isDeleted: false,
      targetDurationSec: { not: null },
    },
    select: {
      id: true,
      startTime: true,
      lastClientSeenAt: true,
      targetDurationSec: true,
    },
  })

  const ids: string[] = []
  for (const s of candidates) {
    const targetSec = s.targetDurationSec
    if (targetSec === null || targetSec === undefined) continue

    const ref = (s.lastClientSeenAt ?? s.startTime).getTime()
    const staleMs = now - ref
    const thresholdMs = Math.min(2 * targetSec * 1000, SIX_HOURS_MS)
    if (staleMs > thresholdMs) {
      ids.push(s.id)
    }
  }

  if (ids.length === 0) {
    return { abandoned: 0 }
  }

  const result = await prisma.workSession.updateMany({
    where: { id: { in: ids } },
    data: {
      state: WorkSessionState.abandoned,
      endTime: new Date(),
    },
  })

  return { abandoned: result.count }
}
