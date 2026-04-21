<template>
  <div class="trophies-list">
    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Trophies</h4>

    <!-- Search and Filter Bar -->
    <div class="mb-4">
      <SearchBar v-model="searchQuery" v-model:filter-value="filter"
        placeholder="Search trophies by name or description..." :show-filter="true" :filter-options="filterOptions"
        @update:model-value="onSearchChange" @update:filter-value="onFilterChange" />
    </div>

    <BaseCard class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Trophy Item -->
        <div v-for="trophy in paginatedTrophies" :key="trophy.id"
          class="flex flex-col items-center p-4 bg-surface-raised rounded-lg hover:bg-surface-overlay transition-colors">
          <div class="w-12 h-12 mb-3 flex items-center justify-center">
            <Trophy :class="['w-8 h-8', trophy.earned ? 'text-yellow-500' : 'text-gray-400']" />
          </div>
          <h5 class="text-sm font-medium text-gray-900 dark:text-white text-center mb-1">
            {{ trophy.name }}
          </h5>
          <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
            {{ trophy.description }}
          </p>
          <div class="mt-2">
            <BaseBadge :variant="trophy.earned ? 'success' : 'secondary'" :content="trophy.earned ? 'Earned' : 'Locked'"
              :left-icon="trophy.earned ? 'check' : 'x'" size="xs" />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredTrophies.length === 0" class="text-center py-8">
        <Trophy class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500 dark:text-gray-400">
          {{
            searchQuery ? 'No trophies found matching your search' : 'No trophies yet'
          }}
        </p>
        <p class="text-sm text-gray-400 dark:text-gray-500">
          {{
            searchQuery
              ? 'Try adjusting your search terms'
              : 'Complete tasks to earn your first trophy!'
          }}
        </p>
      </div>

      <!-- Pagination -->
      <Pagination :current-page="currentPage" :total-pages="totalPages" :total-items="filteredTrophies.length"
        :items-per-page="itemsPerPage" item-label="trophies" @page-change="onPageChange" />
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import Pagination from '@/components/molecules/pagination/Pagination.vue'
import SearchBar from '@/components/molecules/search/SearchBar.vue'
import BaseBadge from '@ritmo/ui/components/atoms/feedback/BaseBadge.vue'
import BaseCard from '@ritmo/ui/components/atoms/layout/BaseCard.vue'
import { Trophy } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'

interface TrophyItem {
  id: number
  name: string
  description: string
  earned: boolean
}

interface Props {
  trophies: TrophyItem[]
}

const props = defineProps<Props>()

// Search and filter state
const searchQuery = ref('')
const filter = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(8)

const filterOptions = [
  { value: 'all', label: 'All Trophies' },
  { value: 'earned', label: 'Earned' },
  { value: 'locked', label: 'Locked' },
  { value: 'recent', label: 'Recently Earned' },
]

// Computed properties
const filteredTrophies = computed(() => {
  let filtered = props.trophies

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      trophy =>
        trophy.name.toLowerCase().includes(query) ||
        trophy.description.toLowerCase().includes(query),
    )
  }

  // Apply status filter
  if (filter.value !== 'all') {
    switch (filter.value) {
      case 'earned':
        filtered = filtered.filter(trophy => trophy.earned)
        break
      case 'locked':
        filtered = filtered.filter(trophy => !trophy.earned)
        break
      case 'recent':
        // Sort earned trophies first
        filtered = filtered.sort((a, b) => {
          if (a.earned && !b.earned) return -1
          if (!a.earned && b.earned) return 1
          return 0
        })
        break
    }
  }

  return filtered
})

const totalPages = computed(() =>
  Math.ceil(filteredTrophies.value.length / itemsPerPage.value),
)

const paginatedTrophies = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredTrophies.value.slice(start, end)
})

// Event handlers
const onSearchChange = () => {
  currentPage.value = 1
}

const onFilterChange = () => {
  currentPage.value = 1
}

const onPageChange = (page: number) => {
  currentPage.value = page
}

// Reset pagination when search or filter changes
watch([searchQuery, filter], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.trophies-list {
  @apply w-full;
}
</style>
