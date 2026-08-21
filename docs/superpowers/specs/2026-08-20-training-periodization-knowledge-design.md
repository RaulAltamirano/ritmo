# Training periodization knowledge — Design

**Date:** 2026-08-20  
**Status:** Approved (brainstorming)  
**Source input:** Voice note from WFITNESS coach (nutriólogo Juan Pablo Galván García) on block periodization, fitness–fatigue, and sequencing  
**Approach:** Layer 1 — scientific knowledge + WFITNESS bridge (option C location, approach 1 structure)

## Problem

`/training/` covers hypertrophy continuum, RIR/RPE, volume, and routines, but not periodization models or the fitness–fatigue framing the coach uses to justify block sequencing. There is no `docs/knowledge/training/` yet (unlike timer). Claims from the voice note need real sources and clear labels (evidence vs preference).

## Goals

- Create canonical knowledge under `docs/knowledge/training/` with verified citations.
- Add `/training/05_periodizacion_wfitness.md` as the operational bridge.
- Lightly link from `00` and `01` without rewriting routines (`02*`) or the decision motor (`03`).

## Non-goals

- Rewriting `02A`–`02C`, `03`, or `04`
- Nutrition prescriptions
- Claiming block periodization is universally superior
- Implementing app UI for mesocycles in this pass

## Information architecture

### `docs/knowledge/training/` (canonical)

| File | Role |
| --- | --- |
| `README.md` | Index, authority, evidence labels |
| `periodization-models.md` | Linear, undulating, conjugated, blocks |
| `fitness-fatigue.md` | Banister-style fitness–fatigue; masking |
| `block-sequencing.md` | Anatomical prep → accumulation → intensification → peak/taper |
| `references.md` | Bibliography + evidence quality notes |

### `/training/` (operational)

| Change | Role |
| --- | --- |
| `05_periodizacion_wfitness.md` | How WFITNESS applies blocks; omit competitive peak/taper by default |
| `01_fundamentos_cientificos.md` | Link out; no long theory duplicate |
| `00_instrucciones_ia.md` | Include `05` + knowledge path when periodization context is needed |

## Labeling

| Tag | Meaning |
| --- | --- |
| **Evidencia** | Primary sources / reviews |
| **Consenso práctico** | Widely used; mixed or indirect evidence |
| **Preferencia WFITNESS** | Method choice (blocks for structure); not “only correct” |

## Claim map (from voice note)

1. Bompa as major Western periodization / anatomical adaptation referent — **Evidencia** (with nuance: Issurin formalizes concentrated block ATR)
2. Linear, undulating, conjugated, blocks as main families — **Consenso práctico** + reviews
3. Fitness–fatigue masking performance — **Evidencia** (Banister et al.; note model limitations)
4. Volume/accumulation raises fitness and fatigue — **Evidencia** / **Consenso**
5. Intensification builds on prior fitness with relatively less fatigue masking — **Consenso práctico** (maps to Issurin transmutation / Bompa max-strength phases)
6. Peak + taper unmask fitness for competition — **Evidencia** (Mujika; Travis et al. for strength)
7. Anatomical adaptation prepares structures, not max fitness — **Evidencia** (Bompa)
8. Non-competitors often skip full peak/taper — **Preferencia WFITNESS** + practical rationale

## Anti-duplication

- Knowledge = definitions, models, evidence, limits
- `05` = application + links (short)
- `01` = pointer only for this topic

## Verification

- Cross-check DOIs/ISBNs in `references.md`
- Explicit note where voice-note simplification differs from literature (Bompa vs Issurin naming)
