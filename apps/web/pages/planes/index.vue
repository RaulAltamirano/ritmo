<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <PageHeader
      title="Mis planes"
      subtitle="Define rutas de estudio, preparación de exámenes, hábitos o metas de bienestar. Cada plan agrupa tus tareas con un mismo objetivo."
      :actions="true"
    >
      <template #actions>
        <BaseButton
          variant="outline"
          class="flex items-center gap-2"
          @click="showFilters = !showFilters"
        >
          <Filter :size="16" />
          <span>Filtros</span>
        </BaseButton>

        <BaseButton variant="primary" class="flex items-center gap-2" @click="openNewProjectModal">
          <Plus :size="16" />
          <span>Nuevo plan</span>
        </BaseButton>
      </template>
    </PageHeader>

    <BaseCard variant="elevated" size="lg" class="mb-8" :hoverable="false">
      <div
        class="-m-8 p-8 bg-gradient-to-br from-primary-500/12 via-primary-400/5 to-transparent dark:from-primary-500/20 dark:via-primary-600/10 rounded-3xl border border-primary-500/15 dark:border-primary-400/20"
      >
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div class="max-w-2xl">
            <h2 class="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              ¿Qué quieres conseguir?
            </h2>
            <p class="mt-2 text-base leading-relaxed text-gray-600 dark:text-gray-300">
              Un plan puede ser aprender inglés o gramática, preparar un examen, dejar un mal hábito o
              cuidar tu salud. Elige una idea para rellenar la búsqueda o crea un plan desde cero.
            </p>
          </div>
          <div class="flex flex-wrap gap-2 lg:justify-end">
            <button
              v-for="chip in inspirationChips"
              :key="chip.label"
              type="button"
              class="rounded-full border border-outline-strong bg-white/80 dark:bg-gray-900/60 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all hover:border-primary-500 hover:text-primary-700 dark:hover:border-primary-400 dark:hover:text-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              @click="applyInspiration(chip.query)"
            >
              {{ chip.label }}
            </button>
          </div>
        </div>

        <div class="mt-6 max-w-xl">
          <BaseInput
            v-model="searchQuery"
            label="Buscar en tus planes"
            placeholder="Ej.: inglés, oposición, hábitos, peso…"
            :left-icon="Search"
            clearable
            autocomplete="off"
          />
        </div>
      </div>
    </BaseCard>

    <ClientOnly>
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-16 gap-4">
        <BaseSpinner size="lg" color="primary" />
        <p class="text-base text-gray-600 dark:text-gray-400">Cargando tus planes…</p>
      </div>

      <div v-else>
        <BaseCard v-if="showFilters" variant="simple" size="md" class="mb-6" :hoverable="false">
          <div class="flex flex-wrap gap-4">
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                for="planes-filter-status"
              >Estado</label>
              <select
                id="planes-filter-status"
                v-model="statusFilter"
                class="px-3 py-2 min-w-[12rem] border border-outline-strong rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-surface text-gray-900 dark:text-white"
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="en_progreso">En progreso</option>
                <option value="planificado">Planificado</option>
                <option value="pausado">Pausado</option>
                <option value="completado">Completado</option>
              </select>
            </div>
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                for="planes-filter-sort"
              >Ordenar por</label>
              <select
                id="planes-filter-sort"
                v-model="sortBy"
                class="px-3 py-2 min-w-[12rem] border border-outline-strong rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-surface text-gray-900 dark:text-white"
              >
                <option value="createdAt">Fecha de creación</option>
                <option value="name">Nombre</option>
                <option value="progress">Avance</option>
                <option value="pendingTasks">Tareas pendientes</option>
              </select>
            </div>
          </div>
        </BaseCard>

        <div v-if="filteredProjects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProjectCard v-for="project in filteredProjects" :key="project.id" :project="project" />
        </div>

        <BaseCard v-else variant="simple" size="md" :hoverable="false">
          <EmptyState
            :title="emptyTitle"
            :description="emptyDescription"
            :icon="Compass"
          >
            <BaseButton variant="primary" class="inline-flex items-center gap-2" @click="openNewProjectModal">
              <Plus :size="16" />
              <span>Crear mi primer plan</span>
            </BaseButton>
          </EmptyState>
        </BaseCard>

        <ProjectModal v-model="showProjectModal" :project="editingProject" @save="handleSaveProject" />
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
import BaseCard from '@ritmo/ui/components/atoms/layout/BaseCard.vue'
import BaseInput from '@ritmo/ui/components/atoms/forms/BaseInput.vue'
import BaseSpinner from '@ritmo/ui/components/atoms/display/BaseSpinner.vue'
import EmptyState from '@ritmo/ui/components/molecules/feedback/EmptyState.vue'
import { Compass, Filter, Plus, Search } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import PageHeader from '~/components/molecules/PageHeader.vue'
import ProjectCard from '~/components/molecules/ProjectCard.vue'
import ProjectModal from '~/components/molecules/ProjectModal.vue'
import { useProjectsStore } from '@/stores/projects'
import type { Project } from '@/types/project'

useHead({
  title: 'Mis planes',
  meta: [
    {
      name: 'description',
      content:
        'Planes de estudio, preparación de exámenes, hábitos y metas personales en un solo lugar.',
    },
  ],
})

definePageMeta({
  layout: 'default',
})

const inspirationChips = [
  { label: 'Idiomas', query: 'inglés' },
  { label: 'Examen / oposición', query: 'examen' },
  { label: 'Hábitos', query: 'hábito' },
  { label: 'Salud y bienestar', query: 'salud' },
] as const

const projectsStore = useProjectsStore()

const showProjectModal = ref(false)
const editingProject = ref<Project | null>(null)
const showFilters = ref(false)
const statusFilter = ref('')
const sortBy = ref('createdAt')
const searchQuery = ref('')
const isLoading = ref(true)

onMounted(() => {
  projectsStore.initializeData()
  isLoading.value = false
})

function applyInspiration(query: string) {
  searchQuery.value = query
}

const filteredProjects = computed(() => {
  let filtered = projectsStore.projects

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    filtered = filtered.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)),
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(project => project.status === statusFilter.value)
  }

  filtered = [...filtered].sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'progress':
        return b.progress - a.progress
      case 'pendingTasks':
        return a.pendingTasks - b.pendingTasks
      case 'createdAt':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  return filtered
})

const emptyTitle = computed(() => {
  if (statusFilter.value) return 'No hay planes con ese estado'
  if (searchQuery.value.trim()) return 'Nada coincide con tu búsqueda'
  return 'Aún no tienes planes'
})

const emptyDescription = computed(() => {
  if (statusFilter.value) {
    return 'Prueba otro estado o crea un plan nuevo para seguir avanzando.'
  }
  if (searchQuery.value.trim()) {
    return 'Ajusta las palabras o quita el filtro de búsqueda para ver todos tus planes.'
  }
  return 'Crea un plan para un idioma, un examen, un hábito o una meta personal y organiza las tareas alrededor de ese objetivo.'
})

const openNewProjectModal = () => {
  editingProject.value = null
  showProjectModal.value = true
}

const handleSaveProject = (project: Project) => {
  if (editingProject.value) {
    projectsStore.updateProject(project)
  } else {
    projectsStore.addProject(project)
  }
}
</script>
