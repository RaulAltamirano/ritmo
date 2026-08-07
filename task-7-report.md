# Task 7 Report

## 2026-08-06 review fixes

- Expanded case-insensitive public auth URL exclusions to cover password reset, email verification, resend verification, forgot-password, and device-challenge routes.
- Extracted `createAuthAwareFetch` so refresh, retry, and definitive-auth-failure behavior can be tested independently of Nuxt.
- Merged `Request.headers` with option headers for skip-refresh and idempotency checks and retry construction.
- Kept non-idempotent request bodies from being replayed after a successful refresh.

Verification:

- `pnpm vitest run apps/web/tests/utils/authFetchRetry.test.ts apps/web/tests/utils/authAwareFetch.test.ts` — 24 tests passed.
- Prettier check passed for all modified implementation and test files.
- Web type-check remains blocked by pre-existing repository errors; the plugin-specific option type error found during verification was corrected.
