# Circadian Phase Inline Strip

**Date:** 2026-04-20  
**Status:** Approved

## Goal

Replace `CircadianPhaseCard.vue` (card container with border, padding, stats grid, and "Ideal para" section) with a borderless inline strip that integrates into `TodayHeader` as part of the page flow rather than as a widget.

## What Gets Shown

- Phase emoji + name (left) and progress percentage (right) on one row
- Phase description in 1–2 lines below (text-sm, clamped)
- A single thin progress bar (h-0.5) — the only place the phase color appears

## What Gets Removed

- The card container (`bg-white rounded-xl border` wrapper with `p-5`)
- The top accent bar (`h-0.5 absolute`)
- The status badge ("Activo" / "Cargando" / "Error")
- The two-cell stats grid (current time + time until next)
- The "Ideal para" tinted section

## Layout

```
[ emoji ] [ Phase Name ]                    [ 73% ]
  Brief description of what this phase means, clamped
  to two lines of text-sm text-gray-500.
[████████████████████████████░░░░░░░░░░░░]
```

- Row 1: `flex items-center justify-between` — emoji + name left, `XX%` tabular-nums right
- Row 2: description `text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5`
- Row 3: progress track `w-full h-0.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-3`, fill with `currentPhase.color`
- No padding of its own — inherits wrapper spacing from `TodayHeader`

## States

**Loading:** Name and description replaced by skeleton bars (`animate-pulse bg-gray-100 dark:bg-gray-800`). Progress bar also skeleton.

**Error:** Single line `text-sm text-gray-400` message + inline "Reintentar" text button. No alert icons.

**No data (null + not loading):** renders nothing (`v-if` guard at root).

## Files Changed

| File                                                   | Change                       |
| ------------------------------------------------------ | ---------------------------- |
| `apps/web/components/molecules/CircadianPhaseCard.vue` | Full rewrite to inline strip |

`TodayHeader.vue` and `useCircadian.ts` require no changes — the component slot stays the same and the composable API is unchanged.

## Composable Fields Used

From `useCircadian()`:

- `currentPhase.name`, `currentPhase.emoji`, `currentPhase.description`, `currentPhase.color`
- `phaseProgress` (0–1)
- `isLoading`, `error`, `fetchCurrentPhase`

Fields no longer consumed: `timeUntilNextFormatted`, `currentPhase.idealFor`.
