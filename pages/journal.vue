<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader
      title="Journal"
      subtitle="Personal journal and reflective notes"
      size="lg"
    />
    
    <!-- Content will be added here -->
    <div class="mt-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <p class="text-gray-600 dark:text-gray-400 text-center">
          Journal content will be implemented here.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Journal',
  description: 'Personal journal and reflective notes',
  requiresAuth: true
})
</script> 