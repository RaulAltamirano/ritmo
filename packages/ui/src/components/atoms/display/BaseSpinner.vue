<script setup lang="ts">
  import { computed } from 'vue'

  interface BaseSpinnerProps {
    variant?: 'circular' | 'dots'
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    color?:
      | 'primary'
      | 'secondary'
      | 'success'
      | 'warning'
      | 'error'
      | 'info'
      | 'neutral'
      | 'white'
      | 'auto'
      | 'current'
    className?: string
    ariaLabel?: string
  }

  const props = withDefaults(defineProps<BaseSpinnerProps>(), {
    variant: 'circular',
    size: 'md',
    color: 'primary',
    ariaLabel: 'Loading',
  })

  const colorMap = {
    primary: '#3b82f6',
    secondary: '#6b7280',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
    neutral: '#6b7280',
    white: '#ffffff',
    auto: '#ffffff',
    current: 'currentColor',
  } as const

  const sizeMap = {
    xs: { container: 'w-4 h-4', dots: 'w-1 h-1', space: 'space-x-0.5' },
    sm: { container: 'w-5 h-5', dots: 'w-1.5 h-1.5', space: 'space-x-1' },
    md: { container: 'w-6 h-6', dots: 'w-2 h-2', space: 'space-x-1' },
    lg: { container: 'w-8 h-8', dots: 'w-2.5 h-2.5', space: 'space-x-1.5' },
    xl: { container: 'w-10 h-10', dots: 'w-3 h-3', space: 'space-x-2' },
  }

  const spinnerColor = computed(
    () => colorMap[props.color] ?? colorMap.primary,
  )

  const sizeClasses = computed(
    () => (sizeMap[props.size] ?? sizeMap.md).container,
  )

  const dotsContainerClasses = computed(
    () => (sizeMap[props.size] ?? sizeMap.md).space,
  )

  const dotClasses = computed(() => {
    const size = sizeMap[props.size] ?? sizeMap.md
    const colorClassMap: Record<string, string> = {
      primary: 'bg-blue-600',
      secondary: 'bg-gray-600',
      success: 'bg-green-600',
      warning: 'bg-yellow-600',
      error: 'bg-red-600',
      info: 'bg-cyan-600',
      neutral: 'bg-gray-600',
      white: 'bg-white',
      auto: 'bg-white',
      current: 'bg-current',
    }
    return `${size.dots} ${colorClassMap[props.color] ?? 'bg-blue-600'}`
  })

  const validVariant = computed(() =>
    props.variant === 'dots' ? 'dots' : 'circular',
  )
</script>

<template>
  <div
    class="inline-flex items-center justify-center shrink-0"
    :class="[sizeClasses, className]"
    role="status"
    :aria-label="ariaLabel"
  >
    <div
      v-if="validVariant === 'circular'"
      class="spinner-ring"
      :style="{ '--spinner-color': spinnerColor }"
    />

    <div v-else class="flex items-center" :class="[dotsContainerClasses]">
      <div
        v-for="i in 3"
        :key="i"
        class="rounded-full animate-bounce-subtle"
        :class="[dotClasses]"
        :style="{ animationDelay: `${(i - 1) * 0.15}s` }"
      />
    </div>
  </div>
</template>

<style scoped>
  .spinner-ring {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid color-mix(in srgb, var(--spinner-color, currentColor) 28%, transparent);
    border-top-color: var(--spinner-color, currentColor);
    animation: spinner-rotate 0.65s linear infinite;
  }

  @keyframes spinner-rotate {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes bounce-subtle {
    0%,
    100% {
      transform: translateY(0) scale(1);
      opacity: 1;
    }

    50% {
      transform: translateY(-4px) scale(1.1);
      opacity: 0.7;
    }
  }

  .animate-bounce-subtle {
    animation: bounce-subtle 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner-ring,
    .animate-bounce-subtle {
      animation: none;
    }
  }
</style>
