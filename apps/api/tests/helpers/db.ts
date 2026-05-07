import type { Prisma } from '@prisma/client'

import { workerPrisma, workerSchema } from '../setup/worker-context.ts'

/** Truncate all tables in the worker schema (FK-safe via CASCADE). */
export async function truncateAll(): Promise<void> {
  const rows = await workerPrisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname = ${workerSchema}
  `

  if (rows.length === 0) return

  const quoted = rows
    .filter(r => r.tablename !== '_prisma_migrations')
    .map(
      r => `"${workerSchema.replace(/"/g, '""')}"."${r.tablename.replace(/"/g, '""')}"`,
    )
    .join(', ')

  if (!quoted) return

  await workerPrisma.$executeRawUnsafe(`TRUNCATE TABLE ${quoted} CASCADE`)
}

export async function withinTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return workerPrisma.$transaction(fn)
}

export async function rawQuery<T = unknown>(
  sql: string,
  params?: unknown[],
): Promise<T> {
  if (!params?.length) {
    return workerPrisma.$queryRawUnsafe(sql) as Promise<T>
  }
  return workerPrisma.$queryRawUnsafe(sql, ...params) as Promise<T>
}
