<script setup lang="ts">
  import BaseButton from '../../../components/atoms/BaseButton.vue'

  // Methods
  const scrollToComponents = () => {
    const element = document.getElementById('components')
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  const scrollToTypography = () => {
    const element = document.getElementById('typography')
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  const scrollToStates = () => {
    const element = document.getElementById('states')
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }
</script>

<template>
  <div
    class="mb-8 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-blue-700 dark:from-blue-900/20 dark:to-indigo-900/20"
  >
    <div class="flex items-start space-x-4">
      <div
        class="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500"
      >
        <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div class="flex-1">
        <h3
          class="m-0 text-xl font-semibold leading-tight tracking-tight text-blue-900 font-display dark:text-blue-100"
        >
          Ritmo UI - Design System & Component Library
        </h3>
        <p class="mt-2 font-sans leading-relaxed text-blue-800 dark:text-blue-200">
          Explore our comprehensive collection of accessible, performant, and
          customizable UI components. Built with Vue 3, TypeScript, Tailwind CSS, and
          enhanced with VueUse integration.
        </p>

        <!-- Features Grid -->
        <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-green-500"></div>
            <span class="text-sm font-medium text-blue-800 dark:text-blue-200"
              >WCAG 2.2 Compliant</span
            >
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-blue-500"></div>
            <span class="text-sm font-medium text-blue-800 dark:text-blue-200"
              >Performance Optimized</span
            >
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-purple-500"></div>
            <span class="text-sm font-medium text-blue-800 dark:text-blue-200"
              >VueUse Enhanced</span
            >
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="mt-4 flex flex-wrap gap-4 text-sm">
          <div class="flex items-center gap-1">
            <span class="font-medium text-blue-900 dark:text-blue-100">18</span>
            <span class="text-blue-700 dark:text-blue-300">Composables</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="font-medium text-blue-900 dark:text-blue-100">25+</span>
            <span class="text-blue-700 dark:text-blue-300">Components</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="font-medium text-blue-900 dark:text-blue-100">100%</span>
            <span class="text-blue-700 dark:text-blue-300">TypeScript</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="font-medium text-blue-900 dark:text-blue-100">⚡</span>
            <span class="text-blue-700 dark:text-blue-300">Performance</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-4 flex flex-wrap gap-3">
          <BaseButton variant="primary" size="sm" @click="scrollToComponents">
            Explore Components
          </BaseButton>

          <BaseButton variant="outline" size="sm" @click="scrollToTypography">
            View Typography
          </BaseButton>

          <BaseButton variant="ghost" size="sm" @click="scrollToStates">
            Test States
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* Custom styles for banner */
  .bg-gradient-to-r {
    background: linear-gradient(to right, var(--tw-gradient-stops));
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .bg-gradient-to-r {
      background: #ffffff !important;
      border: 2px solid #000000 !important;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .scroll-into-view {
      scroll-behavior: auto !important;
    }
  }
</style>
