<template>
  <button
    type="button"
    class="pawg inline-flex items-center gap-2.5 min-h-[44px] pl-2 pr-3.5 rounded-full"
    :aria-label="ariaLabel"
    @click="onClick"
  >
    <span
      class="pawg-icon inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
      aria-hidden="true"
    >
      <Sparkles :size="16" class="pawg-sparkles" />
    </span>

    <span class="pawg-label text-sm font-medium text-content whitespace-nowrap">
      Generate week
    </span>
  </button>
</template>

<script setup lang="ts">
  import { Sparkles } from 'lucide-vue-next'

  const emit = defineEmits<{
    open: []
  }>()

  const ariaLabel = 'Generate weekly plan with AI'

  function onClick() {
    emit('open')
  }
</script>

<style scoped>
  .pawg {
    --pawg-ease: cubic-bezier(0.22, 1, 0.36, 1);
    --pawg-duration: 380ms;
    --pawg-shadow-rest:
      0 1px 0 rgba(255, 255, 255, 0.35) inset,
      0 -1px 0 rgba(0, 0, 0, 0.06) inset,
      0 8px 24px rgba(15, 23, 42, 0.08),
      0 1px 2px rgba(15, 23, 42, 0.04);
    position: relative;
    isolation: isolate;
    overflow: hidden;
    border: 1px solid transparent;
    background:
      linear-gradient(
          color-mix(in srgb, var(--color-surface, #fff) 72%, transparent),
          color-mix(in srgb, var(--color-surface, #fff) 72%, transparent)
        )
        padding-box,
      linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.72) 0%,
          rgba(255, 255, 255, 0.22) 38%,
          rgba(255, 255, 255, 0.06) 62%,
          rgba(255, 255, 255, 0.35) 100%
        )
        border-box;
    backdrop-filter: blur(18px) saturate(1.6);
    -webkit-backdrop-filter: blur(18px) saturate(1.6);
    box-shadow: var(--pawg-shadow-rest);
    transform: translateY(0) scale(1);
    transition: transform var(--pawg-duration) var(--pawg-ease);
  }

  .pawg::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(
      115deg,
      transparent 30%,
      rgba(255, 255, 255, 0.28) 48%,
      rgba(255, 255, 255, 0.08) 52%,
      transparent 68%
    );
    transform: translateX(-120%) skewX(-12deg);
    opacity: 0;
    pointer-events: none;
    z-index: 0;
  }

  .pawg::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    box-shadow:
      0 14px 32px rgba(14, 165, 233, 0.14),
      0 6px 16px rgba(15, 23, 42, 0.08);
    opacity: 0;
    pointer-events: none;
    z-index: -1;
    transition: opacity var(--pawg-duration) var(--pawg-ease);
  }

  .pawg > * {
    position: relative;
    z-index: 1;
  }

  .pawg:focus {
    outline: none;
  }

  .pawg:focus-visible {
    outline: 2px solid rgb(14 165 233 / 0.55);
    outline-offset: 2px;
  }

  .pawg:active {
    transform: translateY(0) scale(0.985);
    transition-duration: 120ms;
  }

  .pawg-icon {
    background: linear-gradient(145deg, #38bdf8 0%, #0ea5e9 55%, #0284c7 100%);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.35) inset,
      0 4px 10px rgba(14, 165, 233, 0.35);
    transition: transform var(--pawg-duration) var(--pawg-ease);
  }

  .pawg-sparkles {
    transition: transform var(--pawg-duration) var(--pawg-ease);
  }

  .pawg-label {
    display: inline-block;
    min-width: 7.25rem;
    text-align: left;
    transition: letter-spacing var(--pawg-duration) var(--pawg-ease);
  }

  .dark .pawg {
    --pawg-shadow-rest:
      0 1px 0 rgba(255, 255, 255, 0.22) inset,
      0 -1px 0 rgba(0, 0, 0, 0.35) inset,
      0 10px 28px rgba(0, 0, 0, 0.35),
      0 1px 2px rgba(0, 0, 0, 0.2);
    background:
      linear-gradient(rgba(30, 41, 59, 0.55), rgba(30, 41, 59, 0.55)) padding-box,
      linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.55) 0%,
          rgba(255, 255, 255, 0.14) 36%,
          rgba(255, 255, 255, 0.04) 58%,
          rgba(255, 255, 255, 0.28) 100%
        )
        border-box;
    box-shadow: var(--pawg-shadow-rest);
  }

  .dark .pawg::after {
    box-shadow:
      0 16px 36px rgba(14, 165, 233, 0.22),
      0 8px 20px rgba(0, 0, 0, 0.35);
  }

  .dark .pawg::before {
    background: linear-gradient(
      115deg,
      transparent 30%,
      rgba(255, 255, 255, 0.18) 48%,
      rgba(255, 255, 255, 0.05) 52%,
      transparent 68%
    );
  }

  .dark .pawg:focus-visible {
    outline-color: rgb(56 189 248 / 0.7);
  }

  @keyframes pawg-sheen {
    from {
      transform: translateX(-120%) skewX(-12deg);
    }
    to {
      transform: translateX(130%) skewX(-12deg);
    }
  }

  @media (hover: hover) and (pointer: fine) {
    .pawg:hover {
      transform: translateY(-2px) scale(1.02);
    }

    .pawg:hover::before {
      opacity: 1;
      animation: pawg-sheen 900ms var(--pawg-ease) forwards;
    }

    .pawg:hover::after {
      opacity: 1;
    }

    .pawg:hover .pawg-icon {
      transform: scale(1.08) rotate(-4deg);
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.45) inset,
        0 6px 16px rgba(14, 165, 233, 0.45);
    }

    .pawg:hover .pawg-sparkles {
      transform: scale(1.08);
    }

    .pawg:hover .pawg-label {
      letter-spacing: 0.01em;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pawg,
    .pawg-icon,
    .pawg-sparkles,
    .pawg-label,
    .pawg::after {
      transition: none;
    }

    .pawg:hover,
    .pawg:active {
      transform: none;
    }

    .pawg:hover::before {
      animation: none;
      opacity: 0;
    }

    .pawg:hover .pawg-icon,
    .pawg:hover .pawg-sparkles {
      transform: none;
    }
  }

  @media (forced-colors: active) {
    .pawg {
      border: 1px solid ButtonText;
      background: ButtonFace;
      color: ButtonText;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      box-shadow: none;
      forced-color-adjust: none;
    }

    .pawg::before,
    .pawg::after {
      display: none;
    }

    .pawg-icon {
      background: Highlight;
      color: HighlightText;
      box-shadow: none;
      forced-color-adjust: none;
    }

    .pawg:focus-visible {
      outline: 2px solid Highlight;
      outline-offset: 2px;
    }
  }
</style>
