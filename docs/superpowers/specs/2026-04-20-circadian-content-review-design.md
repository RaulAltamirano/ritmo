# Circadian Phases — Content Review & Enrichment

**Date:** 2026-04-20  
**Scope:** Content quality pass on the circadian phase catalog, research document, and supporting files.  
**Approach chosen:** B — full content revision without schema changes.

---

## What we are changing

### 1. `apps/api/scripts/database/config/database.ts` — `CIRCADIAN_PHASES` array

No structural changes (no new fields, no type changes, no schema migration needed). Only the value of existing string fields:

| Field                  | Change                                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| `description`          | Rewrite to explain the physiological _mechanism_ driving the phase, not just the symptom. |
| `idealFor`             | Replace generic activity labels with specific, actionable tasks.                          |
| `keyword`              | Minor adjustments where the current label misrepresents the phase focus.                  |
| `scientificReferences` | Add references to phases that have only one citation; minimum 2 per phase.                |
| `evidenceLevel`        | Revise where classification does not match literature strength.                           |

Fields left unchanged: `type`, `category`, `startHour`, `endHour`, `duration`, `color`, `icon`, `emoji`, `sortOrder`, `isPremium`, `isIntuitive`.

The time windows are validated by the research document and are correct. No hour changes.

#### Per-phase content plan

**1. `slow_activation` — 05:00–07:00**

- Mechanism: sleep inertia + cortisol awakening response (CAR) ascending
- Description: explain that output quality is low due to sleep inertia suppressing throughput; CAR is still building
- idealFor: morning meditation, gratitude journaling, light stretching, hydration, loose day planning
- References: PMC6710480 (sleep inertia), PMC9669756 (CAR)
- evidenceLevel: `high` (keep)

**2. `morning_focus_peak` — 07:00–10:00**

- Mechanism: CAR subsides, alertness climbing, working memory and attention improving
- Description: explain the CAR peak at ~30-45 min post-wake and its effect on attention; best structured-study window
- idealFor: technical reading, structured study, note-taking, learning new concepts
- References: PMC9669756, PMC10683050, add `10.1007/s11325-023-02895-0`
- evidenceLevel: `high` (keep)

**3. `cognitive_peak` — 10:00–13:00**

- Mechanism: body temperature approaching daily maximum; processing speed, working memory, and executive function at peak
- Description: explain the body-temperature / cognitive performance link; best window for demanding analytical work
- idealFor: programming, complex problem-solving, deep work, high-stakes decisions
- References: PMC10683050, `10.1007/s11325-023-02895-0`, add PMC6430172
- evidenceLevel: `high` (keep)

**4. `second_productivity` — 13:00–15:00**

- Mechanism: post-lunch circasemidian dip — alertness drops, reaction time slows; not ideal for peak-demand work
- keyword: change `"Review"` → `"Recover"` (the priority is managing the dip, not high output)
- Description: explain circasemidian rhythm; recommend structured, low-stakes tasks; mention that a 10–20 min nap neutralises the dip
- idealFor: email, admin tasks, structured reviews, short nap (10–20 min)
- References: PMC2647793, PMC6430172
- evidenceLevel: `medium` (keep)

**5. `creative_window` — 15:00–18:00**

- Mechanism: afternoon body-temperature recovery + reduced inhibition as analytical focus loosens
- Description: explain that reduced prefrontal inhibition in the afternoon can facilitate remote associations and verbal output; Wieth & Zacks (2011) link
- idealFor: writing, design, brainstorming, language output, creative ideation
- References: `10.5465/amj.2019.0020`, PMID:27791394, add PMC6430172
- evidenceLevel: `medium` (keep — literature is solid but not as extensive as morning peak)

**6. `transition` — 18:00–20:00**

- Mechanism: body temperature declining from second peak; energy shifting from output to consolidation
- Description: explain the consolidation function; good for reviewing the day and encoding memories
- idealFor: review of the day's work, journaling, spaced-repetition review, light planning
- References: PMC6430172, add PMC10683050
- evidenceLevel: `medium` (downgrade from `high` — consolidation role at this window is less directly studied)

**7. `introspective` — 20:00–22:00**

- Mechanism: melatonin secretion onset (~2 h before habitual sleep); reduced external focus; autobiographical memory becomes more accessible
- Description: explain melatonin onset and the shift toward inward processing; good for reflection and next-day planning
- idealFor: slow reading, visualization, planning tomorrow, personal reflection, gratitude review
- References: PMC10683050, PMC9669756
- evidenceLevel: `medium` (keep — mechanism is solid; specific cognitive effects at this window have moderate evidence)

**8. `sleep_preparation` — 22:00–05:00**

- Mechanism: melatonin at peak, core body temperature at nadir, adenosine pressure maximised
- Description: explain the three convergent sleep signals; screen use disrupts melatonin; this phase is for sleep, not work
- idealFor: sleep hygiene routine, dark/cool environment, avoid screens and stimulating content
- References: PMC9669756, PMC6710480
- evidenceLevel: `high` (keep)

---

### 2. `docs/CIRCADIAN_PHASES_RESEARCH.md` — full rewrite

New structure:

```
1. Scope and caveats
2. Biological foundations       ← NEW
3. Key evidence (annotated)     ← EXPANDED (one-line abstract per reference)
4. Phase-by-phase breakdown     ← NEW (table + mechanism paragraph per phase)
5. Canonical schedule table     ← same as today, already correct
6. Chronotype notes             ← NEW (morning types ~1h earlier, evening ~2h later)
7. Data model constraints
8. Operational notes
9. Database audit status
```

The "Biological foundations" section covers the four circadian drivers modelled in the app:

- Cortisol Awakening Response (CAR)
- Core body temperature (CBT) rhythm
- Adenosine sleep pressure
- Melatonin onset

Each driver explained in 2–3 sentences with one reference.

The "Phase-by-phase breakdown" adds a paragraph per phase: mechanism → why activities align → what to avoid.

---

### 3. `apps/api/prisma/models/enums.prisma` — comment corrections

`CircadianPhaseType` enum comments contain stale hour ranges from an old 5-phase system. Update to match the current 8-phase canonical schedule:

```
slow_activation      // 05-07: Sleep inertia + cortisol awakening response
morning_focus_peak   // 07-10: Rising alertness, structured focus
cognitive_peak       // 10-13: Analytical and deep-work peak
second_productivity  // 13-15: Circasemidian dip, structured tasks
creative_window      // 15-18: Verbal fluency and creative recovery
transition           // 18-20: Downshift and consolidation
introspective        // 20-22: Melatonin onset, reflection and planning
sleep_preparation    // 22-05: Sleep; melatonin peak and temperature nadir
```

---

### 4. `apps/api/src/shared/constants/circadianPhases.ts` — delete

File has no importers anywhere in the codebase (verified). It contains duplicate, stale phase data. Deleting it removes a confusing source of inconsistency. The canonical source is `database.ts`.

---

## What we are NOT changing

- Prisma schema (no migration needed)
- Time windows (already correct per research doc)
- Any frontend code
- Any API service/controller code
- `database.ts` structure — only string field values

## Success criteria

- All 8 phases in `database.ts` have descriptions explaining the biological mechanism
- Every phase has at least 2 verified scientific references
- `CIRCADIAN_PHASES_RESEARCH.md` covers all 4 biological drivers and all 8 phases
- `enums.prisma` comments match the actual hour windows
- `circadianPhases.ts` is deleted
- Running `db:seed` after the change produces 8 correct rows (idempotent upsert)
