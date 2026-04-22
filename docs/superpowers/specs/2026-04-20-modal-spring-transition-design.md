# Modal Spring Transition — Design Spec

**Date:** 2026-04-20
**Component:** `packages/ui/src/components/atoms/interactive/BaseModal.vue`
**Goal:** Replace the current double-animation system with a single CSS spring transition that feels fluid and native.

---

## Problem

`BaseModal` currently runs two animation systems simultaneously on the same elements:

1. Vue `<Transition name="modal">` applies CSS enter/leave classes (`modal-enter-from`, etc.)
2. A JS `isVisible` ref toggles `opacity-0/100` and `scale-95/100` Tailwind classes on the same elements via `modalClasses` and `backdropClasses` computed

Both systems target `opacity` and `transform` at the same time, creating potential visual conflicts. The `requestAnimationFrame` hack in `handleEnter` and the hardcoded 300ms `setTimeout` in `handleLeave` exist only to serve the JS system. The animation curve (`ease-out`) does not produce a spring feel.

---

## Design

### Animation architecture

Two synchronized layers, driven entirely by CSS — no JS animation logic:

```
<Transition name="modal">           ← controls opacity of the full overlay
  <div role="dialog" fixed inset-0>
    <div class="backdrop" />        ← inherits fade from parent (synchronized)
    <div class="modal-panel" />     ← independent spring via @keyframes
  </div>
</Transition>
```

**Overlay (outer div):** simple opacity fade only — `300ms ease-out` enter, `220ms ease-in` exit.

**Panel (`.modal-panel`):** spring keyframe animation — `scale(0.92) translateY(16px) → scale(1) translateY(0)` using `cubic-bezier(0.34, 1.56, 0.64, 1)`. This curve has a Y value > 1 which produces a natural overshoot without requiring multi-keyframe bounce definitions. Duration: `400ms` enter, `220ms` exit.

**Backdrop:** inherits the overlay fade — no separate animation needed, naturally synchronized.

**Exit:** same animation reversed. Exit is slightly shorter (220ms) so closing feels snappy and responsive.

**Spring curve rationale:** `cubic-bezier(0.34, 1.56, 0.64, 1)` is the standard spring approximation used by Linear, Vercel, and iOS web transitions. The overshoot is subtle (~4% scale overshoot), not bouncy.

### Reduced motion

The existing `@media (prefers-reduced-motion: reduce)` block is extended to disable both the overlay transition and the panel `animation`. No JS changes needed.

---

## Changes

### Template

- Add class `modal-panel` to the `modalRef` div (the white panel element).
- Remove `@enter="handleEnter"` and `@leave="handleLeave"` from `<Transition>`.

### Script

Remove entirely:

- `isVisible` ref and all reads/writes
- `isAnimating` ref and all reads/writes
- `handleEnter` function and `@enter` attribute on `<Transition>`
- `handleLeave` function and `@leave` attribute on `<Transition>`
- `usePreferredReducedMotion` import (no longer used in JS — reduced motion handled by CSS media query)

Simplify `modalClasses` computed:

- Remove: `opacity-100/0`, `scale-100/95`, `transition-all duration-300 ease-out`, and the `reducedOrNone` block
- Keep: base visual classes, size classes, position classes

Simplify `backdropClasses` computed:

- Remove: `opacity-100/0` and transition dynamic classes, `reducedOrNone` block
- Keep: backdrop style classes (`backdrop-blur-sm bg-black/50`, etc.)

Handle `animation: 'none'` prop via CSS class:

- Add a computed `noAnimation = computed(() => props.animation === 'none')`
- Bind `:class="{ 'modal-no-anim': noAnimation }"` on the `role="dialog"` div
- In CSS: `.modal-no-anim.modal-enter-active, .modal-no-anim.modal-leave-active { transition: none; animation: none; }` and same for `.modal-panel`

### CSS (scoped)

Replace current `<Transition>` CSS rules with:

```css
.modal-enter-active {
  transition: opacity 300ms ease-out;
}
.modal-leave-active {
  transition: opacity 220ms ease-in;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-panel {
  animation: modal-spring-in 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.modal-leave-active .modal-panel {
  animation: modal-spring-out 220ms ease-in both;
}

@keyframes modal-spring-in {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(16px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
@keyframes modal-spring-out {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.92) translateY(16px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active {
    transition: none;
  }
  .modal-enter-active .modal-panel,
  .modal-leave-active .modal-panel {
    animation: none;
  }
}
```

Keep existing rules: `high-contrast`, `print`, `focus-visible`, `high-DPI`.

---

## What does NOT change

- All props, emits, and the public API surface
- Focus trap logic
- Escape / backdrop-click handlers
- Scroll lock behavior
- Dark mode classes
- Existing tests (no behavior changes)

---

## Test impact

No behavioral changes — all existing 9 tests pass without modification. No new tests required (CSS animations are not testable in jsdom).
