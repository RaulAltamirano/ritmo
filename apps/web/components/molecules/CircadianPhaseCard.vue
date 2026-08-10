<template>
  <div v-if="currentPhase || isLoading || error">
    <!-- Skeleton: initial load only when there is no prior data -->
    <div
      v-if="isLoading && !currentPhase"
      class="space-y-2 animate-pulse"
      aria-busy="true"
      aria-label="Loading circadian phase"
    >
      <div class="flex items-center justify-between">
        <div class="h-4 bg-surface-raised rounded w-2/5" />
        <div class="h-4 bg-surface-raised rounded w-8" />
      </div>
      <div class="h-3 bg-surface-raised rounded w-3/4" />
      <div class="h-0.5 bg-surface-raised rounded-full mt-3" />
    </div>

    <!-- Error with no prior data -->
    <div v-else-if="error && !currentPhase" class="flex items-center gap-2.5">
      <p class="text-sm text-gray-400 dark:text-gray-500">Could not load phase</p>
      <button
        class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-150 cursor-pointer"
        @click="fetchCurrentPhase"
      >
        Retry
      </button>
    </div>

    <!-- Phase strip: visible whenever there is data, including during refetch -->
    <div v-else-if="currentPhase">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <component
            :is="phaseIcon"
            class="w-4 h-4 shrink-0 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
          />
          <span class="text-sm font-medium text-gray-900 dark:text-white">
            {{ currentPhase.name }}
          </span>
        </div>
        <div class="flex items-center gap-1.5">
          <span
            v-if="isLoading"
            class="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse"
            aria-label="Updating"
          />
          <span class="text-xs tabular-nums text-gray-400 dark:text-gray-500">
            {{ displayPercent }}%
          </span>
          <button
            type="button"
            class="p-0.5 -mr-0.5 rounded text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-400"
            :aria-expanded="isExpanded"
            :aria-label="isExpanded ? 'Hide description' : 'Show description'"
            @click="isExpanded = !isExpanded"
          >
            <ChevronDown
              class="w-3.5 h-3.5 transition-transform duration-200"
              :class="{ 'rotate-180': isExpanded }"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
      <Transition
        enter-active-class="transition-all duration-200 ease-out overflow-hidden"
        leave-active-class="transition-all duration-150 ease-in overflow-hidden"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-40"
        leave-from-class="opacity-100 max-h-40"
        leave-to-class="opacity-0 max-h-0"
      >
        <p
          v-if="isExpanded"
          class="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed"
        >
          {{ currentPhase.description }}
        </p>
      </Transition>
      <ProgressStrip
        :progress="animatedProgress"
        :color="phaseColor"
        height-class="h-0.5"
        class="mt-3"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    Activity,
    BookOpen,
    ChevronDown,
    Coffee,
    Moon,
    PenTool,
    Repeat,
    Sun,
  } from 'lucide-vue-next'
  import { computed, onMounted, ref, watch } from 'vue'
  import { useCircadian } from '@/composables/useCircadian'
  import ProgressStrip from '@/components/atoms/ProgressStrip.vue'

  const { currentPhase, isLoading, error, phaseProgress, fetchCurrentPhase } =
    useCircadian({
      autoRefresh: true,
      refreshInterval: 60000,
    })

  const iconMap: Record<string, unknown> = {
    moon: Moon,
    bed: Moon,
    sun: Sun,
    coffee: Coffee,
    activity: Activity,
    repeat: Repeat,
    'pen-tool': PenTool,
    'book-open': BookOpen,
  }

  const phaseIcon = computed(() => {
    if (!currentPhase.value) return Activity
    const key = (currentPhase.value.icon ?? '').toLowerCase()
    return iconMap[key] ?? Activity
  })

  const isExpanded = ref(false)
  const animatedProgress = ref(0)

  const displayPercent = computed(() => Math.round(animatedProgress.value * 100))

  const phaseColor = computed(() => currentPhase.value?.color ?? '#6366f1')

  onMounted(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        animatedProgress.value = phaseProgress.value
      }, 120)
    })
  })

  watch(phaseProgress, val => {
    animatedProgress.value = val
  })
</script>
