/**
 * Test DB: shared `public` schema.
 *
 * Migrations in `prisma/migrations` create types/tables in `"public"` explicitly, so
 * per-worker `?schema=ritmo_test_wN` + `prisma migrate deploy` per thread re-ran the
 * same SQL and collided (e.g. "UserStatus" already exists). Migrations run once in
 * `global-setup.ts`; we serialize Vitest with `maxWorkers: 1` to avoid TRUNCATE races.
 */

import { PrismaClient } from '@prisma/client'

import { getTestDatabaseUrl } from './resolve-test-database-url.ts'

process.env.DATABASE_URL = getTestDatabaseUrl()

/** `pg_tables.schemaname` used for TRUNCATE cleanup */
export const workerSchema = 'public'

export const workerPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.DEBUG_TEST_DB === '1' ? ['query', 'error', 'warn'] : ['error'],
})
