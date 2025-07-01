<template>
  <div class="calendar-filters border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <!-- Filtros principales -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Filtro por proyectos -->
        <div class="filter-group">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Proyectos
          </label>
          <select
            v-model="localFilters.projects"
            multiple
            class="filter-select"
            aria-label="Filtrar por proyectos"
          >
            <option value="">Todos los proyectos</option>
            <option 
              v-for="project in availableProjects" 
              :key="project"
              :value="project"
            >
              {{ project }}
            </option>
          </select>
        </div>

        <!-- Filtro por categorías -->
        <div class="filter-group">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Categorías
          </label>
          <select
            v-model="localFilters.categories"
            multiple
            class="filter-select"
            aria-label="Filtrar por categorías"
          >
            <option value="">Todas las categorías</option>
            <option 
              v-for="category in availableCategories" 
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
        </div>

        <!-- Filtro por prioridad -->
        <div class="filter-group">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Prioridad
          </label>
          <div class="flex items-center gap-2">
            <label 
              v-for="priority in priorities" 
              :key="priority.value"
              class="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                :value="priority.value"
                v-model="localFilters.priorities"
                class="priority-checkbox"
                :aria-label="`Filtrar por prioridad ${priority.label}`"
              />
              <span 
                :class="[
                  'priority-badge',
                  priority.color
                ]"
              >
                {{ priority.label }}
              </span>
            </label>
          </div>
        </div>
      </div>

      <!-- Controles adicionales -->
      <div class="flex items-center gap-3">
        <!-- Botón de limpiar filtros -->
        <BaseButton
          v-if="hasActiveFilters"
          variant="outline"
          size="sm"
          @click="clearFilters"
          aria-label="Limpiar todos los filtros"
        >
          <X :size="16" class="mr-2" />
          Limpiar
        </BaseButton>

        <!-- Toggle de filtros -->
        <BaseButton
          variant="ghost"
          size="sm"
          @click="toggleAdvancedFilters"
          aria-label="Mostrar filtros avanzados"
        >
          <Filter :size="16" class="mr-2" />
          {{ showAdvancedFilters ? 'Ocultar' : 'Avanzados' }}
        </BaseButton>
      </div>
    </div>

    <!-- Filtros avanzados -->
    <div 
      v-if="showAdvancedFilters"
      class="advanced-filters mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Rango de fechas -->
        <div class="filter-group">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rango de fechas
          </label>
          <div class="flex items-center gap-2">
            <input
              v-model="dateRange.start"
              type="date"
              class="filter-input"
              aria-label="Fecha de inicio"
            />
            <span class="text-gray-500">a</span>
            <input
              v-model="dateRange.end"
              type="date"
              class="filter-input"
              aria-label="Fecha de fin"
            />
          </div>
        </div>

        <!-- Filtro por estado -->
        <div class="filter-group">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estado
          </label>
          <select
            v-model="localFilters.status"
            class="filter-select"
            aria-label="Filtrar por estado"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="completed">Completados</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>

        <!-- Filtro por duración -->
        <div class="filter-group">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Duración
          </label>
          <select
            v-model="localFilters.duration"
            class="filter-select"
            aria-label="Filtrar por duración"
          >
            <option value="">Cualquier duración</option>
            <option value="short">Corta (< 1h)</option>
            <option value="medium">Media (1-4h)</option>
            <option value="long">Larga (> 4h)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Indicador de filtros activos -->
    <div 
      v-if="hasActiveFilters"
      class="active-filters mt-3 flex flex-wrap items-center gap-2"
    >
      <span class="text-sm text-gray-600 dark:text-gray-400">Filtros activos:</span>
      
      <span 
        v-for="filter in activeFilterLabels" 
        :key="filter.key"
        class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full"
      >
        {{ filter.label }}
        <button
          @click="removeFilter(filter.key, filter.value)"
          class="hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-full p-0.5"
          :aria-label="`Remover filtro ${filter.label}`"
        >
          <X :size="12" />
        </button>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Filter } from 'lucide-vue-next'
import type { CalendarFilters } from '~/types/calendar'
import BaseButton from '~/components/atoms/BaseButton.vue'

interface CalendarFiltersProps {
  filters: CalendarFilters
  availableProjects: string[]
  availableCategories: string[]
}

const props = defineProps<CalendarFiltersProps>()

const emit = defineEmits<{
  'filter-change': [filters: CalendarFilters]
}>()

// Estado local
const showAdvancedFilters = ref(false)
const localFilters = ref<CalendarFilters>({ ...props.filters })
const dateRange = ref({
  start: '',
  end: ''
})

// Configuración de prioridades
const priorities = [
  { value: 'alta', label: 'Alta', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' },
  { value: 'media', label: 'Media', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200' },
  { value: 'baja', label: 'Baja', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' }
]

// Computed
const hasActiveFilters = computed(() => {
  return localFilters.value.projects.length > 0 ||
         localFilters.value.categories.length > 0 ||
         localFilters.value.priorities.length > 0 ||
         dateRange.value.start ||
         dateRange.value.end
})

const activeFilterLabels = computed(() => {
  const labels: Array<{ key: string; value: string; label: string }> = []
  
  localFilters.value.projects.forEach(project => {
    labels.push({ key: 'projects', value: project, label: `Proyecto: ${project}` })
  })
  
  localFilters.value.categories.forEach(category => {
    labels.push({ key: 'categories', value: category, label: `Categoría: ${category}` })
  })
  
  localFilters.value.priorities.forEach(priority => {
    const priorityLabel = priorities.find(p => p.value === priority)?.label || priority
    labels.push({ key: 'priorities', value: priority, label: `Prioridad: ${priorityLabel}` })
  })
  
  if (dateRange.value.start) {
    labels.push({ key: 'dateStart', value: dateRange.value.start, label: `Desde: ${dateRange.value.start}` })
  }
  
  if (dateRange.value.end) {
    labels.push({ key: 'dateEnd', value: dateRange.value.end, label: `Hasta: ${dateRange.value.end}` })
  }
  
  return labels
})

// Métodos
const clearFilters = () => {
  localFilters.value = {
    projects: [],
    categories: [],
    priorities: []
  }
  dateRange.value = { start: '', end: '' }
  emitFilters()
}

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value
}

const removeFilter = (key: string, value: string) => {
  switch (key) {
    case 'projects':
      localFilters.value.projects = localFilters.value.projects.filter(p => p !== value)
      break
    case 'categories':
      localFilters.value.categories = localFilters.value.categories.filter(c => c !== value)
      break
    case 'priorities':
      localFilters.value.priorities = localFilters.value.priorities.filter(p => p !== value)
      break
    case 'dateStart':
      dateRange.value.start = ''
      break
    case 'dateEnd':
      dateRange.value.end = ''
      break
  }
  emitFilters()
}

const emitFilters = () => {
  const filters: CalendarFilters = {
    ...localFilters.value,
    dateRange: dateRange.value.start && dateRange.value.end ? {
      start: new Date(dateRange.value.start),
      end: new Date(dateRange.value.end)
    } : undefined
  }
  emit('filter-change', filters)
}

// Watch para emitir cambios
watch(localFilters, emitFilters, { deep: true })
watch(dateRange, emitFilters, { deep: true })

// Watch para sincronizar con props
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })
</script>

<style scoped>
.calendar-filters {
  @apply w-full;
}

.filter-group {
  @apply flex flex-col;
}

.filter-select {
  @apply px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors;
}

.filter-input {
  @apply px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors;
}

.priority-checkbox {
  @apply w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600;
}

.priority-badge {
  @apply px-2 py-1 text-xs font-medium rounded-full;
}

.active-filters {
  @apply text-sm;
}

/* Responsive */
@media (max-width: 768px) {
  .filter-group {
    @apply w-full;
  }
  
  .filter-select,
  .filter-input {
    @apply w-full;
  }
}
</style> 