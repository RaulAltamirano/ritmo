<template>
  <header
    class="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/90">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <div class="flex items-center space-x-4">
          <h1 class="m-0 text-2xl font-bold leading-tight tracking-tight text-gray-900 font-display dark:text-white">
            Ritmo UI
          </h1>
          <span
            class="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            v2.0
          </span>
        </div>

        <!-- Quick navigation -->
        <nav class="hidden space-x-6 md:flex">
          <a v-for="section in sections" :key="section.id" :href="`#${section.id}`"
            class="group relative text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            @click="handleSectionClick(section.id)">
            <span class="flex items-center gap-1">
              <span v-if="section.icon" class="text-base">{{ section.icon }}</span>
              <span>{{ section.name }}</span>
            </span>

            <!-- Tooltip -->
            <div v-if="section.description"
              class="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
              <div class="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                {{ section.description }}
              </div>
              <div
                class="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900">
              </div>
            </div>
          </a>
        </nav>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <BaseButton variant="ghost" size="sm" @click="toggleMobileMenu"
            :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </BaseButton>
        </div>

        <!-- Dark Mode Toggle in navbar -->
        <div class="flex items-center">
          <ClientOnly>
            <DarkModeToggle />
          </ClientOnly>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen"
        class="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <nav class="px-2 py-4 space-y-2">
          <a v-for="section in sections" :key="section.id" :href="`#${section.id}`"
            class="block px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 hover:bg-gray-50 rounded-md dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            @click="handleSectionClick(section.id)">
            <span class="flex items-center gap-2">
              <span v-if="section.icon" class="text-base">{{ section.icon }}</span>
              <span>{{ section.name }}</span>
            </span>
            <p v-if="section.description" class="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {{ section.description }}
            </p>
          </a>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '../../../components/atoms/BaseButton.vue'
import ClientOnly from '../../../components/atoms/ClientOnly.vue'
import DarkModeToggle from '../../../components/molecules/DarkModeToggle.vue'

interface Section {
  id: string
  name: string
  icon?: string
  description?: string
}

interface Props {
  sections: Section[]
}

interface Emits {
  (e: 'section-change', sectionId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const mobileMenuOpen = ref(false)

// Methods
const handleSectionClick = (sectionId: string) => {
  emit('section-change', sectionId)
  mobileMenuOpen.value = false

  // Smooth scroll to section
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
</script>

<style scoped>
/* Custom styles for header */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .bg-white\/90 {
    background: #ffffff !important;
    border-bottom: 2px solid #000000 !important;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .transition-colors {
    transition: none !important;
  }

  .scroll-into-view {
    scroll-behavior: auto !important;
  }
}

/* Focus visible styles */
a:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
