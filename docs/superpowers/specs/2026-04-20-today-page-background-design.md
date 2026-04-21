# Today Page — Background Redesign

**Date:** 2026-04-20
**Scope:** `apps/web/components/organisms/today/TodayLayout.vue` — `.canvas` styles only
**Goal:** Transmit tranquility, peace, and harmony through a simple, minimalist background of high-quality feel.

---

## Design Decisions

| Question          | Decision                             |
| ----------------- | ------------------------------------ |
| Color mode        | Both light and dark                  |
| Phase-aware color | Removed — neutral, fixed palette     |
| Texture           | SVG noise (paper grain), very subtle |
| Movement          | Slow breathing pulse, ~75s cycle     |

---

## 1. Base Colors

Replace Tailwind utility classes with custom warm neutrals:

| Mode  | Value     | Rationale                                  |
| ----- | --------- | ------------------------------------------ |
| Light | `#F7F6F3` | Warm off-white — paper feel, not cold gray |
| Dark  | `#141418` | Deep warm slate — intimate, not pure black |

These replace the current `bg-gray-50 dark:bg-gray-900` classes on `.canvas`.

---

## 2. Paper Grain Texture

A fractal SVG noise filter applied as a `::before` pseudo-element on `.canvas`.

- SVG encoded inline as `url("data:image/svg+xml,...")` — no external file
- `opacity: 0.04` in light mode, `0.03` in dark mode
- Covers the full canvas (`inset: 0; position: absolute`)
- `pointer-events: none` so it never intercepts clicks
- `z-index: 0` — content wrapper sits above it at `z-index: 1`

The grain is invisible at a glance but adds warmth and the tactile feel of quality paper.

---

## 3. Breathing Pulse

A radial gradient centered on the canvas, animated with `@keyframes`:

```
scale(1.0) → scale(1.08) → scale(1.0)
duration: 75s | easing: ease-in-out | iteration: infinite
```

- Light mode: `radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 70%)`
- Dark mode: `radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 70%)`
- Applied via `::after` pseudo-element on `.canvas`, also `pointer-events: none`
- `transform-origin: center center`

The cycle is ~75 seconds — one breath per minute. Imperceptible consciously, felt as calm.

---

## Removals

- Remove `--ph`, `--ph-r`, `--ph-g`, `--ph-b` CSS variables (no longer used)
- Remove `canvasVars` computed property from `TodayLayout.vue` script
- Remove the old corner radial gradients (replaced by centered breathing gradient)

---

## Files Changed

| File                                                  | Change                                                                    |
| ----------------------------------------------------- | ------------------------------------------------------------------------- |
| `apps/web/components/organisms/today/TodayLayout.vue` | Replace `.canvas` styles; remove `canvasVars` computed; update base class |

No new files. No new dependencies.
