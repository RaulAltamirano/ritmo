# Whole-branch important findings fix

Status: complete

## Fixed

- Program selection now maps every level and 3–6 day combination to a seeded template.
- Regenerating an applied week preserves `applied`, so applying it again cannot advance the block twice.
- Catalog substitutions reject equipment unavailable to the selected equipment profile.
- Training chat and week generation are limited to 20 requests per hour per authenticated user, with IP fallback.
- Exercise log saves are serialized per day and exercise, and failures populate the training store error.
- The generation modal loads the existing profile on open and enables preview immediately for complete, non-stop profiles.
- Profile upserts reject invalid day counts, session durations, levels, equipment profiles, and goals.

## Verification

- API training tests: 56 passed.
- Requested web tests: 15 passed.
- Scoped lint diagnostics: clean.
- API type-check remains blocked by the pre-existing `src/core/utils/jwtUtils.ts:41` error.
- Web type-check remains blocked by pre-existing errors outside the changed training files.

## Remaining known issues

- Repository-wide API and web type-check failures outside this fix remain unresolved.
- Web tests emit the existing stale `caniuse-lite` warning.
