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

## Finding: Idempotent POST as Request reuses consumed body on retry

**Severity:** Medium

**Issue:** When `authAwareFetch` receives a `Request` with a body, the first `baseFetch` call consumes the body stream. On 401 refresh retry, reusing the same `Request` throws `TypeError: Body has already been consumed`.

**Fix:** Clone the `Request` before the initial fetch (`requestForRetry = request.clone()`). Use the original for the first call and the clone for retry so the body remains readable.

**Files changed:**
- `apps/web/utils/authAwareFetch.ts` — clone Request upfront, retry with clone
- `apps/web/tests/utils/authAwareFetch.test.ts` — test idempotent POST Request with body survives 401 → refresh → retry

**Verification:** `pnpm vitest run tests/utils/authAwareFetch.test.ts` — 7 tests passed.
