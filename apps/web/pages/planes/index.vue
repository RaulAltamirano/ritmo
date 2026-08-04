<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <PageHeader
      title="My plans"
      subtitle="Define study paths, exam prep, habits, or wellness goals. Each plan groups tasks around one objective."
      actions
    >
      <template #actions>
        <BaseButton
          variant="outline"
          class="flex items-center gap-2"
          @click="showFilters = !showFilters"
        >
          <Filter :size="16" />
          <span>Filters</span>
        </BaseButton>

        <BaseButton
          variant="primary"
          class="flex items-center gap-2"
          @click="openNewProjectModal"
        >
          <Plus :size="16" />
          <span>New plan</span>
        </BaseButton>
      </template>
    </PageHeader>

    <BaseCard variant="elevated" size="lg" class="mb-8" :hoverable="false">
      <div
        class="-m-8 p-8 bg-gradient-to-br from-primary-500/12 via-primary-400/5 to-transparent dark:from-primary-500/20 dark:via-primary-600/10 rounded-3xl border border-primary-500/15 dark:border-primary-400/20"
      >
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div class="max-w-2xl">
            <h2
              class="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 dark:text-white"
            >
              What do you want to achieve?
            </h2>
            <p class="mt-2 text-base leading-relaxed text-gray-600 dark:text-gray-300">
              A plan can be learning a language, preparing for an exam, building a
              habit, or taking care of your health. Pick an idea to fill the search, or
              create a plan from scratch.
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
            label="Search your plans"
            placeholder="e.g. English, exam, habits, fitness…"
            :left-icon="Search"
            clearable
            autocomplete="off"
          />
        </div>
      </div>
    </BaseCard>

    <ClientOnly>
      <div
        v-if="isLoading"
        class="flex flex-col items-center justify-center py-16 gap-4"
      >
        <BaseSpinner size="lg" color="primary" />
        <p class="text-base text-gray-600 dark:text-gray-400">Loading your plans…</p>
      </div>

      <BaseCard
        v-else-if="loadError"
        variant="simple"
        size="md"
        class="mb-6"
        :hoverable="false"
      >
        <p class="text-base text-red-600 dark:text-red-400">{{ loadError }}</p>
        <BaseButton variant="outline" class="mt-4" @click="loadPlans">
          Retry
        </BaseButton>
      </BaseCard>

      <div v-else>
        <BaseCard
          v-if="showFilters"
          variant="simple"
          size="md"
          class="mb-6"
          :hoverable="false"
        >
          <div class="flex flex-wrap gap-4">
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                for="planes-filter-status"
                >Status</label
              >
              <select
                id="planes-filter-status"
                v-model="statusFilter"
                class="px-3 py-2 min-w-[12rem] border border-outline-strong rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-surface text-gray-900 dark:text-white"
              >
                <option value="">All statuses</option>
                <option value="activo">Active</option>
                <option value="planificado">Planned</option>
                <option value="pausado">Paused</option>
                <option value="completado">Completed</option>
              </select>
            </div>
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                for="planes-filter-sort"
                >Sort by</label
              >
              <select
                id="planes-filter-sort"
                v-model="sortBy"
                class="px-3 py-2 min-w-[12rem] border border-outline-strong rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-surface text-gray-900 dark:text-white"
              >
                <option value="createdAt">Created date</option>
                <option value="name">Name</option>
                <option value="progress">Progress</option>
                <option value="pendingTasks">Pending tasks</option>
              </select>
            </div>
          </div>
        </BaseCard>

        <div
          v-if="filteredProjects.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <ProjectCard
            v-for="project in filteredProjects"
            :key="project.id"
            :project="project"
          />
        </div>

        <BaseCard v-else variant="simple" size="md" :hoverable="false">
          <EmptyState
            :title="emptyTitle"
            :description="emptyDescription"
            :icon="Compass"
          >
            <BaseButton
              variant="primary"
              class="inline-flex items-center gap-2"
              @click="openNewProjectModal"
            >
              <Plus :size="16" />
              <span>Create my first plan</span>
            </BaseButton>
          </EmptyState>
        </BaseCard>

        <ProjectModal
          v-model="showProjectModal"
          :project="editingProject"
          :saving="isSaving"
          :error-message="saveError"
          @save="handleSaveProject"
        />
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
  import type { Project, ProjectFormData } from '@/types/project'

  useHead({
    title: 'My plans',
    meta: [
      {
        name: 'description',
        content: 'Study plans, exam prep, habits, and personal goals in one place.',
      },
    ],
  })

  definePageMeta({
    layout: 'default',
  })

  const inspirationChips = [
    { label: 'Languages', query: 'english' },
    { label: 'Exam prep', query: 'exam' },
    { label: 'Habits', query: 'habit' },
    { label: 'Health & wellness', query: 'health' },
  ] as const

  const projectsStore = useProjectsStore()

  const showProjectModal = ref(false)
  const editingProject = ref<Project | null>(null)
  const showFilters = ref(false)
  const statusFilter = ref('')
  const sortBy = ref('createdAt')
  const searchQuery = ref('')
  const isLoading = computed(() => projectsStore.loading && !showProjectModal.value)
  const loadError = computed(() =>
    showProjectModal.value ? null : projectsStore.error,
  )
  const isSaving = ref(false)
  const saveError = ref<string | null>(null)

  async function loadPlans() {
    await projectsStore.fetchPlans()
  }

  onMounted(() => {
    void loadPlans()
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
    if (statusFilter.value) return 'No plans with that status'
    if (searchQuery.value.trim()) return 'Nothing matches your search'
    return 'You do not have any plans yet'
  })

  const emptyDescription = computed(() => {
    if (statusFilter.value) {
      return 'Try another status, or create a new plan to keep moving.'
    }
    if (searchQuery.value.trim()) {
      return 'Adjust your words or clear the search filter to see all your plans.'
    }
    return 'Create a plan for a language, an exam, a habit, or a personal goal, and organize tasks around that objective.'
  })

  const openNewProjectModal = () => {
    editingProject.value = null
    saveError.value = null
    showProjectModal.value = true
  }

  const handleSaveProject = async (form: ProjectFormData) => {
    saveError.value = null
    if (editingProject.value) {
      projectsStore.updateProject({
        ...editingProject.value,
        name: form.name,
        description: form.description,
        status: form.status,
        color: form.color,
        updatedAt: new Date(),
      })
      showProjectModal.value = false
      return
    }

    isSaving.value = true
    try {
      const result = await projectsStore.createPlan(form)
      if (result.success) {
        showProjectModal.value = false
      } else {
        saveError.value = result.error
      }
    } finally {
      isSaving.value = false
    }
  }
</script>
