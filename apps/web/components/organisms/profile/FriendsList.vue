<template>
  <div class="friends-list">
    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
      All Your Friends
    </h4>

    <!-- Search and Filter Bar -->
    <div class="mb-4">
      <SearchBar
        v-model="searchQuery"
        v-model:filter-value="filter"
        placeholder="Search friends by name..."
        show-filter
        :filter-options="filterOptions"
        @update:model-value="onSearchChange"
        @update:filter-value="onFilterChange"
      />
    </div>

    <BaseCard class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Friend Item -->
        <div
          v-for="friend in paginatedFriends"
          :key="friend.id"
          class="flex items-center space-x-3 p-3 bg-surface-raised rounded-lg hover:bg-surface-overlay transition-colors"
        >
          <div
            class="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center"
          >
            <span class="text-white font-semibold text-sm">{{ friend.initials }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
              {{ friend.name }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
              {{ friend.status }}
            </p>
          </div>
          <div class="flex items-center space-x-1">
            <div
              class="w-2 h-2 rounded-full"
              :class="[friend.online ? 'bg-green-500' : 'bg-gray-400']"
            ></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredFriends.length === 0" class="text-center py-8">
        <Users class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500 dark:text-gray-400">
          {{ searchQuery ? 'No friends found matching your search' : 'No friends yet' }}
        </p>
        <p class="text-sm text-gray-400 dark:text-gray-500">
          {{
            searchQuery
              ? 'Try adjusting your search terms'
              : 'Start connecting with other users!'
          }}
        </p>
      </div>

      <!-- Pagination -->
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-items="filteredFriends.length"
        :items-per-page="itemsPerPage"
        item-label="friends"
        @page-change="onPageChange"
      />
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
  import Pagination from '@/components/molecules/pagination/Pagination.vue'
  import SearchBar from '@/components/molecules/search/SearchBar.vue'
  import BaseCard from '@ritmo/ui/components/atoms/layout/BaseCard.vue'
  import { Users } from 'lucide-vue-next'
  import { computed, ref, watch } from 'vue'

  interface Friend {
    id: number
    name: string
    initials: string
    status: string
    online: boolean
  }

  interface Props {
    friends: Friend[]
  }

  const props = defineProps<Props>()

  // Search and filter state
  const searchQuery = ref('')
  const filter = ref('all')
  const currentPage = ref(1)
  const itemsPerPage = ref(6)

  const filterOptions = [
    { value: 'all', label: 'All Friends' },
    { value: 'online', label: 'Online' },
    { value: 'offline', label: 'Offline' },
    { value: 'recent', label: 'Recently Active' },
  ]

  // Computed properties
  const filteredFriends = computed(() => {
    let filtered = props.friends

    // Apply search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(
        friend =>
          friend.name.toLowerCase().includes(query) ||
          friend.initials.toLowerCase().includes(query),
      )
    }

    // Apply status filter
    if (filter.value !== 'all') {
      switch (filter.value) {
        case 'online':
          filtered = filtered.filter(friend => friend.online)
          break
        case 'offline':
          filtered = filtered.filter(friend => !friend.online)
          break
        case 'recent':
          // Sort by most recent activity
          filtered = filtered.sort((a, b) => {
            if (a.online && !b.online) return -1
            if (!a.online && b.online) return 1
            return 0
          })
          break
      }
    }

    return filtered
  })

  const totalPages = computed(() =>
    Math.ceil(filteredFriends.value.length / itemsPerPage.value),
  )

  const paginatedFriends = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredFriends.value.slice(start, end)
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
  .friends-list {
    @apply w-full;
  }
</style>
