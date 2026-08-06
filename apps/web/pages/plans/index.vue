<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <PageHeader
      title="Plans"
      subtitle="Study paths, exam prep, habits, and goals — each plan groups tasks around one objective."
      :breadcrumbs="breadcrumbs"
      actions
    >
      <template #actions>
        <BaseButton variant="primary" @click="openCreateStudyPlanModal">
          <Plus :size="16" />
          <span>New plan</span>
        </BaseButton>
      </template>
    </PageHeader>

    <div class="py-3 bg-canvas border-b border-outline mb-6">
      <div class="flex flex-col lg:flex-row lg:items-center gap-3">
        <div class="w-full lg:max-w-xs">
          <BaseInput
            v-model="searchQuery"
            placeholder="Search plans…"
            :left-icon="Search"
            clearable
            autocomplete="off"
          />
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="chip in statusChips"
            :key="chip.value"
            type="button"
            :aria-pressed="statusFilter === chip.value"
            class="rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            :class="
              statusFilter === chip.value
                ? 'border-primary-500 bg-primary-500 text-white'
                : 'border-outline-strong bg-surface text-gray-700 dark:text-gray-300 hover:border-primary-500 hover:text-primary-700 dark:hover:text-primary-300'
            "
            @click="statusFilter = chip.value"
          >
            {{ chip.label }}
          </button>
        </div>

        <div class="lg:ml-auto">
          <label class="sr-only" for="plans-sort">Sort by</label>
          <select
            id="plans-sort"
            v-model="sortBy"
            class="px-3 py-2 min-w-[10rem] border border-outline-strong rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-surface text-gray-900 dark:text-white text-sm"
          >
            <option value="createdAt">Created</option>
            <option value="name">Name</option>
            <option value="progress">Progress</option>
            <option value="pendingTasks">Pending tasks</option>
          </select>
        </div>
      </div>
    </div>

    <ClientOnly>
      <div v-if="isLoading" class="space-y-2" aria-busy="true" aria-live="polite">
        <div
          v-for="n in 5"
          :key="n"
          class="h-14 animate-pulse rounded-lg bg-surface-overlay"
        />
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
        <div v-if="filteredProjects.length > 0" class="space-y-2">
          <PlanListRow
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
              v-if="!hasActiveFilters"
              variant="primary"
              @click="openCreateStudyPlanModal"
            >
              <Plus :size="16" />
              <span>New plan</span>
            </BaseButton>
          </EmptyState>
        </BaseCard>
      </div>
    </ClientOnly>

    <CreateStudyPlanModal
      :is-open="showCreateStudyPlanModal"
      :loading="isSaving"
      :error="saveError"
      @update:is-open="showCreateStudyPlanModal = $event"
      @close="showCreateStudyPlanModal = false"
      @submit="handleCreateStudyPlan"
    />
  </div>
</template>

<script setup lang="ts">
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import BaseCard from '@ritmo/ui/components/atoms/layout/BaseCard.vue'
  import BaseInput from '@ritmo/ui/components/atoms/forms/BaseInput.vue'
  import EmptyState from '@ritmo/ui/components/molecules/feedback/EmptyState.vue'
  import { Compass, Plus, Search } from 'lucide-vue-next'
  import { computed, onMounted, ref } from 'vue'
  import CreateStudyPlanModal from '@/components/organisms/CreateStudyPlanModal.vue'
  import PageHeader from '~/components/molecules/PageHeader.vue'
  import PlanListRow from '~/components/molecules/PlanListRow.vue'
  import { useBreadcrumbs } from '@/composables/shared/useBreadcrumbs'
  import { useProjectsStore } from '@/stores/projects'
  import type { StudyPlanIntake } from '@/types/studyPlan'
  import { studyPlanIntakeToProjectForm } from '@/utils/studyPlanIntake'

  useHead({
    title: 'Plans',
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

  const statusChips = [
    { value: '', label: 'All' },
    { value: 'activo', label: 'Active' },
    { value: 'planificado', label: 'Planned' },
    { value: 'pausado', label: 'Paused' },
    { value: 'completado', label: 'Completed' },
  ] as const

  const { breadcrumbs } = useBreadcrumbs()
  const projectsStore = useProjectsStore()

  const showCreateStudyPlanModal = ref(false)
  const statusFilter = ref('')
  const sortBy = ref('createdAt')
  const searchQuery = ref('')
  const isLoading = computed(
    () => projectsStore.loading && !showCreateStudyPlanModal.value,
  )
  const loadError = computed(() =>
    showCreateStudyPlanModal.value ? null : projectsStore.error,
  )
  const isSaving = ref(false)
  const saveError = ref<string | null>(null)

  async function loadPlans() {
    await projectsStore.fetchPlans()
  }

  onMounted(() => {
    void loadPlans()
  })

  const hasActiveFilters = computed(
    () => !!statusFilter.value || !!searchQuery.value.trim(),
  )

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
    if (hasActiveFilters.value) return 'No matching plans'
    return 'No plans yet'
  })

  const emptyDescription = computed(() => {
    if (statusFilter.value) {
      return 'Try another status, or clear the filters to see all your plans.'
    }
    if (searchQuery.value.trim()) {
      return 'Adjust your search or clear it to see all your plans.'
    }
    return 'Create a plan for a language, an exam, a habit, or a personal goal, and organize tasks around that objective.'
  })

  const openCreateStudyPlanModal = () => {
    saveError.value = null
    showCreateStudyPlanModal.value = true
  }

  const handleCreateStudyPlan = async (intake: StudyPlanIntake) => {
    saveError.value = null
    isSaving.value = true
    try {
      const form = studyPlanIntakeToProjectForm(intake)
      const result = await projectsStore.createPlan(form)
      if (result.success) {
        showCreateStudyPlanModal.value = false
      } else {
        saveError.value = result.error
      }
    } finally {
      isSaving.value = false
    }
  }
</script>
