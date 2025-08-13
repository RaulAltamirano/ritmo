<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header usando PageHeader -->
    <PageHeader
      title="Proyectos"
      subtitle="Gestiona y organiza tus proyectos de manera eficiente"
      :actions="true"
    >
      <template #actions>
        <BaseButton
          variant="outline"
          class="flex items-center space-x-2"
          @click="showFilters = !showFilters"
        >
          <Filter :size="16" />
          <span>Filtros</span>
        </BaseButton>
        
        <BaseButton
          variant="primary"
          class="flex items-center space-x-2"
          @click="openNewProjectModal"
        >
          <Plus :size="16" />
          <span>Nuevo Proyecto</span>
        </BaseButton>
      </template>
    </PageHeader>

    <ClientOnly>
      <!-- Estado de carga -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Cargando proyectos...
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          Preparando tu espacio de trabajo
        </p>
      </div>

      <!-- Contenido cuando no está cargando -->
      <div v-else>
        <!-- Filtros -->
        <div v-if="showFilters" class="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="flex flex-wrap gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
              <select 
                v-model="statusFilter"
                class="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="en_progreso">En Progreso</option>
                <option value="planificado">Planificado</option>
                <option value="pausado">Pausado</option>
                <option value="completado">Completado</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ordenar por</label>
              <select 
                v-model="sortBy"
                class="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="createdAt">Fecha de creación</option>
                <option value="name">Nombre</option>
                <option value="progress">Progreso</option>
                <option value="pendingTasks">Tareas pendientes</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Contenido de proyectos -->
        <div v-if="filteredProjects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProjectCard
            v-for="project in filteredProjects"
            :key="project.id"
            :project="project"
          />
        </div>

        <!-- Estado vacío -->
        <div v-else class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen class="text-gray-400" :size="24" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {{ statusFilter ? 'No hay proyectos con ese estado' : 'No hay proyectos aún' }}
          </h3>
          <p class="text-gray-500 dark:text-gray-400 mb-6">
            {{ statusFilter ? 'Intenta cambiar los filtros o crear un nuevo proyecto.' : 'Crea tu primer proyecto para comenzar a organizar tus tareas.' }}
          </p>
          <BaseButton
            variant="primary"
            class="flex items-center space-x-2 mx-auto"
            @click="openNewProjectModal"
          >
            <Plus :size="16" />
            <span>Crear Proyecto</span>
          </BaseButton>
        </div>

        <!-- Modal para agregar/editar proyecto -->
        <ProjectModal
          v-model="showProjectModal"
          :project="editingProject"
          @save="handleSaveProject"
        />
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { FolderOpen, Plus, Filter } from 'lucide-vue-next'
import BaseButton from '../components/atoms/BaseButton.vue'
import PageHeader from '../components/molecules/PageHeader.vue'
import ProjectCard from '../components/molecules/ProjectCard.vue'
import ProjectModal from '../components/molecules/ProjectModal.vue'
import type { Project } from '../types/project'
import { useProjectsStore } from '../stores/projects'

// Meta tags para la página
useHead({
  title: 'Proyectos',
  meta: [
    { name: 'description', content: 'Gestiona y organiza tus proyectos de manera eficiente' }
  ]
})

// Configuración de página
definePageMeta({
  layout: 'default'
})

// Store
const projectsStore = useProjectsStore()

// Estado reactivo
const showProjectModal = ref(false)
const editingProject = ref<Project | null>(null)
const showFilters = ref(false)
const statusFilter = ref('')
const sortBy = ref('createdAt')
const isLoading = ref(true)

// Inicializar datos en el cliente
onMounted(() => {
  projectsStore.initializeData()
  isLoading.value = false
})

// Computed properties
const filteredProjects = computed(() => {
  let filtered = projectsStore.projects

  // Filtrar por estado
  if (statusFilter.value) {
    filtered = filtered.filter(project => project.status === statusFilter.value)
  }

  // Ordenar
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

// Métodos
const openNewProjectModal = () => {
  editingProject.value = null
  showProjectModal.value = true
}

const handleSaveProject = (project: Project) => {
  if (editingProject.value) {
    // Actualizar proyecto existente
    projectsStore.updateProject(project)
  } else {
    // Agregar nuevo proyecto
    projectsStore.addProject(project)
  }
}
</script> 