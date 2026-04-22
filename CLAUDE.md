# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Overview

**Ritmo** is a productivity/circadian-rhythm app built as a pnpm + Turbo monorepo:

- `apps/api` — Express + TypeScript REST API (PostgreSQL via Prisma)
- `apps/web` — Nuxt 3 + Vue 3 SPA (Pinia state, Tailwind)
- `apps/landing` — Vue 3 + Vite marketing page
- `packages/shared` — Shared types, device fingerprinting, circadian utilities
- `packages/ui` — Accessible Vue 3 component library (Storybook)
- `packages/config` — ESLint/Prettier/TS/Tailwind shared configs

## Commands

All commands run from the repo root unless noted.

### Development

```bash
pnpm dev          # all apps in parallel
pnpm dev:api      # API only (port 3001)
pnpm dev:web      # Nuxt web only
pnpm dev:landing  # Landing only
```

### Build / Type check / Lint

```bash
pnpm build        # all apps
pnpm type-check   # all apps
pnpm lint         # ESLint across all packages
pnpm format       # Prettier across all packages
```

### Testing

```bash
pnpm test                    # all tests
pnpm test:watch              # watch mode
pnpm test:coverage           # with v8 coverage (95% thresholds in API)

# Run a single test file (from app dir):
cd apps/api && pnpm vitest run src/modules/auth/auth.service.test.ts
cd apps/web && pnpm vitest run tests/components/TaskCard.test.ts
```

### Database

```bash
pnpm db:generate  # regenerate Prisma client after schema changes
pnpm db:migrate   # run dev migrations
pnpm db:deploy    # apply migrations in CI/production
pnpm db:seed      # seed with sample data
pnpm db:reset     # drop and re-migrate (dev only)
pnpm db:studio    # open Prisma Studio
```

### Docker (PostgreSQL)

```bash
pnpm docker:up    # start PostgreSQL 16 on port 5433
pnpm docker:down  # stop
pnpm setup        # docker:up + db:migrate + db:seed (first-time setup)
```

## Architecture

### API (`apps/api/src/`)

Modules under `src/modules/` follow a consistent pattern: `*.controller.ts` → `*.service.ts` → Prisma client.

Modules: `auth`, `users`, `activities`, `sessions`, `devices`, `circadian`

- Auth: JWT access + refresh token flow with family-based token rotation. Device fingerprinting via HMAC (using `@ritmo/shared`). Sessions include device type/OS/browser metadata.
- Security: Helmet + CORS + rate limiting (100 req / 15 min per IP). Audit trail in `SecurityLog` model (70+ event types).
- Entry point: `src/server.ts`

### Web (`apps/web/`)

Nuxt 3 app. Key locations:

- `stores/` — Pinia stores: `auth`, `activities`, `projects`, `timer`
- `composables/` — `useAuth`, `useCircadian`, `useTokenManager`, `useCalendar`, `useTasksComposable`
- `components/atoms/`, `molecules/`, `organisms/` — atomic design structure
- Axios interceptors handle token refresh automatically before 401 retries.

### Shared package (`packages/shared/`)

Exports used by both API and web:

- `deviceFingerprint` — HMAC-based device ID generation
- `phaseClock` — circadian phase calculations (8 phases: slow activation → sleep preparation)
- Common TypeScript types: `User`, `AuthUser`, `ApiResponse`, `PaginatedResponse`

### Database schema highlights

- `CircadianPhase` / `CircadianPhasePreference` / `CircadianPhaseSession` — core domain models
- `UserSession` + `RefreshToken` — device-aware session management
- `SecurityLog` — comprehensive audit log
- PostgreSQL extensions: `pg_trgm` (text search), `pgcrypto`

## Key Configuration

- **Turbo** caches build/test/lint by input hashes. Global env vars tracked: `NODE_ENV`, `DATABASE_URL`, `JWT_SECRET`, `PORT`.
- **ESLint 9 flat config**. Complexity limits: cyclomatic ≤ 10, file ≤ 300 lines, function ≤ 50 lines.
- **API test environment**: requires a real PostgreSQL connection (no DB mocking). Test DB is configured in `apps/api/env.test`.
- **Vitest** in API runs with `pool: forks` (single fork) and 30 s timeout.
- **Changesets** (`.changeset/`) manage versioning across packages.
- **Husky + lint-staged** (`.husky/`, `.lintstagedrc.json`) run on pre-commit.
