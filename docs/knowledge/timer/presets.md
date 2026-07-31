---
title: Timer presets
lang: en
domain: timer
authority: heuristic
source_of_truth: apps/api/src/modules/users/timerPresets.dto.ts
last_verified: 2026-07-31
---

# Timer presets

Documentary notes for Ritmo’s default focus blocks. Exact durations are **product defaults / heuristics**, not medical prescriptions.

## Runtime cycle

After focus ends, Ritmo runs an executed **break** phase on the same `WorkSession` (`state: on_break`) using `breakDurationSec` from the preset, then opens post-block reflection. Users may skip the break. `breakDurationSec === 0` skips straight to reflection. Break wall time is **not** billable in the day summary (focus ends at `breakStartedAt`).

## Persistence model

- Stored per user as JSON on `UserPreferences.timerPresets` (Zod-validated).
- **Not** a `TimerPreset` database table: lists are small, personal, and each `WorkSession` snapshots `timerMode` / `presetKey` / `targetDurationSec` / `breakDurationSec`.
- API defaults: `apps/api/src/modules/users/timerPresets.dto.ts` (`DEFAULT_TIMER_PRESETS`).
- Web loads via `timerStore.syncTimerPresetsFromApi()`; offline fallback: `apps/web/composables/timer/timerPresets.ts`.

## Default presets

| Key | Work | Break | Label (API) | Typical mode mapping |
| --- | ---: | ---: | --- | --- |
| `25_5` | 25 min | 5 min | Pomodoro clásico | `pomodoro` |
| `52_17` | 52 min | 17 min | Bloque medio | `custom` |
| `90_20` | 90 min | 20 min | Bloque largo | `ultradian` |

Users may edit the list in settings (within schema limits). Changing a preset does **not** rewrite historical sessions.

## Evidence framing (limits)

| Preset idea | What exists | What to claim in product |
| --- | --- | --- |
| Pomodoro (~25/5) | Popular method; some work on breaks and sustained attention | Useful configurable block; **not** a proven universal optimum |
| 52/17 | Largely workplace analytics folklore (e.g. DeskTime-style reports) | Heuristic medium block; weak peer-reviewed basis for exact numbers |
| ~90/20 (ultradian) | Broader literature on ultradian alertness cycles; “90 fixed” is simplified | Long-block option inspired by ultradian ideas; still a **heuristic** |

Ritmo’s stronger scientific spine is **when** to work ([circadian phases](../circadian/phases-research.md)), not the exact minute length of a timer.  
Do not attach efficacy % to preset keys without a source in [`../study/SOURCES.md`](../study/SOURCES.md) or peer-reviewed work.

## Relation to tasks

- A `Task` does not “own” a pomodoro. Starting the timer creates a `WorkSession` with `taskId` + chosen preset.
- Time spent per task = sum of completed/abandoned sessions (billable ≈ wall clock − pauses), not `Task.estimatedDuration`.
