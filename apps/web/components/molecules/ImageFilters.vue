<template>
  <div class="mb-4 sm:mb-6">
    <!-- Header con estructura similar a PageHeader -->
    <div class="flex flex-row gap-3 sm:gap-4 items-center justify-between">
      <!-- Título y contador -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <Filter class="w-5 h-5 text-gray-500" />
          <h2 class="font-semibold text-gray-900 dark:text-white text-lg">
            Filter by Phase
          </h2>
          <span class="text-sm text-gray-500 dark:text-gray-400">
            ({{ filteredCount }} images)
          </span>
        </div>
      </div>

      <!-- Acciones -->
      <div class="flex items-center justify-end gap-2 sm:gap-3">
        <!-- Clear filter button -->
        <BaseButton
          v-if="selectedPhase !== null"
          variant="ghost"
          size="sm"
          @click="$emit('filter-change', null)"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Clear filter
        </BaseButton>
      </div>
    </div>

    <!-- Horizontal scroll filters with indicators -->
    <div class="mt-4 relative">
      <!-- Left scroll indicator -->
      <div
        v-if="showLeftScroll"
        class="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none"
      ></div>

      <!-- Right scroll indicator -->
      <div
        v-if="showRightScroll"
        class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none"
      ></div>

      <!-- Scroll container with padding to avoid cuts -->
      <div
        ref="scrollContainer"
        class="flex gap-3 overflow-x-auto overflow-y-visible py-2 pb-4 scrollbar-none overscroll-behavior-x-contain"
        @scroll="handleScroll"
      >
        <!-- Loading skeleton -->
        <div v-if="isLoading" class="flex gap-3">
          <BaseSkeleton variant="rectangular" width="80px" height="40px" rounded="lg" />
          <BaseSkeleton
            variant="rectangular"
            width="120px"
            height="40px"
            rounded="lg"
          />
          <BaseSkeleton
            variant="rectangular"
            width="100px"
            height="40px"
            rounded="lg"
          />
          <BaseSkeleton
            variant="rectangular"
            width="110px"
            height="40px"
            rounded="lg"
          />
          <BaseSkeleton variant="rectangular" width="90px" height="40px" rounded="lg" />
        </div>

        <!-- Filter buttons when loaded -->
        <template v-else>
          <!-- "All phases" button -->
          <button
            @click="$emit('filter-change', null)"
            class="filter-chip"
            :class="
              selectedPhase === null ? 'filter-chip-active' : 'filter-chip-inactive'
            "
          >
            <Grid class="w-4 h-4 mr-2" />
            All
          </button>

          <!-- Phase buttons -->
          <button
            v-for="phase in phases"
            :key="phase.id"
            @click="$emit('filter-change', phase.id)"
            class="filter-chip"
            :class="
              selectedPhase === phase.id ? 'filter-chip-active' : 'filter-chip-inactive'
            "
            :style="{
              backgroundColor: selectedPhase === phase.id ? phase.color : undefined,
              borderColor: selectedPhase === phase.id ? phase.color : undefined,
            }"
          >
            <span class="text-lg mr-2">{{ phase.emoji }}</span>
            <span class="truncate max-w-[120px]">{{ phase.name }}</span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import BaseSkeleton from '@ritmo/ui/components/atoms/layout/BaseSkeleton.vue'
  import { Filter, Grid } from 'lucide-vue-next'
  import { onMounted, onUnmounted, ref } from 'vue'

  interface Phase {
    id: string
    name: string
    emoji: string
    icon: string
    color: string
    image: string
    category: string
    priority: string
    startHour: number
    endHour: number
    duration: number
    keyword: string
    description: string
    idealFor: string
  }

  interface ImageFiltersProps {
    selectedPhase: string | null
    phases: Phase[]
    filteredCount?: number
    isLoading?: boolean
  }

  const props = withDefaults(defineProps<ImageFiltersProps>(), {
    filteredCount: 0,
    isLoading: false,
  })

  const emit = defineEmits<{
    'filter-change': [phaseId: string | null]
  }>()

  // Estado para indicadores de scroll
  const scrollContainer = ref<HTMLElement>()
  const showLeftScroll = ref(false)
  const showRightScroll = ref(false)

  // Función para manejar el scroll
  const handleScroll = () => {
    if (!scrollContainer.value) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value
    showLeftScroll.value = scrollLeft > 0
    showRightScroll.value = scrollLeft < scrollWidth - clientWidth - 1
  }

  // Función para verificar indicadores en resize
  const checkScrollIndicators = () => {
    if (!scrollContainer.value) return

    const { scrollWidth, clientWidth } = scrollContainer.value
    showRightScroll.value = scrollWidth > clientWidth
  }

  // Lifecycle
  onMounted(() => {
    checkScrollIndicators()
    window.addEventListener('resize', checkScrollIndicators)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkScrollIndicators)
  })
</script>

<style scoped>
  /* Scrollbar personalizado para mejor UX */
  .scrollbar-none {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }

  /* Estilos personalizados para los filtros */
  .filter-chip {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 0.5rem;
    border: 1px solid;
    transition: all 0.2s ease-out;
    cursor: pointer;
    flex-shrink: 0;
    /* Sin transform para evitar cortes */
    transform: none;
    /* Espacio suficiente para el contenido */
    min-height: 2.5rem;
  }

  .filter-chip:hover {
    /* Solo cambiar opacidad, no escalar */
    transform: none;
    opacity: 0.9;
  }

  .filter-chip:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  .filter-chip-active {
    background-color: #3b82f6;
    color: white;
    border-color: #3b82f6;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .filter-chip-inactive {
    background-color: transparent;
    color: #374151;
    border-color: #d1d5db;
  }

  .filter-chip-inactive:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
  }

  /* Dark mode */
  .dark .filter-chip-inactive {
    color: #d1d5db;
    border-color: #4b5563;
  }

  .dark .filter-chip-inactive:hover {
    background-color: #374151;
    border-color: #6b7280;
  }

  /* Mejoras de accesibilidad */
  @media (prefers-reduced-motion: reduce) {
    .filter-chip {
      transition: none;
    }
  }

  /* Soporte para high contrast */
  @media (prefers-contrast: high) {
    .scrollbar-none {
      scrollbar-width: thin;
    }
  }
</style>
