<script setup lang="ts">
  const route = useRoute()
  const id = route.params.id as string
  await navigateTo(`/planes/${encodeURIComponent(id)}`, { replace: true })
</script>

<template>
  <div class="min-h-[30vh]" aria-busy="true" />
</template>
