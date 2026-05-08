<template>
  <div v-if="totalPages > 1" class="pagination">
    <div class="flex items-center justify-between">
      <div class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ startItem }} to {{ endItem }} of {{ totalItems }} {{ itemLabel }}
      </div>
      <div class="flex items-center space-x-2">
        <BaseButton
          @click="$emit('page-change', Math.max(1, currentPage - 1))"
          :disabled="currentPage === 1"
          variant="secondary"
          size="sm"
        >
          Previous
        </BaseButton>
        <div class="flex items-center space-x-1">
          <BaseButton
            v-for="page in pageNumbers"
            :key="page"
            @click="$emit('page-change', page)"
            :variant="page === currentPage ? 'primary' : 'secondary'"
            size="sm"
            class="w-8 h-8 p-0"
          >
            {{ page }}
          </BaseButton>
        </div>
        <BaseButton
          @click="$emit('page-change', Math.min(totalPages, currentPage + 1))"
          :disabled="currentPage === totalPages"
          variant="secondary"
          size="sm"
        >
          Next
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import { computed } from 'vue'

  interface Props {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    itemLabel?: string
  }

  interface Emits {
    (e: 'page-change', page: number): void
  }

  const props = withDefaults(defineProps<Props>(), {
    itemLabel: 'items',
  })

  defineEmits<Emits>()

  const startItem = computed(() => (props.currentPage - 1) * props.itemsPerPage + 1)

  const endItem = computed(() =>
    Math.min(props.currentPage * props.itemsPerPage, props.totalItems),
  )

  const pageNumbers = computed(() => {
    const pages = []
    const total = props.totalPages
    const current = props.currentPage

    // Show up to 5 page numbers
    let start = Math.max(1, current - 2)
    const end = Math.min(total, start + 4)

    // Adjust start if we're near the end
    if (end - start < 4) {
      start = Math.max(1, end - 4)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  })
</script>

<style scoped>
  .pagination {
    @apply mt-6;
  }
</style>
