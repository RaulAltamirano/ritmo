import { ref, computed, type Ref, readonly } from 'vue'
import type { Task } from '../types/task'

export function useTaskFilters(tasks: Ref<Task[]>) {
  const selectedCategory = ref<string | null>(null)

  const availableCategories = computed(() => {
    const categories = new Set<string>()
    tasks.value.forEach(task => {
      if (task.category) {
        categories.add(task.category)
      }
    })
    return Array.from(categories).sort()
  })

  const filteredTasks = computed(() => {
    if (!selectedCategory.value) {
      return tasks.value
    }
    return tasks.value.filter(task => task.category === selectedCategory.value)
  })

  const setCategoryFilter = (category: string | null) => {
    selectedCategory.value = category
  }

  const clearFilters = () => {
    selectedCategory.value = null
  }

  return {
    selectedCategory: readonly(selectedCategory),
    availableCategories,
    filteredTasks,
    setCategoryFilter,
    clearFilters
  }
} 