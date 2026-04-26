<script setup lang="ts">
  import { useDark } from '@vueuse/core'
  import { ChevronRight } from 'lucide-vue-next'
  import { computed } from 'vue'
  import BaseActionMenu from '../navigation/BaseActionMenu.vue'
  import PhaseImageCard from './PhaseImageCard.vue'

  interface Breadcrumb {
    label: string
    to?: string
  }

  interface PhaseData {
    label: string
    emoji: string
    image: string
    suggestion: string
    color?: string
    progress?: number
    timeUntilNext?: string
  }

  interface PageHeaderProps {
    title: string
    subtitle?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    actions?: boolean
    actionsLayout?: 'horizontal' | 'vertical'
    breadcrumbs?: Breadcrumb[]
    phaseData?: PhaseData
    darkMode?: boolean
    phaseLoading?: boolean
  }

  const props = withDefaults(defineProps<PageHeaderProps>(), {
    size: 'lg',
    actions: false,
    actionsLayout: 'horizontal',
    // No default for darkMode — `false` would make `!== undefined` always true
    // and override the real app theme (e.g. Profile with PageHeader only).
  })

  // Misma clave y fallback que `apps/web` `useTheme` (storage `theme` + class `html.dark`)
  const isDark = useDark({ storageKey: 'theme', initialValue: 'light' })

  // Prioriza la prop solo si el padre la pasa (true o false). Si no, sigue a `isDark` global.
  const currentDarkMode = computed(() => {
    if (typeof props.darkMode === 'boolean') {
      return props.darkMode
    }
    return isDark.value
  })

  // Size classes for title - computed to ensure reactivity
  const titleSizeClass = computed(() => {
    const sizeMap = {
      sm: 'text-xl',
      md: 'text-2xl',
      lg: 'text-3xl',
      xl: 'text-4xl',
    }
    return sizeMap[props.size]
  })

  // Size classes for subtitle - computed to ensure reactivity
  const subtitleSizeClass = computed(() => {
    const sizeMap = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    }
    return sizeMap[props.size]
  })

  // Use provided breadcrumbs or empty array
  const finalBreadcrumbs = computed(() => {
    return props.breadcrumbs || []
  })
</script>

<template>
  <div class="mb-4 sm:mb-8">
    <!-- Imagen de fase cognitiva -->
    <PhaseImageCard
      v-if="phaseData"
      :phase-data="phaseData"
      :dark-mode="currentDarkMode"
    />

    <div
      class="flex flex-row gap-3 sm:gap-4"
      :class="[actions ? 'items-center justify-between' : '']"
    >
      <!-- Título y subtítulo -->
      <div class="flex-1 min-w-0">
        <h1 class="font-bold text-gray-900 dark:text-white" :class="[titleSizeClass]">
          <span v-if="phaseData?.emoji" class="mr-2">{{ phaseData.emoji }}</span>
          <span v-else-if="phaseLoading" class="mr-2 animate-pulse">🌅</span>
          {{ title }}
        </h1>
        <p
          v-if="subtitle"
          class="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2"
          :class="[subtitleSizeClass]"
        >
          {{ subtitle }}
        </p>
      </div>

      <!-- Acciones -->
      <div v-if="actions" class="flex items-center justify-end gap-2 sm:gap-3">
        <!-- Acciones desktop -->
        <div class="hidden sm:flex items-center gap-3">
          <slot name="actions" />
        </div>

        <!-- Menú de acciones mobile -->
        <BaseActionMenu class="sm:hidden">
          <template #actions>
            <slot name="actions" />
          </template>
        </BaseActionMenu>
      </div>
    </div>

    <!-- Breadcrumbs opcionales -->
    <nav
      v-if="finalBreadcrumbs && finalBreadcrumbs.length > 0"
      class="mt-3 sm:mt-4"
      aria-label="Breadcrumb"
    >
      <ol class="flex items-center space-x-2 text-xs sm:text-sm">
        <li
          v-for="(crumb, index) in finalBreadcrumbs"
          :key="index"
          class="flex items-center"
        >
          <NuxtLink
            v-if="crumb.to && index < finalBreadcrumbs.length - 1"
            :to="crumb.to"
            class="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {{ crumb.label }}
          </NuxtLink>
          <span
            v-else
            :class="[
              index === finalBreadcrumbs.length - 1
                ? 'text-gray-900 dark:text-white font-medium'
                : 'text-gray-500 dark:text-gray-400',
            ]"
          >
            {{ crumb.label }}
          </span>
          <ChevronRight
            v-if="index < finalBreadcrumbs.length - 1"
            :size="12"
            class="text-gray-400 mx-1 sm:mx-2"
          />
        </li>
      </ol>
    </nav>
  </div>
</template>
