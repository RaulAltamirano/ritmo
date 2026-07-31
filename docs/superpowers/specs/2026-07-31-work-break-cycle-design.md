# Design: Work → break → reflection cycle

**Date:** 2026-07-31  
**Status:** Approved — awaiting final user review of this file  
**Product:** Ritmo web + API (`apps/web`, `apps/api`)

## Problem

Timer presets advertise work/break pairs (`25/5`, `52/17`, `90/20`) and settings persist `breakSec`, but runtime only counts **focus**. After the work countdown ends, the app goes straight to `pending_feedback` / reflection. `WorkSession.breakDurationSec` exists in the API/DB but the client never sends it. Users can confuse manual **Pausar** with the preset **descanso**.

## Goals

1. Real cycle: **focus → break countdown → reflection**.
2. Break is **server-synced** on the same `WorkSession` via new state `on_break`.
3. User may **skip** the break → reflection immediately.
4. Reflection runs **after** the break (or skip), not before.
5. Day summary / billable time **excludes** break duration.
6. Supporting correctness: send `breakDurationSec` on create; wall-clock countdowns; include open-pause span in heartbeat/hydrate.

## Non-goals (v1)

- Long break after N pomodoros.
- Separate `BreakSession` table / child session.
- OS / sound notifications for break (in-app toast is enough).
- Changing reflection fields or `WorkBlockFeedbackModal` payload.
- Auto-start of the next focus block.
- Mid-break task switch (task-switch silent-split remains a separate spec; during break only skip/abandon).

## Product decisions (locked)

| Topic | Choice |
|--------|--------|
| End of focus | Enter break phase (if `breakDurationSec > 0`) |
| Reflection timing | After break (or skip) |
| Skip break | Allowed → `pending_feedback` |
| Sync | Same `WorkSession`, state `on_break` |
| Approach | Extend session state machine (not local-only break) |

## State machine

```text
create → running ⇄ paused
              │
              ▼  (focus elapsed by wall-clock)
           on_break ⇄ (client pause; state stays on_break)
              │
              ├─ break countdown → 0
              └─ “Saltar descanso”
              ▼
        pending_feedback → completed | abandoned
```

| Event | Transition |
|--------|------------|
| Focus ends, `breakDurationSec > 0` | `running` \| `paused` → `on_break` |
| Focus ends, `breakDurationSec === 0` or null treated as 0 | → `pending_feedback` (no break UI) |
| Skip break | `on_break` → `pending_feedback` |
| Break natural end | `on_break` → `pending_feedback` |
| Abandon (focus or break) | → `abandoned` |
| Submit reflection | `pending_feedback` → `completed` |

`on_break` is **non-terminal** (same active-session set as `running` / `paused` / `pending_feedback`).

## Data model & API

### Schema (`WorkSession`)

| Field | Change |
|--------|--------|
| `state` | Add enum value `on_break` |
| `breakDurationSec` | Existing; client **must** send on create from preset (`0` = no break phase) |
| `breakStartedAt` | **New** `DateTime?` — set by server when entering `on_break` |
| `breakPausedDurationSec` | **New** `Int @default(0)` — pauses during break only |

`pausedDurationSec` remains **focus-only** and is frozen when entering `on_break`.

### Create

`POST /work-sessions` body includes:

- `targetDurationSec` (focus)
- `breakDurationSec` (from `TimerMode.breakSec` / preset)
- `timerMode`, `presetKey?` (unchanged)

Client wrapper `createWorkSession` must accept and forward `breakDurationSec`.

### Transitions

| Action | Contract |
|--------|----------|
| Focus finished | `PATCH` `state: 'on_break'` (+ final focus `pausedDurationSec`). Server sets `breakStartedAt = now()`. |
| Heartbeat on break | `PATCH` `state: 'on_break'`, `breakPausedDurationSec` (include open pause span), `lastClientSeenAt` |
| Skip / break finished | `PATCH` `state: 'pending_feedback'` |
| Fail PATCH to `on_break` | Do not open reflection; surface error; avoid local-only break divergence |
| Fail PATCH to `pending_feedback` | Retry / notify; **no empty catch** that assumes success |

### Billable / today summary

Focus billable seconds for a session that reached break:

`max(0, floor((breakStartedAt − startTime) / 1000) − pausedDurationSec)`

If the session never entered break (complete/abandon during focus), keep current wall − focus pauses through `endTime`.

Break wall time must **not** increase study totals.

### Restore (`GET /work-sessions/active`)

If `state === 'on_break'`:

- Hydrate floating timer in **break** UI.
- Remaining = `max(0, breakDurationSec − (now − breakStartedAt − breakPausedDurationSec))` (open pause included when paused).
- Do not show focus countdown.

## UI

### Focus phase

Mostly unchanged: work countdown, En marcha / Pausado, mode label, pause/resume, close → abandon.

### Entering break

No reflection yet. Short in-app toast (e.g. “Descanso · 5 min”). Pill switches to break phase.

### Break phase (`FloatingTimer`)

- Countdown from preset break length.
- Subtitle **“Descanso”** (never bare “Pausa” for this phase).
- Calmer visual treatment (e.g. emerald/teal tokens), distinct from focus critical/warning reds.
- Actions: Pausar / Reanudar descanso; **Saltar descanso**; Cerrar → abandon.
- No break reset (skip covers early exit).

### Copy

| Concept | UI copy |
|---------|---------|
| Suspend timer | “Pausar” / “Pausado” |
| Post-focus phase | “Descanso” / “Saltar descanso” |
| Settings presets | “Descanso: X min” (not only “pausa” for preset break) |

### After break or skip

Existing `WorkBlockFeedbackModal` → complete / abandon. Floating timer closes on submit/skip reflection as today.

### Task estimates

Unchanged: play resolves preset; break comes from that preset, not a second task control.

## Supporting correctness (in scope)

1. Wire `breakDurationSec` from preset through `useRemoteWorkSession` → `createWorkSession`.
2. Derive remaining time from wall-clock / deadline for **focus and break** (not only `setInterval` decrement).
3. When paused, heartbeat and hydrate must add `now − pausedAt` (focus: `pausedDurationSec`; break: `breakPausedDurationSec`).

## Edge cases

| Case | Behavior |
|------|----------|
| `breakDurationSec === 0` | Skip break UI → `pending_feedback` |
| Refresh mid-break | Restore remaining from server fields |
| Background tab | Wall-clock remaining |
| 409 conflict | `on_break` counts as active session |
| Task switch during break | Not supported in v1 — skip or abandon only |
| Reset while remote session bound | **Disable** reset in FloatingTimer whenever `remoteWorkSessionId` is set (focus or break). Local-only timers may still reset. |

## Components / files (expected touch set)

**API**

- `apps/api/prisma/models/enums.prisma` — `WorkSessionState.on_break`
- `apps/api/prisma/models/business.prisma` — `breakStartedAt`, `breakPausedDurationSec`
- Migration
- `workSession.schemas.ts`, `WorkSessionService.ts`, active/today-summary paths
- Tests under `apps/api/tests/modules/work-sessions/`

**Web**

- `apps/web/services/workSessionsApi.ts`
- `apps/web/composables/timer/useRemoteWorkSession.ts`
- `apps/web/stores/timer.ts` — phase, transitions, wall-clock, pause accrual
- `apps/web/components/molecules/FloatingTimer.vue` — break UI + skip
- `apps/web/pages/settings.vue` — copy “Descanso”
- `apps/web/composables/timer/timerPresets.ts` — ensure `breakSec` flows on start
- Tests: timer store, remote session, FloatingTimer / cycle

## Success criteria

- Preset `25_5`: after focus target → 5 min “Descanso” UI → then reflection.
- Skip → reflection without waiting.
- Refresh mid-break restores remaining time.
- Today summary does not add break minutes.
- Automated tests cover: API `on_break` transition, client cycle, skip, `breakDurationSec = 0`, hydrate `on_break`.

## Relation to other specs

- `2026-07-31-work-block-feedback-ui-design.md` — reflection UI only; runs **after** break in this flow.
- `2026-07-31-task-switch-mid-timer-design.md` — focus-phase silent split; out of scope during `on_break`.
