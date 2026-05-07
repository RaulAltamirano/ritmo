/**
 * Vitest globalSetup — runs once before workers (extensions, connectivity, migrations).
 */

import { spawn } from 'child_process'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

import { PrismaClient } from '@prisma/client'

import { getTestDatabaseUrl } from './resolve-test-database-url.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const apiPackageRoot = resolve(__dirname, '../..')

function runPrismaCli(
  args: string[],
  databaseUrl: string,
): Promise<{ code: number | null; out: string }> {
  return new Promise((resolveOut, reject) => {
    const proc = spawn('pnpm', ['exec', 'prisma', ...args], {
      cwd: apiPackageRoot,
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'pipe',
    })
    let stderr = ''
    let stdout = ''
    proc.stderr?.on('data', chunk => {
      stderr += String(chunk)
    })
    proc.stdout?.on('data', chunk => {
      stdout += String(chunk)
    })
    proc.on('error', reject)
    proc.on('close', code => {
      resolveOut({ code, out: `${stderr}\n${stdout}`.trim() })
    })
  })
}

export default async function globalSetup(): Promise<void> {
  await import(new URL('./load-test-env.ts', import.meta.url).href)

  const rawUrl = getTestDatabaseUrl()

  let host = 'unknown'
  let port = '?'
  try {
    const u = new URL(rawUrl)
    host = u.hostname || host
    port = u.port ?? '5432'
  } catch {
    /* ignore parse errors; Prisma ping will surface them */
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: rawUrl } },
    log: ['error'],
  })

  try {
    await prisma.$queryRaw`SELECT 1`
  } catch {
    await prisma.$disconnect().catch(() => {})
    throw new Error(
      `[global-setup] Cannot reach test database at ${host}:${port}. Run \`docker compose -f apps/api/docker-compose.test.yml up -d\`.`,
    )
  }

  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm`)
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pgcrypto`)

  await prisma.$disconnect().catch(() => {})

  let deploy = await runPrismaCli(['migrate', 'deploy'], rawUrl)
  if (deploy.code !== 0) {
    if (deploy.out.includes('P3005') || deploy.out.includes('P3018')) {
      // Do not use `prisma migrate reset` in automation (Prisma 6+ guard in AI/CI). Recreate public.
      const p = new PrismaClient({
        datasources: { db: { url: rawUrl } },
        log: ['error'],
      })
      try {
        // Init migration must recreate pg_trgm/pgcrypto (see 20250903204308_init); do not remove those lines.
        await p.$executeRawUnsafe('DROP SCHEMA IF EXISTS public CASCADE')
        await p.$executeRawUnsafe('CREATE SCHEMA public')
        await p.$executeRawUnsafe('GRANT ALL ON SCHEMA public TO PUBLIC')
      } finally {
        await p.$disconnect().catch(() => {})
      }
      deploy = await runPrismaCli(['migrate', 'deploy'], rawUrl)
    }
  }
  if (deploy.code !== 0) {
    throw new Error(
      `[global-setup] prisma migrate deploy failed. ${deploy.out.slice(0, 4000)}`,
    )
  }
}
