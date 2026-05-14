<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader
      title="Journal"
      subtitle="Personal journal and reflective notes"
      size="lg"
    />

    <!-- Content will be added here -->
    <div class="mt-8">
      <div class="bg-surface rounded-lg shadow-sm border border-outline p-6">
        <p class="text-gray-600 dark:text-gray-400 text-center">
          Journal content will be implemented here.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  // El tema se maneja globalmente a través del plugin
  // No necesitamos inicializarlo aquí

  definePageMeta({
    title: 'Journal',
    description: 'Personal journal and reflective notes',
    requiresAuth: true,
  })
</script>
