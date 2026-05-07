# API integration tests (`apps/api`)

PostgreSQL-backed HTTP tests share one Vitest profile: **`vitest.config.ts`**.

## Prerequisites

1. Copy or use [`env.test`](../env.test): `TEST_DATABASE_URL` must point at a database whose **name ends in `_test`** (never rely on plain `DATABASE_URL` alone).

2. Do **not** rely on a file named `.env.test` for this harness: Vitest loads [`env.test`](../env.test) via `tests/setup/load-test-env.ts`. See [`.env.test.example`](../.env.test.example) if your IDE used to pick up a legacy `.env.test`.

3. Start Docker Postgres for local runs:

```bash
pnpm --filter=@ritmo/api test:db:up
```

(Port **5436** matches `docker-compose.test.yml` and the `test` job in CI.)

4. **GitHub Actions:** the `test` job in [`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml) defines the same `SESSION_SECRET` / `DEVICE_HMAC_SECRET` / `API_SECRET` / `MOCK_*` and related keys as [`env.test`](../env.test) so `@ritmo/config` validates without relying on checking in `env.test` alone. Keep local `env.test` in sync with that block when you add new required env vars to the app.

## Commands

```bash
pnpm --filter=@ritmo/api test          # CI-style run (vitest run)
pnpm --filter=@ritmo/api test:watch
pnpm --filter=@ritmo/api test:coverage
pnpm --filter=@ritmo/api test:db:reset   # DROP/CREATE public + prisma migrate deploy (destructive)
pnpm --filter=@ritmo/api test:db:studio  # Prisma Studio against TEST_DATABASE_URL (schema public)
```

## Harness

- **`tests/setup/global-setup.ts`** — ping DB + `CREATE EXTENSION` + `prisma migrate deploy` (once, against `public`).
- **`tests/setup/worker-context.ts`** — sets `DATABASE_URL` from `TEST_DATABASE_URL` (shared `public` schema; migrations are not multi-schema).
- **`tests/setup/per-test-setup.ts`** — `beforeEach`: `TRUNCATE … CASCADE` on all user tables in `public` (excludes `_prisma_migrations`).
- **`tests/helpers/`** — `createAuthedUser()`, `authedHttp`, `expectApiError`, DB/time helpers.
- **`tests/factories/`** — persistence via `workerPrisma`.

Vitest runs with **`fileParallelism: false`** and a **single thread** so parallel tests do not interleave on the same DB. If you need multi-worker speed later, use separate databases per worker or regen migrations for true per-schema isolation.

## Anti-patterns (by convention)

These match the API Test Foundation spec; they are not ESLint-enforced:

- Do not import `PrismaClient` directly in a test file — use `workerPrisma` from `tests/setup/worker-context.ts`.
- Do not read `process.env.DATABASE_URL` or `process.env.TEST_DATABASE_URL` from a test (harness owns DB wiring).
- Do not call `$executeRaw` / `TRUNCATE` from a test for cleanup — that is `per-test-setup`.
- Do not write helpers that depend on test execution order.
- Prefer `createAuthedUser()` and `authedHttp()` over bespoke supertest cookie boilerplate.

## Debugging

- After a failure, inspect data with `pnpm test:db:studio` (default schema `public`).
- Optional: `DEBUG_TEST_DB=1 pnpm test` for Prisma query logging.
- If Postgres was upgraded (e.g. 15 to 16) and the data volume errors on start, run `docker compose -f apps/api/docker-compose.test.yml down -v` and `test:db:up` again (destroys test volume data).
