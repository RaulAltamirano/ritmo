/**
 * Recreates `public` on the test database and runs `prisma migrate deploy`.
 * Mirrors the P3005/P3018 recovery path in `tests/setup/global-setup.ts`.
 *
 * After `DROP SCHEMA public CASCADE`, the first migration must recreate extensions
 * (`pg_trgm`, `pgcrypto`); see `prisma/migrations/20250903204308_init/migration.sql`.
 */
import { spawn } from 'child_process'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

import { PrismaClient } from '@prisma/client'

await import(new URL('../tests/setup/load-test-env.ts', import.meta.url).href)

import { getTestDatabaseUrl } from '../tests/setup/resolve-test-database-url.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const apiPackageRoot = resolve(__dirname, '..')

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

const rawUrl = getTestDatabaseUrl()
const prisma = new PrismaClient({
  datasources: { db: { url: rawUrl } },
  log: ['error'],
})

try {
  await prisma.$executeRawUnsafe('DROP SCHEMA IF EXISTS public CASCADE')
  await prisma.$executeRawUnsafe('CREATE SCHEMA public')
  await prisma.$executeRawUnsafe('GRANT ALL ON SCHEMA public TO PUBLIC')
} finally {
  await prisma.$disconnect().catch(() => {})
}

const deploy = await runPrismaCli(['migrate', 'deploy'], rawUrl)
if (deploy.code !== 0) {
  console.error(deploy.out)
  process.exit(deploy.code ?? 1)
}

console.log('[test-db-reset] public recreated and migrations applied.')
