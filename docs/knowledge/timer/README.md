---
title: Timer knowledge
lang: en
domain: timer
authority: canonical
source_of_truth: apps/api/src/modules/users/timerPresets.dto.ts
last_verified: 2026-07-31
---

# Timer knowledge

Focus-block presets and the focus → break → reflection cycle used when starting a `WorkSession` on a `Task`.

| Doc | Purpose |
| --- | --- |
| [`presets.md`](presets.md) | Default keys, persistence, executed break phase, evidence framing |

**Runtime owners** (canonical for executable defaults):

- API DTO + defaults: `apps/api/src/modules/users/timerPresets.dto.ts`
- Web fallback: `apps/web/composables/timer/timerPresets.ts`
- Timer store cycle: `apps/web/stores/timer.ts` (`on_break` / phase `break`)
