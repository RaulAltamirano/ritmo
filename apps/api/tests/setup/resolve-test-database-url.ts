/**
 * Resolves and validates TEST_DATABASE_URL for integration tests.
 * Tests must never default to DATABASE_URL alone (risk of wiping dev DB).
 */

export function getTestDatabaseUrl(): string {
  const url = process.env.TEST_DATABASE_URL
  if (!url?.trim()) {
    throw new Error(
      'TEST_DATABASE_URL is not set. Tests refuse to run against DATABASE_URL to avoid wiping the dev database. Start the test DB with `docker compose -f apps/api/docker-compose.test.yml up -d` and load apps/api/env.test.',
    )
  }

  if (!/_test(\?|$)/.test(url)) {
    throw new Error(
      `TEST_DATABASE_URL must point to a database whose name ends in _test. Got: ${url}`,
    )
  }

  return url
}
