# CI/CD Professional Design — Ritmo Monorepo

**Date:** 2026-04-19
**Status:** Approved
**Scope:** GitHub Actions CI/CD pipeline with SonarCloud integration for the Ritmo Turborepo monorepo

---

## Context

Ritmo is a Turborepo monorepo (pnpm workspaces) with three apps and three shared packages:

- `apps/api` — Express + TypeScript + Prisma + PostgreSQL
- `apps/web` — Nuxt 3 + Vue 3
- `apps/landing` — Vite + Vue 3
- `packages/config`, `packages/shared`, `packages/ui`

**Branch model:** Gitflow — `main` (production) + `develop` (integration) + feature branches.

**Existing CI problems being solved:**

- Every job duplicates ~50 lines of pnpm setup (no reuse)
- No SonarCloud/SonarQube integration
- No integration tests against a real Postgres instance
- No Turbo cache in CI
- Deploy job is an empty `echo` stub
- Lighthouse CI command is broken
- `metrics.yml` duplicates full build pipeline

---

## Architecture

### Files Created / Modified

```
.github/
  actions/
    setup/
      action.yml          ← Composite action: Node + pnpm + cache (NEW)
  workflows/
    ci.yml                ← Main pipeline (REWRITTEN)
    sonar.yml             ← SonarCloud analysis + Quality Gate (NEW)
    release.yml           ← Structured CD placeholder (NEW)
    metrics.yml           ← Cleaned up, no longer rebuilds everything (MODIFIED)

sonar-project.properties  ← SonarCloud project config (NEW)
```

---

## Composite Action — `.github/actions/setup/action.yml`

Eliminates duplicated setup in every job. Inputs: `node-version` (default `20`), `pnpm-version` (default `9.15.0`).

Steps:

1. `pnpm/action-setup@v4` — installs pnpm at the specified version
2. `actions/setup-node@v4` with `cache: 'pnpm'` — installs Node and enables pnpm store caching automatically
3. `pnpm install --frozen-lockfile` — install deps from lockfile

Every job replaces its 20-line setup block with a single `uses: ./.github/actions/setup` step.

---

## Main Pipeline — `.github/workflows/ci.yml`

### Triggers

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  workflow_dispatch:
```

### Concurrency

Cancels redundant runs on the same branch/PR:

```yaml
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

### Permissions

Minimal permissions declared at workflow level:

```yaml
permissions:
  contents: read
  checks: write
  pull-requests: write
```

### Jobs and Dependencies

```
code-quality ──────────────────────────── test ──── build ──── security
(lint, type-check, format)                 │
                                           ├─ unit tests (all packages, vitest)
                                           └─ integration tests (API only)
                                                └─ services: postgres:16-alpine
```

**code-quality:**

- `pnpm type-check` (via turbo)
- `pnpm lint` (via turbo)
- `pnpm format --check` (via turbo)

**test** (needs: code-quality):

- Unit tests: `pnpm test:coverage` via Turbo (all packages)
- Integration tests (API): same job, uses GitHub Actions `services:` block for Postgres — no docker-compose needed in CI
- Uploads LCOV coverage reports as artifact `coverage-reports` (used by `sonar.yml`)
- Env vars sourced from GitHub Secrets: `DATABASE_URL`, `JWT_SECRET`

**build** (needs: [code-quality, test]):

- `pnpm build` via Turbo
- Uploads build artifacts: `apps/*/dist`, `apps/*/.output`
- Retention: 7 days

**security** (needs: build):

- `pnpm audit --audit-level=high`
- Runs independently of performance/deploy, but depends on build to ensure package tree is fully resolved

### Turbo Cache in CI

If `TURBO_TOKEN` and `TURBO_TEAM` secrets are present (Vercel Remote Cache), Turbo automatically uses remote caching. If absent, falls back to local Turbo cache with `actions/cache@v4` on `.turbo/` directory.

---

## SonarCloud Workflow — `.github/workflows/sonar.yml`

### Triggers

Same as `ci.yml` (push to main/develop, PRs to main/develop).

### Flow

1. Downloads `coverage-reports` artifact uploaded by `ci.yml`'s test job
2. Runs `sonarsource/sonarcloud-github-action@master`
3. Reads config from `sonar-project.properties`
4. Quality Gate result is checked — workflow fails if gate fails, **blocking the PR**

### Blocking PRs

Configured via:

- SonarCloud UI: Administration → Quality Gate → "Fail new code" enabled
- GitHub: Branch Protection Rules → Required status checks → `SonarCloud Code Analysis`

---

## SonarCloud Config — `sonar-project.properties`

```properties
sonar.projectKey=ritmo-app
sonar.organization=<org-slug-in-sonarcloud>

sonar.sources=apps/api/src,apps/web,apps/landing/src,packages
sonar.exclusions=**/node_modules/**,**/dist/**,**/.nuxt/**,**/.output/**,**/coverage/**,**/prisma/migrations/**,**/*.spec.ts,**/*.test.ts,**/*.config.ts,**/*.config.js

sonar.javascript.lcov.reportPaths=apps/api/coverage/lcov.info,apps/web/coverage/lcov.info

sonar.typescript.tsconfigPath=tsconfig.json
```

---

## Quality Gate Thresholds (configured in SonarCloud UI)

| Metric                         | Threshold |
| ------------------------------ | --------- |
| Coverage on new code           | ≥ 70%     |
| Duplicated lines on new code   | ≤ 3%      |
| New bugs                       | 0         |
| New vulnerabilities            | 0         |
| New security hotspots reviewed | 100%      |
| New code smells                | ≤ 10      |

---

## Release Workflow — `.github/workflows/release.yml`

Triggered only on `push` to `main`. Structured placeholder with clear TODO markers for each deployment target.

Jobs:

- `prepare-release` — verifies build artifacts exist
- `deploy-api` — stub: Docker build + push to registry, then deploy (Fly.io / Railway / AWS ECS)
- `deploy-web` — stub: trigger Vercel/Netlify deploy hook, or SSH + docker compose
- `notify` — stub: Slack/Discord/email notification on success or failure

Each stub job is fully wired (correct `needs:`, `environment: production`, `if:` conditions) so connecting a real deploy is a one-step edit per job.

---

## Metrics Workflow — `.github/workflows/metrics.yml` (cleanup)

Simplified: no longer rebuilds the full project. Downloads the weekly build artifact from the last successful `ci.yml` run instead. Only runs the security audit and coverage report upload.

---

## Required GitHub Secrets

| Secret         | Purpose                                                |
| -------------- | ------------------------------------------------------ |
| `SONAR_TOKEN`  | SonarCloud authentication (generated at sonarcloud.io) |
| `DATABASE_URL` | Postgres connection string for integration tests       |
| `JWT_SECRET`   | JWT secret for API integration tests                   |
| `TURBO_TOKEN`  | Optional: Vercel Remote Cache for Turbo                |
| `TURBO_TEAM`   | Optional: Vercel Remote Cache team slug                |

---

## What This Does NOT Include (by decision)

- Actual deploy commands — deployment target is undefined; stubs are wired and ready
- Lighthouse CI — current config is broken; removed until a working LHCI server is configured
- Docker image build/push for API — included as a stub in `release.yml` but not active
- Dependabot auto-merge — out of scope for this design

---

## Success Criteria

- [ ] No duplicated setup blocks in any workflow job
- [ ] SonarCloud analysis runs on every PR and push to main/develop
- [ ] Quality Gate blocks PRs that fail thresholds
- [ ] Integration tests run against a real Postgres instance in CI
- [ ] Coverage reports are uploaded to SonarCloud
- [ ] Build artifacts are cached and reused between jobs
- [ ] `release.yml` is structured and wired, ready for a real deploy command
- [ ] All workflows pass on the current codebase
