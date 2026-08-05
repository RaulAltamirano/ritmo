<script setup lang="ts">
  import * as LucideIcons from 'lucide-vue-next'
  import { computed, ref, useSlots } from 'vue'
  import {
    badgeSizeMap,
    formatBadgeCount,
    getBadgeCountClasses,
    getBadgeVariantClasses,
    type BadgeAppearance,
    type BadgeSize,
    type BadgeVariant,
  } from '../../../types/badge'
  import BaseIcon from '../display/BaseIcon.vue'
  import BaseSpinner from '../display/BaseSpinner.vue'

  const ICON_ALIASES: Record<string, string> = {
    alert: 'AlertTriangle',
    check: 'Check',
    info: 'Info',
    x: 'X',
    star: 'Star',
    bell: 'Bell',
  }

  const props = defineProps({
    variant: { type: String, default: 'primary' },
    appearance: { type: String, default: 'soft' },
    size: { type: String, default: 'md' },
    content: { type: String, default: '' },
    count: { type: Number, default: undefined },
    maxCount: { type: Number, default: 99 },
    leftIcon: { type: [String, Object], default: undefined },
    rightIcon: { type: [String, Object], default: undefined },
    loading: { type: Boolean, default: false },
    clickable: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    tag: { type: String, default: 'span' },
    ariaLabel: { type: String, default: '' },
  })

  const emit = defineEmits(['click'])
  const slots = useSlots()
  const isPressed = ref(false)
  const badgeRef = ref()

  const resolveIconName = (iconName: string) => {
    if (ICON_ALIASES[iconName]) return ICON_ALIASES[iconName]
    return (
      iconName.charAt(0).toUpperCase() +
      iconName.slice(1).replace(/-([a-z])/g, g => g[1].toUpperCase())
    )
  }

  const getIconComponent = (iconName: unknown) => {
    if (!iconName) return null
    if (typeof iconName === 'object') return iconName
    if (typeof iconName !== 'string') return null
    return (LucideIcons as Record<string, unknown>)[resolveIconName(iconName)] ?? null
  }

  const tag = computed(() => (props.clickable ? 'button' : props.tag))

  const tabindex = computed(() =>
    props.clickable && !props.disabled ? 0 : undefined,
  )

  const computedRole = computed(() => (props.clickable ? 'button' : undefined))

  const ariaPressed = computed(() =>
    props.clickable ? (isPressed.value ? 'true' : 'false') : undefined,
  )

  const hostDisabled = computed(() =>
    tag.value === 'button' ? props.disabled || undefined : undefined,
  )

  const ariaLive = computed(() => (props.loading ? 'polite' : undefined))

  const hasContent = computed(
    () => !props.loading && (props.content || !!slots.default),
  )

  const showCount = computed(
    () => props.count !== undefined && props.count > 0,
  )

  const formattedCount = computed(() => {
    if (props.count === undefined) return ''
    return formatBadgeCount(props.count, props.maxCount)
  })

  const countAriaLabel = computed(() => `${props.count} items`)

  const iconSize = computed(() => {
    const sizeMap: Record<string, string> = {
      xs: 'xs',
      sm: 'xs',
      md: 'sm',
      lg: 'sm',
    }
    return sizeMap[props.size] ?? 'sm'
  })

  const spinnerColor = computed(() =>
    props.appearance === 'solid' &&
    ['primary', 'success', 'warning', 'error', 'info', 'neutral'].includes(
      props.variant,
    )
      ? 'current'
      : 'current',
  )

  const leftIconComponent = computed(() => getIconComponent(props.leftIcon))
  const rightIconComponent = computed(() => getIconComponent(props.rightIcon))

  const badgeClasses = computed(() => {
    const variant = (props.variant as BadgeVariant) || 'primary'
    const appearance = (props.appearance as BadgeAppearance) || 'soft'
    const size = (props.size as BadgeSize) || 'md'

    const classes = [
      'inline-flex',
      'items-center',
      'justify-center',
      'gap-1',
      'font-medium',
      'rounded-full',
      'transition-all',
      'duration-200',
      'ease-out',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-1',
      'dark:focus:ring-offset-gray-900',
      badgeSizeMap[size] ?? badgeSizeMap.md,
      ...getBadgeVariantClasses(variant, appearance),
    ]

    if (props.clickable && !props.disabled) {
      classes.push('cursor-pointer', 'active:scale-95')
    }
    if (props.disabled) {
      classes.push('opacity-50', 'cursor-not-allowed')
    }

    return classes.join(' ')
  })

  const countClasses = computed(() => {
    const variant = (props.variant as BadgeVariant) || 'primary'
    const appearance = (props.appearance as BadgeAppearance) || 'soft'
    return [
      'flex-shrink-0',
      'rounded-full',
      'px-1.5',
      'py-0.5',
      'text-xs',
      'font-semibold',
      'leading-none',
      'min-w-[1.25rem]',
      'h-5',
      'inline-flex',
      'items-center',
      'justify-center',
      getBadgeCountClasses(variant, appearance),
    ].join(' ')
  })

  const handleClick = (event: MouseEvent | KeyboardEvent) => {
    if (props.disabled || props.loading) return
    emit('click', event)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (props.disabled || props.loading || !props.clickable) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick(event)
    }
  }

  defineExpose({
    focus: () => badgeRef.value?.focus(),
  })
</script>

<template>
  <component
    :is="tag"
    ref="badgeRef"
    :class="badgeClasses"
    :role="computedRole"
    :tabindex="tabindex"
    :aria-label="ariaLabel || undefined"
    :aria-pressed="ariaPressed"
    :aria-live="ariaLive"
    :aria-busy="loading || undefined"
    :disabled="hostDisabled"
    @click="handleClick"
    @keydown="handleKeyDown"
  >
    <BaseIcon
      v-if="leftIconComponent"
      :icon="leftIconComponent"
      :size="iconSize"
      class="flex-shrink-0"
      data-testid="base-icon"
      aria-hidden
    />

    <BaseSpinner
      v-if="loading"
      :size="iconSize"
      :color="spinnerColor"
      class="flex-shrink-0"
      aria-hidden
    />

    <span v-if="hasContent" class="flex-shrink-0 leading-none font-medium">
      <slot>{{ content }}</slot>
    </span>

    <BaseIcon
      v-if="rightIconComponent"
      :icon="rightIconComponent"
      :size="iconSize"
      class="flex-shrink-0"
      data-testid="base-icon"
      aria-hidden
    />

    <span v-if="showCount" :class="countClasses" :aria-label="countAriaLabel">
      {{ formattedCount }}
    </span>
  </component>
</template>

<style scoped>
  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
      animation: none !important;
    }
  }
</style>
