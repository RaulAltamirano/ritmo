<script setup lang="ts">
  import TestUIBadges from '../components/TestUIBadges.vue'
  import TestUIButtons from '../components/TestUIButtons.vue'
  import TestUICards from '../components/TestUICards.vue'
  import TestUIIcons from '../components/TestUIIcons.vue'
  import TestUIInputs from '../components/TestUIInputs.vue'
</script>

<template>
  <section id="components" class="mb-16">
    <div class="mb-8 border-b border-gray-200 pb-4 dark:border-gray-700">
      <h2
        class="m-0 text-3xl font-bold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
      >
        Core Components
      </h2>
      <p class="mt-2 font-sans leading-relaxed text-gray-600 dark:text-gray-400">
        Atomic and molecular components ready for production use
      </p>
    </div>

    <!-- Component grid -->
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <!-- Buttons -->
      <TestUIButtons />

      <!-- Cards -->
      <TestUICards />

      <!-- Inputs -->
      <TestUIInputs />

      <!-- Badges -->
      <TestUIBadges />

      <!-- Icons -->
      <TestUIIcons />
    </div>
  </section>
</template>
