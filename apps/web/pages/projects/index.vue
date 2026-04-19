<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header using PageHeader -->
    <PageHeader title="Projects" subtitle="Organize and manage your projects efficiently" :actions="true">
      <template #actions>
        <BaseButton variant="primary" class="flex items-center space-x-2" @click="openNewProjectModal">
          <Plus :size="16" />
          <span>New Project</span>
        </BaseButton>
      </template>
    </PageHeader>

    <ClientOnly>
      <!-- Loading state -->
      <div v-if="isLoading" class="text-center py-12">
        <div
          class="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Loading projects...
        </h3>
        <p class="text-gray-500 dark:text-gray-400">Preparing your workspace</p>
      </div>

      <!-- Content when not loading -->
      <div v-else>
        <!-- Filters -->
        <div v-if="showFilters"
          class="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="flex flex-wrap gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select v-model="statusFilter"
                class="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="in_progress">In Progress</option>
                <option value="planned">Planned</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort by</label>
              <select v-model="sortBy"
                class="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="createdAt">Creation date</option>
                <option value="name">Name</option>
                <option value="progress">Progress</option>
                <option value="pendingTasks">Pending tasks</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Projects content -->
        <div v-if="filteredProjects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProjectCard v-for="project in filteredProjects" :key="project.id" :project="project" />
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-12">
          <div
            class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen class="text-gray-400" :size="24" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {{ statusFilter ? 'No projects with that status' : 'No projects yet' }}
          </h3>
          <p class="text-gray-500 dark:text-gray-400 mb-6">
            {{
              statusFilter
                ? 'Try changing the filters or create a new project.'
                : 'Create your first project to start organizing your tasks.'
            }}
          </p>
          <BaseButton variant="primary" class="flex items-center space-x-2 mx-auto" @click="openNewProjectModal">
            <Plus :size="16" />
            <span>Create Project</span>
          </BaseButton>
        </div>

        <!-- Modal to add/edit project -->
        <ProjectModal v-model="showProjectModal" :project="editingProject" @save="handleSaveProject" />
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
import { FolderOpen, Plus } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import PageHeader from '~/components/molecules/PageHeader.vue'
import ProjectCard from '~/components/molecules/ProjectCard.vue'
import ProjectModal from '~/components/molecules/ProjectModal.vue'
import { useProjectsStore } from '@/stores/projects'
import type { Project } from '@/types/project'

// Page meta tags
useHead({
  title: 'Projects',
  meta: [
    { name: 'description', content: 'Organize and manage your projects efficiently' },
  ],
})

// Page configuration
definePageMeta({
  layout: 'default',
})

// Store
const projectsStore = useProjectsStore()

// Reactive state
const showProjectModal = ref(false)
const editingProject = ref<Project | null>(null)
const showFilters = ref(false)
const statusFilter = ref('')
const sortBy = ref('createdAt')
const isLoading = ref(true)

// Initialize data on client
onMounted(() => {
  projectsStore.initializeData()
  isLoading.value = false
})

// Computed properties
const filteredProjects = computed(() => {
  let filtered = projectsStore.projects

  // Filter by status
  if (statusFilter.value) {
    filtered = filtered.filter(project => project.status === statusFilter.value)
  }

  // Sort
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

// Methods
const openNewProjectModal = () => {
  editingProject.value = null
  showProjectModal.value = true
}

const handleSaveProject = (project: Project) => {
  if (editingProject.value) {
    // Update existing project
    projectsStore.updateProject(project)
  } else {
    // Add new project
    projectsStore.addProject(project)
  }
}
</script>
