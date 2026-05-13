<template>
  <div class="flex flex-wrap gap-1.5">
    <button
      class="tfilter-chip"
      :class="[
        selectedCategory === null
          ? 'tfilter-chip--active'
          : 'bg-surface/50 border-outline text-content-muted hover:bg-surface hover:text-content-secondary',
      ]"
      @click="$emit('filter-change', null)"
    >
      Todas
    </button>
    <button
      v-for="category in categories"
      :key="category"
      class="tfilter-chip"
      :class="[
        selectedCategory === category
          ? 'tfilter-chip--active'
          : 'bg-surface/50 border-outline text-content-muted hover:bg-surface hover:text-content-secondary',
      ]"
      @click="$emit('filter-change', selectedCategory === category ? null : category)"
    >
      {{ category }}
    </button>
  </div>
</template>

<script setup lang="ts">
  import type { TaskFiltersProps } from '@/types/task'

  defineProps<TaskFiltersProps>()

  defineEmits<{
    'filter-change': [category: string | null]
  }>()
</script>

<style scoped>
  .tfilter-chip {
    padding: 0.3125rem 0.75rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 500;
    border-width: 1px;
    border-style: solid;
    cursor: pointer;
    transition: all 0.14s ease;
    outline: none;
    white-space: nowrap;
  }

  .tfilter-chip--active {
    background: var(--ph, #0ea5e9);
    border-color: var(--ph, #0ea5e9);
    color: white;
  }

  .tfilter-chip--active:hover {
    opacity: 0.9;
  }
</style>
