import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const here = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(here, '../../env.test')

try {
  const content = readFileSync(envPath, 'utf-8')
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq < 0) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[key] ??= value
  }
} catch (err) {
  const code =
    err instanceof Error && 'code' in err
      ? (err as NodeJS.ErrnoException).code
      : undefined
  if (code !== 'ENOENT') throw err
  // Missing env.test: resolveTestDatabaseUrl() will hard-fail with a clear message.
}
