<template>
  <div class="search-bar">
    <div class="flex-1">
      <div class="relative">
        <Search
          class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
        />
        <input
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          type="text"
          :placeholder="placeholder"
          class="w-full pl-10 pr-4 py-2 border border-outline-strong rounded-lg bg-surface text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
    </div>
    <div v-if="showFilter" class="flex gap-2">
      <select
        :value="filterValue"
        @change="$emit('update:filterValue', $event.target.value)"
        class="px-3 py-2 border border-outline-strong rounded-lg bg-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        <option
          v-for="option in filterOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Search } from 'lucide-vue-next'

  interface FilterOption {
    value: string
    label: string
  }

  interface Props {
    modelValue: string
    filterValue?: string
    placeholder?: string
    showFilter?: boolean
    filterOptions?: FilterOption[]
  }

  interface Emits {
    (e: 'update:modelValue', value: string): void
    (e: 'update:filterValue', value: string): void
  }

  withDefaults(defineProps<Props>(), {
    placeholder: 'Search...',
    showFilter: false,
    filterOptions: () => [],
  })

  defineEmits<Emits>()
</script>

<style scoped>
  .search-bar {
    @apply flex flex-col sm:flex-row gap-4;
  }
</style>
