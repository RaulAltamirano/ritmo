/**
 * Open Prisma Studio against the test database (schema `public` via default search_path).
 */
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

await import(new URL('../tests/setup/load-test-env.ts', import.meta.url).href)

import { getTestDatabaseUrl } from '../tests/setup/resolve-test-database-url.ts'

process.env.DATABASE_URL = getTestDatabaseUrl()

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const proc = spawn('pnpm', ['exec', 'prisma', 'studio'], {
  cwd: apiRoot,
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
})

proc.on('close', code => process.exit(code ?? 0))
