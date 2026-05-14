<template>
  <div
    class="w-full rounded-full overflow-hidden"
    :class="[trackClass, heightClass]"
    :role="ariaLabel ? 'progressbar' : undefined"
    :aria-valuenow="ariaLabel ? percent : undefined"
    :aria-valuemin="ariaLabel ? 0 : undefined"
    :aria-valuemax="ariaLabel ? 100 : undefined"
    :aria-label="ariaLabel || undefined"
  >
    <div
      class="progress-fill h-full rounded-full"
      :class="{ 'progress-fill--shimmer': showShimmer }"
      :style="fillStyle"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, type CSSProperties } from 'vue'

  interface Props {
    /** Proporción a rellenar, 0..1. Valores fuera de rango se clampan. */
    progress: number
    /** Color del fill (hex o cualquier CSS color). */
    color?: string
    /** Clase Tailwind para altura (ej. `h-0.5`, `h-1`, `h-1.5`). */
    heightClass?: string
    /** Clase Tailwind para el track. */
    trackClass?: string
    /** Anima un shimmer horizontal sobre el fill. */
    showShimmer?: boolean
    /** Si se provee, se añaden `role="progressbar"` + `aria-*`. */
    ariaLabel?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    color: '#0ea5e9',
    heightClass: 'h-0.5',
    trackClass: 'bg-surface-raised',
    showShimmer: true,
    ariaLabel: undefined,
  })

  const clamped = computed(() => {
    const n = Number(props.progress)
    if (!Number.isFinite(n)) return 0
    return Math.min(1, Math.max(0, n))
  })

  const percent = computed(() => Math.round(clamped.value * 100))

  const fillStyle = computed<CSSProperties>(() => ({
    width: `${clamped.value * 100}%`,
    backgroundColor: props.color,
    boxShadow: `0 0 6px 1px ${props.color}55`,
  }))
</script>

<style scoped>
  .progress-fill {
    transition: width 900ms cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .progress-fill--shimmer::after {
    content: '';
    position: absolute;
    inset: 0;
    width: 50%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.38),
      transparent
    );
    animation: shimmer 2.8s ease-in-out infinite;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-200%);
    }
    100% {
      transform: translateX(400%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .progress-fill {
      transition: none;
    }
    .progress-fill--shimmer::after {
      animation: none;
    }
  }
</style>
