/**
 * Elimina registros de idempotencia de `complete` más antiguos que 24 h (spec §10).
 */

import prisma from '../../core/database/prisma.js'

const TWENTY_FOUR_H_MS = 24 * 60 * 60 * 1000

export async function runWorkSessionIdempotencyCleanup(): Promise<{ deleted: number }> {
  const cutoff = new Date(Date.now() - TWENTY_FOUR_H_MS)
  const result = await prisma.workSessionIdempotency.deleteMany({
    where: { createdAt: { lt: cutoff } },
  })
  return { deleted: result.count }
}
