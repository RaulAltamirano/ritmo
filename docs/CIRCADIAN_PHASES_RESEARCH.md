# Circadian Phases Knowledge Base (Ritmo)

This document consolidates the scientific rationale for Ritmo’s eight default circadian phases, how they map to local time blocks, and how the data model represents them.

## 1. Scope and caveats

- Circadian physiology and performance curves vary with **chronotype**, **light exposure**, **sleep debt**, caffeine, illness, and social schedules.
- The windows below are **default recommendations** for an intermediate chronotype. They are **not** medical advice.
- Ritmo should treat these phases as **configurable defaults** that can evolve with user telemetry and preferences.

## 2. Biological foundations

Ritmo’s phase model is intentionally simplified; four drivers explain most of the variation we encode in copy and scheduling:

**Cortisol awakening response (CAR)**  
On waking, cortisol rises sharply over roughly 30–60 minutes. That surge supports mounting alertness but coexists with **sleep inertia**, so the first post-wake hour is still cognitively fragile until inertia clears and CAR dynamics stabilize.  
Reference: https://pmc.ncbi.nlm.nih.gov/articles/PMC9669756/

**Core body temperature (CBT) rhythm**  
CBT has a circadian curve: it is low near habitual sleep and rises across the morning and day toward a late-afternoon/early-evening plateau, then falls toward sleep. Many cognitive metrics track this curve (speed, sustained attention, executive load).  
Reference: https://pmc.ncbi.nlm.nih.gov/articles/PMC10683050/

**Adenosine sleep pressure**  
Wakefulness accumulates adenosine, increasing sleep pressure. After sufficient sleep, pressure is lowest near wake; it climbs across the waking day and is one of the signals that makes late-night work feel unsustainable.  
Reference: https://pmc.ncbi.nlm.nih.gov/articles/PMC6710480/

**Melatonin onset**  
Melatonin secretion is suppressed by bright light and rises under dim light in the evening (dim-light melatonin onset, DLMO), typically on the order of ~2 hours before habitual sleep for many adults. It biases physiology toward sleep and away from high-arousal analytic work.  
Reference: https://pmc.ncbi.nlm.nih.gov/articles/PMC9669756/

## 3. Key evidence (annotated)

Each entry: **one-line abstract** plus canonical link.

| ID                         | One-line abstract                                                                                                                                          | URL                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| PMC10683050                | Reviews time-of-day effects on cognition and performance, including chronotype interactions and practical implications for scheduling demanding work.      | https://pmc.ncbi.nlm.nih.gov/articles/PMC10683050/           |
| 10.1007/s11325-023-02895-0 | Sleep-medicine–oriented discussion linking circadian physiology, sleep timing, and next-day cognitive outcomes relevant to “when to study” decisions.      | https://link.springer.com/article/10.1007/s11325-023-02895-0 |
| PMC6430172                 | Describes attention rhythms across the day (morning ascent, post-lunch dip, late-day patterns) with implications for task placement.                       | https://pmc.ncbi.nlm.nih.gov/articles/PMC6430172/            |
| PMC2647793                 | Documents the post-lunch **circasemidian** dip in alertness and performance as a predictable mid-afternoon phenomenon.                                     | https://pmc.ncbi.nlm.nih.gov/articles/PMC2647793/            |
| PMC6710480                 | Summarizes **sleep inertia**—impaired cognition immediately after waking—and why early-morning throughput is limited even when cortisol is rising.         | https://pmc.ncbi.nlm.nih.gov/articles/PMC6710480/            |
| PMC9669756                 | Covers CAR timing/magnitude and broader circadian modulation of the HPA axis relevant to morning alertness curves.                                         | https://pmc.ncbi.nlm.nih.gov/articles/PMC9669756/            |
| 10.5465/amj.2019.0020      | Organizational-behavior evidence that chronotypes differ in when they produce creative ideas, motivating flexible “creative window” defaults.              | https://journals.aom.org/doi/10.5465/amj.2019.0020           |
| PMID:27791394              | Experimental work (Wieth & Zacks, 2011) linking inhibitory control and insight problem solving to time of day—supporting afternoon insight for some tasks. | https://pubmed.ncbi.nlm.nih.gov/27791394/                    |

## 4. Phase-by-phase breakdown

Each phase: **mechanism** → **why suggested activities fit** → **what to avoid**.

**slow_activation (05:00–07:00)**  
Sleep inertia dominates throughput; CAR is ascending but has not yet translated into stable high performance—**gentle** activation (hydration, mobility, light planning) fits the physiology. Avoid high-stakes analysis, dense meetings, and heavy learning loads.

**morning_focus_peak (07:00–10:00)**  
CAR dynamics and rising CBT support improving attention and structured learning—**technical reading, note-taking, and new concepts** align with the ascending vigilance curve. Avoid scheduling only creative/free-association work if the user needs crisp executive control.

**cognitive_peak (10:00–13:00)**  
CBT approaches daytime highs; processing speed and executive-heavy work benefit—**programming, deep work, and complex decisions** fit here. Avoid treating this block as “misc admin” if the user needs peak analytical output later in the day.

**second_productivity (13:00–15:00)**  
Circasemidian dip: slower reaction time and vigilance—**email, admin, structured reviews**, and optional **short naps (10–20 min)** match the biology. Avoid brand-new architecture design or safety-critical operations if avoidable.

**creative_window (15:00–18:00)**  
Afternoon recovery in arousal plus looser inhibitory tone can support **verbal fluency, design, and brainstorming** (see Wieth & Zacks, 2011, PMID:27791394). Avoid assuming it equals the same analytical peak as late morning without user feedback.

**transition (18:00–20:00)**  
Thermoregulatory and arousal systems shift toward consolidation—**review, journaling, spaced repetition, light planning** fit. Avoid intense new learning or long high-conflict meetings where possible.

**introspective (20:00–22:00)**  
Evening melatonin onset and reduced external focus bias toward **reflection, slow reading, and next-day setup** in dim light. Avoid bright screens and stimulating content if the goal is earlier sleep.

**sleep_preparation (22:00–05:00)**  
Melatonin signaling, approaching CBT nadir, and high adenosine pressure converge on **sleep**—hygiene, darkness, and cool environments are appropriate; **work is misaligned** with this block’s physiology.

## 5. Canonical schedule table

| Phase type            | Local window | Duration | Rationale (short)                                               |
| --------------------- | ------------ | -------: | --------------------------------------------------------------- |
| `slow_activation`     | 05:00–07:00  |  120 min | Sleep inertia + ascending CAR; low throughput.                  |
| `morning_focus_peak`  | 07:00–10:00  |  180 min | CAR dynamics + rising alertness; structured learning.           |
| `cognitive_peak`      | 10:00–13:00  |  180 min | CBT-linked peak for analytical / executive demand.              |
| `second_productivity` | 13:00–15:00  |  120 min | Circasemidian dip; structured or recovery-biased work.          |
| `creative_window`     | 15:00–18:00  |  180 min | Afternoon recovery + creative/verbal opportunities.             |
| `transition`          | 18:00–20:00  |  120 min | Downshift toward consolidation and review.                      |
| `introspective`       | 20:00–22:00  |  120 min | Melatonin-related evening shift; reflection and light planning. |
| `sleep_preparation`   | 22:00–05:00  |  420 min | Sleep-aligned physiology; overnight coverage.                   |

## 6. Chronotype notes

- **Morning types** often experience CAR, temperature, and performance curves **about one hour earlier** than intermediate defaults.
- **Evening types** often shift the same curves **about two hours later**, delaying the subjective “peak” and postponing melatonin-related evening downshift.
- Ritmo’s **fixed hour blocks** are a UX compromise; future personalization should slide windows (not necessarily widen them) based on user data and validated instruments (e.g., MEQ-style questionnaires), not guesswork.

## 7. Data model constraints

- Enum values must match Prisma `CircadianPhaseType`:  
  `slow_activation`, `morning_focus_peak`, `cognitive_peak`, `second_productivity`, `creative_window`, `transition`, `introspective`, `sleep_preparation`.
- Runtime logic uses **half-open local-hour intervals** `[startHour, endHour)` in the usual case.
- **Overnight window**: when `endHour < startHour` (e.g. 22 → 5), the phase spans local midnight; timers and “time until next” must respect that wrap.

## 8. Operational notes

- **Source of truth in the database:** table `circadian_phases` (seeded from `CIRCADIAN_PHASES` in `apps/api/scripts/database/config/database.ts`).
- Seeder uses **idempotent upserts** (see `CircadianPhaseFactory`).
- Suggested deploy order:
  1. `prisma migrate deploy` (or project equivalent)
  2. `pnpm --filter @ritmo/api db:seed` (or repo script) to refresh catalog text

## 9. Database audit status

- Verify with PostgreSQL running and `DATABASE_URL` configured:
  - After seed, expect **exactly eight** active catalog rows ordered by `sortOrder`, matching the canonical schedule table above.
- If the database is unreachable in a given environment, rerun the checks locally or in CI once connectivity is available; content-only changes do not require a new migration when enums and columns are unchanged.
