<script setup lang="ts">
  import { useColors } from '../../../composables/useColors'
  import { useTypography } from '../../../composables/useTypography'
  import { X } from 'lucide-vue-next'
  import { computed } from 'vue'
  import BaseSpinner from '../display/BaseSpinner.vue'
  import BaseBadge from '../feedback/BaseBadge.vue'

  // Props
  interface BaseCardProps {
    variant?: 'neumorphic' | 'glassmorphism' | 'minimalist' | 'elevated' | 'simple'
    size?: 'sm' | 'md' | 'lg'
    title?: string
    subtitle?: string
    loading?: boolean
    hoverable?: boolean
    clickable?: boolean
    dismissible?: boolean
    closeButtonAriaLabel?: string

    badge?: {
      variant:
        | 'primary'
        | 'secondary'
        | 'success'
        | 'warning'
        | 'error'
        | 'info'
        | 'neutral'
      size: 'xs' | 'sm' | 'md' | 'lg'
      text: string
      icon?: any
    }
    role?: string
    ariaLabel?: string
    id?: string
  }

  const props = withDefaults(defineProps<BaseCardProps>(), {
    variant: 'simple',
    size: 'md',
    loading: false,
    hoverable: false,
    clickable: false,
    dismissible: false,
    closeButtonAriaLabel: 'Cerrar card',

    role: 'article',
  })

  // Emits
  const emit = defineEmits<{
    click: [event: MouseEvent | KeyboardEvent]
    dismiss: []
  }>()

  // Composables
  const { getSurface, getTextSemantic, getBorderSemantic, variants } = useColors()
  const typography = useTypography()

  // Modern 2025 variant classes using design tokens
  const variantClasses = computed(() => ({
    simple: ['bg-surface', 'border border-outline', 'shadow-sm'].join(' '),
    neumorphic: [
      'bg-surface',
      'border border-outline',
      'shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.06)] dark:shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.06)]',
      'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]',
      'dark:shadow-[0_4px_6px_-1px_rgba(255,255,255,0.1),0_2px_4px_-1px_rgba(255,255,255,0.06)]',
      ...(props.hoverable
        ? [
            'hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)]',
            'dark:hover:shadow-[0_10px_15px_-3px_rgba(255,255,255,0.1),0_4px_6px_-2px_rgba(255,255,255,0.05)]',
          ]
        : []),
    ].join(' '),
    glassmorphism: [
      'bg-white/80 dark:bg-gray-900/80',
      'border border-white/20 dark:border-gray-700/20',
      'backdrop-blur-xl',
      'shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]',
      ...(props.hoverable
        ? [
            'hover:bg-white/90 dark:hover:bg-gray-900/90',
            'hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.5)]',
          ]
        : []),
    ].join(' '),
    minimalist: [
      'bg-transparent',
      'border-0',
      'shadow-none',
      ...(props.hoverable
        ? [
            'hover:bg-gray-50/50 dark:hover:bg-gray-800/50',
            'hover:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)]',
            'dark:hover:shadow-[0_1px_3px_0_rgba(255,255,255,0.1),0_1px_2px_0_rgba(255,255,255,0.06)]',
          ]
        : []),
    ].join(' '),
    elevated: [
      'bg-surface',
      'border border-outline',
      'shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)]',
      'dark:shadow-[0_20px_25px_-5px_rgba(255,255,255,0.1),0_10px_10px_-5px_rgba(255,255,255,0.04)]',
      ...(props.hoverable
        ? [
            'hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]',
            'dark:hover:shadow-[0_25px_50px_-12px_rgba(255,255,255,0.25)]',
            'hover:-translate-y-1',
          ]
        : []),
    ].join(' '),
  }))

  // Size classes with modern spacing
  const sizeClasses = computed(() => ({
    sm: 'rounded-xl p-4',
    md: 'rounded-2xl p-6',
    lg: 'rounded-3xl p-8',
  }))

  // Header and footer padding classes
  const headerPaddingClasses = computed(() => {
    const basePadding =
      props.size === 'sm' ? 'p-4' : props.size === 'md' ? 'p-6' : 'p-8'
    return props.variant === 'minimalist'
      ? basePadding.replace('p-', 'pt-')
      : basePadding
  })

  const footerPaddingClasses = computed(() => {
    const basePadding =
      props.size === 'sm' ? 'p-4' : props.size === 'md' ? 'p-6' : 'p-8'
    return props.variant === 'minimalist'
      ? basePadding.replace('p-', 'pb-')
      : basePadding
  })

  // Neumorphic inner shadow for depth effect
  const neumorphicInnerShadow = computed(
    () =>
      'shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.06)] dark:shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.06)]',
  )

  // Close button classes with modern styling
  const closeButtonClasses = computed(() =>
    [
      'absolute z-20 w-8 h-8 flex items-center justify-center rounded-full',
      'opacity-0 group-hover:opacity-100 transition-all duration-200',
      'right-3 top-3',
      'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm',
      'hover:bg-white dark:hover:bg-gray-800',
      'hover:scale-110',
      'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2',
      'focus:ring-offset-white dark:focus:ring-offset-gray-900',
      'border border-gray-200/50 dark:border-gray-600/50',
    ].join(' '),
  )

  // Computed aria label
  const ariaLabel = computed(() => {
    if (props.ariaLabel) return props.ariaLabel

    let label = props.title ?? 'Card'
    if (props.subtitle) {
      label += `: ${props.subtitle}`
    }
    if (props.loading) {
      label += ' cargando'
    }
    return label
  })

  // Event handlers
  const handleClick = (event: MouseEvent) => {
    if (props.loading) return
    emit('click', event)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (props.loading || !props.clickable) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick(event as any)
    }
  }

  const handleDismiss = () => {
    emit('dismiss')
  }

  // Expose
  defineExpose({
    focus: () => {
      // Focus logic if needed
    },
  })
</script>

<template>
  <div
    :id="id"
    class="group relative overflow-hidden transition-all duration-300 ease-out"
    :class="[
      variantClasses[variant],
      sizeClasses[size],
      {
        'hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5':
          hoverable && variant !== 'glassmorphism',
        'cursor-pointer': clickable,
        'animate-pulse': loading,
        'backdrop-blur-xl': variant === 'glassmorphism',
      },
    ]"
    :role="role"
    :tabindex="clickable ? 0 : undefined"
    :aria-label="ariaLabel"
    @click="handleClick"
    @keydown="handleKeyDown"
  >
    <!-- Loading overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 z-30 flex items-center justify-center"
      :class="[getSurface('overlay').value]"
    >
      <div class="flex flex-col items-center gap-2">
        <BaseSpinner size="md" color="primary" />
        <span
          class="text-gray-900 dark:text-white font-medium"
          :class="[typography.getBodyTypography('base').value]"
        >
          Cargando...
        </span>
      </div>
    </div>

    <!-- Card header -->
    <div
      v-if="title || $slots.header"
      class="flex-shrink-0"
      :class="[
        variant === 'minimalist' ? '' : 'border-b',
        getBorderSemantic('secondary'),
      ]"
    >
      <div :class="headerPaddingClasses">
        <slot name="header">
          <h3
            class="text-gray-900 dark:text-white"
            :class="[typography.getCardTypography('title').value]"
          >
            {{ title }}
          </h3>
          <p
            v-if="subtitle"
            class="text-gray-700 dark:text-gray-300 mt-1"
            :class="[typography.getCardTypography('subtitle').value]"
          >
            {{ subtitle }}
          </p>
        </slot>
      </div>
    </div>

    <!-- Card content -->
    <div class="flex-1 text-gray-900 dark:text-white">
      <slot />
    </div>

    <!-- Card footer -->
    <div
      v-if="$slots.footer"
      class="flex-shrink-0"
      :class="[
        variant === 'minimalist' ? '' : 'border-t',
        getBorderSemantic('secondary'),
      ]"
    >
      <div :class="footerPaddingClasses">
        <slot name="footer" />
      </div>
    </div>

    <!-- Close button -->
    <button
      v-if="dismissible"
      type="button"
      :aria-label="closeButtonAriaLabel"
      :class="closeButtonClasses"
      @click.stop="handleDismiss"
    >
      <X
        class="w-4 h-4 transition-colors duration-200 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      />
    </button>

    <!-- Badge -->
    <div v-if="badge" class="absolute right-4 top-3 z-10">
      <BaseBadge
        :variant="badge.variant"
        :size="badge.size"
        :content="badge.text"
        :icon="badge.icon"
      />
    </div>

    <!-- Neumorphic inner shadow for depth -->
    <div
      v-if="variant === 'neumorphic'"
      class="absolute inset-0 pointer-events-none rounded-xl"
      :class="neumorphicInnerShadow"
    ></div>
  </div>
</template>

<style scoped>
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .border {
      border-width: 2px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
      animation: none !important;
    }
  }

  /* Focus visible support */
  :focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  /* Dark mode text contrast improvements */
  .dark {
    color-scheme: dark;
  }

  /* Glassmorphism optimizations */
  .backdrop-blur-xl {
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
  }

  /* Smooth transitions for all variants */
  .transition-all {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Enhanced shadows for elevated variant */
  .shadow-\[0_20px_25px_-5px_rgba\(0\,0\,0\,0\.1\)\,0_10px_10px_-5px_rgba\(0\,0\,0\,0\.04\)\] {
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .shadow-\[0_25px_50px_-12px_rgba\(0\,0\,0\,0\.25\)\] {
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  /* Dark mode shadow adjustments */
  @media (prefers-color-scheme: dark) {
    .shadow-\[0_20px_25px_-5px_rgba\(255\,255\,255\,0\.1\)\,0_10px_10px_-5px_rgba\(255\,255\,255\,0\.04\)\] {
      box-shadow:
        0 20px 25px -5px rgba(255, 255, 255, 0.1),
        0 10px 10px -5px rgba(255, 255, 255, 0.04);
    }

    .shadow-\[0_25px_50px_-12px_rgba\(255\,255\,255\,0\.25\)\] {
      box-shadow: 0 25px 50px -12px rgba(255, 255, 255, 0.25);
    }
  }

  /* Neumorphic effect enhancements */
  .shadow-\[inset_0_2px_4px_0_rgba\(0\,0\,0\,0\.06\)\] {
    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
  }

  /* Glassmorphism backdrop blur fallback */
  @supports not (backdrop-filter: blur(24px)) {
    .backdrop-blur-xl {
      background-color: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .dark .backdrop-blur-xl {
      background-color: rgba(17, 24, 39, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  }

  /* Modern border radius */
  .rounded-3xl {
    border-radius: 1.5rem;
  }

  /* Hover transform for elevated cards */
  .hover\:-translate-y-1:hover {
    transform: translateY(-0.25rem);
  }

  /* Smooth scale transitions */
  .hover\:scale-110:hover {
    transform: scale(1.1);
  }

  /* Combined transforms */
  .hover\:-translate-y-1.hover\:scale-110:hover {
    transform: translateY(-0.25rem) scale(1.02);
  }
</style>
