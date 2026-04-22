# CI/CD Professional Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the duplicated, incomplete GitHub Actions pipeline with a professional CI/CD setup using a composite action, SonarCloud Quality Gate, real Postgres integration tests, Turbo cache, and structured CD stubs.

**Architecture:** A composite action at `.github/actions/setup/action.yml` eliminates ~50 lines of duplicated pnpm setup across all jobs. The main `ci.yml` orchestrates four jobs (code-quality → test → build → security). `sonar.yml` triggers via `workflow_run` after `ci.yml` completes, downloading coverage artifacts and running SonarCloud analysis. `release.yml` is a fully-wired placeholder with TODO stubs for API and web deployment.

**Tech Stack:** GitHub Actions, Turborepo 2.x, pnpm 9.15.0, Vitest + @vitest/coverage-v8, SonarCloud (sonarsource/sonarcloud-github-action), Node 20, PostgreSQL 16 (service container)

---

## File Map

| File | Action | Responsibility |

|---|---|---|
| `.github/actions/setup/action.yml` | CREATE | Composite action: Node + pnpm + deps install with cache |
| `.github/workflows/ci.yml` | REWRITE | Main pipeline: quality → test → build → security |
| `.github/workflows/sonar.yml` | CREATE | SonarCloud analysis triggered after ci.yml completes |
| `.github/workflows/release.yml` | CREATE | Structured CD placeholder for main pushes |
| `.github/workflows/metrics.yml` | MODIFY | Remove duplicate build; keep security audit only |
| `sonar-project.properties` | CREATE | SonarCloud project config pointing to LCOV reports |
| `apps/web/vitest.config.ts` | MODIFY | Add `lcov` to coverage reporters (required by SonarCloud) |

---

## Task 1: Create Composite Action

**Files:**

- Create: `.github/actions/setup/action.yml`

This action is the foundation. All subsequent CI jobs call it via `uses: ./.github/actions/setup` instead of repeating 20+ lines of setup.

- [ ] **Step 1: Create the directory and action file**

```bash
mkdir -p .github/actions/setup
```

Create `.github/actions/setup/action.yml` with this exact content:

```yaml
name: Setup Node.js and pnpm
description: Install Node.js, pnpm, and project dependencies with caching

inputs:
  node-version:
    description: Node.js version to use
    default: '20'
  pnpm-version:
    description: pnpm version to use
    default: '9.15.0'

runs:
  using: composite
  steps:
    - name: Setup pnpm
      uses: pnpm/action-setup@v4
      with:
        version: ${{ inputs.pnpm-version }}

    - name: Setup Node.js with pnpm cache
      uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
        cache: pnpm

    - name: Install dependencies
      shell: bash
      run: pnpm install --frozen-lockfile
```

- [ ] **Step 2: Validate YAML syntax**

```bash
node -e "
const fs = require('fs');
const yaml = require('./.github/actions/setup/action.yml');
" 2>&1 || node -e "require('js-yaml').load(require('fs').readFileSync('.github/actions/setup/action.yml','utf8')); console.log('YAML valid')" 2>/dev/null || python3 -c "import yaml; yaml.safe_load(open('.github/actions/setup/action.yml')); print('YAML valid')"
```

If none of those work, just verify no tabs are used and indentation is consistent:

```bash
grep -Pn "\t" .github/actions/setup/action.yml && echo "ERROR: tabs found" || echo "No tabs — OK"
```

Expected: `No tabs — OK`

- [ ] **Step 3: Commit**

```bash
git add .github/actions/setup/action.yml
git commit -m "ci: add composite action for Node.js and pnpm setup"
```

---

## Task 2: Add lcov Reporter to Web Vitest Config

**Files:**

- Modify: `apps/web/vitest.config.ts`

SonarCloud requires LCOV format for coverage. The API already outputs `lcov` but the web app only outputs `text`, `json`, `html`. Without this change, SonarCloud will not have web coverage data.

- [ ] **Step 1: Open `apps/web/vitest.config.ts` and find the coverage reporters array**

Current state (around line 12):

```typescript
reporter: ['text', 'json', 'html'],
```

- [ ] **Step 2: Add `lcov` to the reporters list**

Replace:

```typescript
reporter: ['text', 'json', 'html'],
```

With:

```typescript
reporter: ['text', 'json', 'html', 'lcov'],
```

- [ ] **Step 3: Verify the change looks correct**

```bash
grep -n "reporter" apps/web/vitest.config.ts
```

Expected output:

```
12:      reporter: ['text', 'json', 'html', 'lcov'],
```

- [ ] **Step 4: Run web tests to confirm lcov output generates**

```bash
pnpm --filter=@ritmo/web test:coverage
```

Expected: Tests pass AND `apps/web/coverage/lcov.info` exists:

```bash
ls -la apps/web/coverage/lcov.info
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/vitest.config.ts
git commit -m "test(web): add lcov coverage reporter for SonarCloud integration"
```

---

## Task 3: Rewrite ci.yml

**Files:**

- Modify: `.github/workflows/ci.yml` (full rewrite)

This is the main pipeline. It replaces the existing file which duplicates pnpm setup in every job and has a broken deploy stub. The new file uses the composite action from Task 1 and adds a real Postgres service container for API integration tests.

- [ ] **Step 1: Replace the entire contents of `.github/workflows/ci.yml`**

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  workflow_dispatch:

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read
  checks: write
  pull-requests: write

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '9.15.0'

jobs:
  code-quality:
    name: Code Quality
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup environment
        uses: ./.github/actions/setup
        with:
          node-version: ${{ env.NODE_VERSION }}
          pnpm-version: ${{ env.PNPM_VERSION }}

      - name: Type check
        run: pnpm type-check

      - name: Lint
        run: pnpm lint

      - name: Format check
        run: pnpm format --check

  test:
    name: Test Suite
    runs-on: ubuntu-latest
    needs: code-quality
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: ritmo_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    env:
      DATABASE_URL: postgresql://test:test@localhost:5432/ritmo_test
      JWT_SECRET: ${{ secrets.JWT_SECRET }}
      NODE_ENV: test
      CI: true
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup environment
        uses: ./.github/actions/setup
        with:
          node-version: ${{ env.NODE_VERSION }}
          pnpm-version: ${{ env.PNPM_VERSION }}

      - name: Cache Turbo
        uses: actions/cache@v4
        with:
          path: .turbo
          key: turbo-test-${{ runner.os }}-${{ github.sha }}
          restore-keys: turbo-test-${{ runner.os }}-

      - name: Run Prisma migrations
        run: pnpm --filter=@ritmo/api db:deploy

      - name: Run tests with coverage
        run: pnpm test:coverage
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
          TURBO_TEAM: ${{ secrets.TURBO_TEAM }}

      - name: Upload coverage reports
        uses: actions/upload-artifact@v4
        with:
          name: coverage-reports
          path: |
            apps/api/coverage/lcov.info
            apps/web/coverage/lcov.info
          retention-days: 1
          if-no-files-found: warn

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [code-quality, test]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup environment
        uses: ./.github/actions/setup
        with:
          node-version: ${{ env.NODE_VERSION }}
          pnpm-version: ${{ env.PNPM_VERSION }}

      - name: Cache Turbo
        uses: actions/cache@v4
        with:
          path: .turbo
          key: turbo-build-${{ runner.os }}-${{ github.sha }}
          restore-keys: turbo-build-${{ runner.os }}-

      - name: Build all packages
        run: pnpm build
        env:
          NODE_ENV: production
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
          TURBO_TEAM: ${{ secrets.TURBO_TEAM }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-artifacts
          path: |
            apps/*/dist
            packages/*/dist
            apps/*/.output
          retention-days: 7
          if-no-files-found: warn

  security:
    name: Security Audit
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup environment
        uses: ./.github/actions/setup
        with:
          node-version: ${{ env.NODE_VERSION }}
          pnpm-version: ${{ env.PNPM_VERSION }}

      - name: Run security audit
        run: pnpm audit --audit-level=high
```

- [ ] **Step 2: Verify no tabs in the file**

```bash
grep -Pn "\t" .github/workflows/ci.yml && echo "ERROR: tabs found" || echo "No tabs — OK"
```

Expected: `No tabs — OK`

- [ ] **Step 3: Verify the file has the 4 expected job names**

```bash
grep -E "^  [a-z-]+:" .github/workflows/ci.yml
```

Expected output:

```
  code-quality:
  test:
  build:
  security:
```

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: rewrite ci.yml using composite action, add Postgres service and Turbo cache"
```

---

## Task 4: Create sonar-project.properties

**Files:**

- Create: `sonar-project.properties` (at repo root)

This file tells SonarCloud where sources are, what to exclude, and where to find coverage reports. The `sonar.organization` value must be replaced with your actual SonarCloud organization slug (found at sonarcloud.io → your org → Administration).

- [ ] **Step 1: Create `sonar-project.properties` at the repo root**

```properties
# SonarCloud Project Configuration
# See: https://docs.sonarcloud.io/advanced-setup/analysis-parameters/

sonar.projectKey=ritmo-app
sonar.projectName=Ritmo
# TODO: replace with your actual SonarCloud organization slug
sonar.organization=YOUR_ORG_SLUG_HERE

# Source directories
sonar.sources=apps/api/src,apps/web,apps/landing/src,packages/shared/src,packages/ui/src,packages/config

# Exclusions — generated, test, and config files
sonar.exclusions=\
  **/node_modules/**,\
  **/dist/**,\
  **/.nuxt/**,\
  **/.output/**,\
  **/coverage/**,\
  **/prisma/migrations/**,\
  **/*.spec.ts,\
  **/*.test.ts,\
  **/*.stories.ts,\
  **/*.config.ts,\
  **/*.config.js,\
  **/storybook-static/**

# Test file patterns
sonar.tests=apps/api/tests,apps/web/tests,apps/landing/src
sonar.test.inclusions=**/*.spec.ts,**/*.test.ts

# Coverage — LCOV format from Vitest
sonar.javascript.lcov.reportPaths=\
  apps/api/coverage/lcov.info,\
  apps/web/coverage/lcov.info

# TypeScript
sonar.typescript.tsconfigPath=tsconfig.json

# Encoding
sonar.sourceEncoding=UTF-8
```

- [ ] **Step 2: Verify the file has no trailing whitespace issues**

```bash
grep -Pn " $" sonar-project.properties && echo "Trailing spaces found" || echo "No trailing spaces — OK"
```

Expected: `No trailing spaces — OK`

- [ ] **Step 3: Commit**

```bash
git add sonar-project.properties
git commit -m "ci: add sonar-project.properties for SonarCloud analysis"
```

---

## Task 5: Create sonar.yml

**Files:**

- Create: `.github/workflows/sonar.yml`

This workflow uses `workflow_run` to trigger after `ci.yml` finishes (not in parallel). This guarantees coverage artifacts are available before Sonar analyzes. The `actions: read` permission is required to download artifacts from a different workflow run.

- [ ] **Step 1: Create `.github/workflows/sonar.yml`**

```yaml
name: SonarCloud Analysis

on:
  workflow_run:
    workflows: ['CI/CD Pipeline']
    types: [completed]

permissions:
  contents: read
  checks: write
  pull-requests: write
  actions: read

jobs:
  sonar:
    name: SonarCloud Code Analysis
    runs-on: ubuntu-latest
    if: github.event.workflow_run.conclusion == 'success'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Download coverage reports
        uses: actions/download-artifact@v4
        with:
          name: coverage-reports
          run-id: ${{ github.event.workflow_run.id }}
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: SonarCloud Scan
        uses: sonarsource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

- [ ] **Step 2: Verify `workflows` name matches exactly the `name:` in ci.yml**

```bash
grep "^name:" .github/workflows/ci.yml
grep "workflows:" .github/workflows/sonar.yml
```

Expected:

```
name: CI/CD Pipeline
    workflows: ['CI/CD Pipeline']
```

The strings must match exactly (case-sensitive).

- [ ] **Step 3: Verify no tabs in the file**

```bash
grep -Pn "\t" .github/workflows/sonar.yml && echo "ERROR: tabs found" || echo "No tabs — OK"
```

Expected: `No tabs — OK`

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/sonar.yml
git commit -m "ci: add sonar.yml for SonarCloud analysis triggered after ci.yml"
```

---

## Task 6: Create release.yml

**Files:**

- Create: `.github/workflows/release.yml`

This workflow only runs on pushes to `main`. Each deploy job has working wiring (`needs:`, `environment: production`) but the actual deploy command is a commented-out stub with three options per service. When you choose a deploy platform, uncomment one option and add the corresponding secret.

- [ ] **Step 1: Create `.github/workflows/release.yml`**

```yaml
name: Release

on:
  push:
    branches: [main]

permissions:
  contents: read

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '9.15.0'

jobs:
  prepare-release:
    name: Prepare Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup environment
        uses: ./.github/actions/setup
        with:
          node-version: ${{ env.NODE_VERSION }}
          pnpm-version: ${{ env.PNPM_VERSION }}

      - name: Build for production
        run: pnpm build
        env:
          NODE_ENV: production

      - name: Upload release artifacts
        uses: actions/upload-artifact@v4
        with:
          name: release-artifacts
          path: |
            apps/*/dist
            packages/*/dist
            apps/*/.output
          retention-days: 1

  deploy-api:
    name: Deploy API
    runs-on: ubuntu-latest
    needs: prepare-release
    environment: production
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Download release artifacts
        uses: actions/download-artifact@v4
        with:
          name: release-artifacts

      # ── Deploy Strategy (uncomment ONE) ──────────────────────────────────
      #
      # Option A: Fly.io
      #   Required secret: FLY_API_TOKEN
      # - uses: superfly/flyctl-actions/setup-flyctl@master
      # - run: flyctl deploy --remote-only --config apps/api/fly.toml
      #   env:
      #     FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
      #
      # Option B: Railway
      #   Required secret: RAILWAY_DEPLOY_HOOK (webhook URL from Railway dashboard)
      # - name: Trigger Railway deploy
      #   run: curl -X POST "${{ secrets.RAILWAY_DEPLOY_HOOK }}"
      #
      # Option C: Docker + SSH to VPS
      #   Required secrets: GHCR_TOKEN, DEPLOY_HOST, DEPLOY_USER, DEPLOY_SSH_KEY
      # - name: Build and push Docker image
      #   run: |
      #     echo "${{ secrets.GHCR_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
      #     docker build -t ghcr.io/${{ github.repository }}/api:${{ github.sha }} apps/api
      #     docker push ghcr.io/${{ github.repository }}/api:${{ github.sha }}
      # - name: Deploy via SSH
      #   uses: appleboy/ssh-action@master
      #   with:
      #     host: ${{ secrets.DEPLOY_HOST }}
      #     username: ${{ secrets.DEPLOY_USER }}
      #     key: ${{ secrets.DEPLOY_SSH_KEY }}
      #     script: |
      #       docker pull ghcr.io/${{ github.repository }}/api:${{ github.sha }}
      #       docker compose -f /srv/ritmo/docker-compose.yml up -d api
      # ─────────────────────────────────────────────────────────────────────

      - name: Deploy placeholder
        run: echo "API deploy not configured. Uncomment a strategy above and add required secrets."

  deploy-web:
    name: Deploy Web
    runs-on: ubuntu-latest
    needs: prepare-release
    environment: production
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      # ── Deploy Strategy (uncomment ONE) ──────────────────────────────────
      #
      # Option A: Vercel (recommended for Nuxt)
      #   Required secret: VERCEL_DEPLOY_HOOK (from Vercel project settings → Git)
      # - name: Trigger Vercel deploy
      #   run: curl -X POST "${{ secrets.VERCEL_DEPLOY_HOOK }}"
      #
      # Option B: Netlify
      #   Required secret: NETLIFY_BUILD_HOOK
      # - name: Trigger Netlify build
      #   run: curl -X POST "${{ secrets.NETLIFY_BUILD_HOOK }}"
      #
      # Option C: Self-hosted via SSH
      #   Required secrets: DEPLOY_HOST, DEPLOY_USER, DEPLOY_SSH_KEY
      # - name: Deploy via SSH
      #   uses: appleboy/ssh-action@master
      #   with:
      #     host: ${{ secrets.DEPLOY_HOST }}
      #     username: ${{ secrets.DEPLOY_USER }}
      #     key: ${{ secrets.DEPLOY_SSH_KEY }}
      #     script: |
      #       cd /srv/ritmo-web && git pull && pnpm build && pm2 restart ritmo-web
      # ─────────────────────────────────────────────────────────────────────

      - name: Deploy placeholder
        run: echo "Web deploy not configured. Uncomment a strategy above and add required secrets."

  notify:
    name: Release Notification
    runs-on: ubuntu-latest
    needs: [deploy-api, deploy-web]
    if: always()
    steps:
      # ── Notification Strategy (uncomment ONE) ────────────────────────────
      #
      # Option A: Slack
      #   Required secret: SLACK_WEBHOOK_URL
      # - name: Notify Slack
      #   uses: slackapi/slack-github-action@v1
      #   with:
      #     payload: |
      #       {
      #         "text": "Release ${{ github.sha }} — API: ${{ needs.deploy-api.result }}, Web: ${{ needs.deploy-web.result }}"
      #       }
      #   env:
      #     SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
      #
      # Option B: Discord
      #   Required secret: DISCORD_WEBHOOK
      # - name: Notify Discord
      #   run: |
      #     curl -X POST "${{ secrets.DISCORD_WEBHOOK }}" \
      #       -H "Content-Type: application/json" \
      #       -d "{\"content\": \"Release ${{ github.sha }} deployed — API: ${{ needs.deploy-api.result }}, Web: ${{ needs.deploy-web.result }}\"}"
      # ─────────────────────────────────────────────────────────────────────

      - name: Notify placeholder
        run: echo "Release notification not configured. Uncomment a strategy above."
```

- [ ] **Step 2: Verify no tabs in the file**

```bash
grep -Pn "\t" .github/workflows/release.yml && echo "ERROR: tabs found" || echo "No tabs — OK"
```

Expected: `No tabs — OK`

- [ ] **Step 3: Verify the 4 expected job names exist**

```bash
grep -E "^  [a-z-]+:" .github/workflows/release.yml
```

Expected:

```
  prepare-release:
  deploy-api:
  deploy-web:
  notify:
```

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "ci: add structured release.yml with wired deploy stubs for API and web"
```

---

## Task 7: Update metrics.yml

**Files:**

- Modify: `.github/workflows/metrics.yml`

The current file rebuilds the entire project weekly, duplicating the CI pipeline. The new version only runs a security audit and uploads the report as an artifact, using the composite action to avoid duplicating setup.

- [ ] **Step 1: Replace the entire contents of `.github/workflows/metrics.yml`**

```yaml
name: Metrics & Monitoring

on:
  schedule:
    - cron: '0 0 * * 1'
  workflow_dispatch:

permissions:
  contents: read

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '9.15.0'

jobs:
  security-report:
    name: Weekly Security Report
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup environment
        uses: ./.github/actions/setup
        with:
          node-version: ${{ env.NODE_VERSION }}
          pnpm-version: ${{ env.PNPM_VERSION }}

      - name: Generate security audit report
        run: pnpm audit --audit-level moderate --json > security-report.json || true

      - name: Upload security report
        uses: actions/upload-artifact@v4
        with:
          name: security-report-${{ github.run_number }}
          path: security-report.json
          retention-days: 30
```

- [ ] **Step 2: Verify no tabs and correct structure**

```bash
grep -Pn "\t" .github/workflows/metrics.yml && echo "ERROR: tabs found" || echo "No tabs — OK"
grep "^  security-report:" .github/workflows/metrics.yml && echo "Job found" || echo "ERROR: job not found"
```

Expected:

```
No tabs — OK
Job found
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/metrics.yml
git commit -m "ci: simplify metrics.yml to weekly security audit only, remove duplicate build"
```

---

## Task 8: Manual Setup in SonarCloud and GitHub (one-time, no code)

These steps are done in the browser, not in code. They cannot be automated.

- [ ] **Step 1: Create SonarCloud project**
  1. Go to [sonarcloud.io](https://sonarcloud.io) and sign in with GitHub
  2. Click **+** → **Analyze new project** → select `RaulAltamirano/ritmo`
  3. Choose **GitHub Actions** as the analysis method
  4. Copy the `SONAR_TOKEN` value shown

- [ ] **Step 2: Update sonar-project.properties with real org slug**

  In `sonar-project.properties`, replace `YOUR_ORG_SLUG_HERE` with the actual organization slug shown in SonarCloud (visible in the URL: `sonarcloud.io/organizations/<slug>`).

  ```bash
  # After editing, verify the line looks like:
  grep "sonar.organization=" sonar-project.properties
  # Expected: sonar.organization=your-actual-slug
  ```

  Commit the updated file:

  ```bash
  git add sonar-project.properties
  git commit -m "ci: set SonarCloud organization slug"
  ```

- [ ] **Step 3: Add GitHub Secrets**

  Go to your repository → Settings → Secrets and variables → Actions → **New repository secret** for each:

  | Name           | Value                                                   |
  | -------------- | ------------------------------------------------------- |
  | `SONAR_TOKEN`  | Token copied from SonarCloud in Step 1                  |
  | `DATABASE_URL` | `postgresql://test:test@localhost:5432/ritmo_test`      |
  | `JWT_SECRET`   | Any secure random string (e.g., `openssl rand -hex 32`) |

  Optional (for Turbo remote cache):
  | `TURBO_TOKEN` | Token from vercel.com/account/tokens |
  | `TURBO_TEAM` | Your Vercel team slug |

- [ ] **Step 4: Configure SonarCloud Quality Gate**

  In SonarCloud: your project → **Administration** → **Quality Gate** → select or create a gate with:
  - Coverage on new code ≥ 70%
  - New bugs = 0
  - New vulnerabilities = 0

  Then enable: **Administration** → **Analysis Method** → **Automatic Analysis**: OFF (we use GitHub Actions)

- [ ] **Step 5: Configure GitHub Branch Protection**

  Go to repository → Settings → Branches → **Add rule** for `main` and `develop`:
  - ✅ Require status checks to pass before merging
  - Add: `Code Quality`, `Test Suite`, `Build`, `Security Audit`, `SonarCloud Code Analysis`
  - ✅ Require branches to be up to date before merging

---

## Spec Coverage Self-Review

| Spec Requirement                       | Task                                            |
| -------------------------------------- | ----------------------------------------------- |
| No duplicated setup blocks             | Task 1 (composite action), Tasks 3/5/6/7 use it |
| SonarCloud on every PR/push            | Task 5 (sonar.yml via workflow_run)             |
| Quality Gate blocks PRs                | Task 8 (GitHub Branch Protection)               |
| Integration tests with real Postgres   | Task 3 (ci.yml services block)                  |
| Coverage uploaded to SonarCloud        | Tasks 2+3 (lcov reporter + artifact upload)     |
| Turbo cache in CI                      | Task 3 (ci.yml build job, .turbo cache)         |
| release.yml structured and wired       | Task 6                                          |
| metrics.yml no longer duplicates build | Task 7                                          |
| sonar-project.properties               | Task 4                                          |
