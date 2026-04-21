<script setup lang="ts">
import { computed, onMounted, onUnmounted, shallowRef } from 'vue'
import TestButtonPage from './pages/TestButtonPage.vue'
import TestModalPage from './pages/TestModalPage.vue'

function resolvePage(pathname: string) {
  if (pathname === '/test-modal' || pathname.startsWith('/test-modal/')) {
    return TestModalPage
  }
  if (pathname === '/test-button' || pathname.startsWith('/test-button/')) {
    return TestButtonPage
  }
  return null
}

const page = shallowRef(resolvePage(window.location.pathname))

function sync() {
  page.value = resolvePage(window.location.pathname) ?? page.value
}

onMounted(() => {
  window.addEventListener('popstate', sync)
})

onUnmounted(() => {
  window.removeEventListener('popstate', sync)
})

const isHome = computed(() => page.value === null)
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
    <main v-if="isHome" class="mx-auto max-w-lg space-y-4">
      <h1 class="text-xl font-semibold">Ritmo UI — E2E playground</h1>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Rutas usadas por Playwright:
      </p>
      <ul class="list-inside list-disc space-y-2 text-blue-600 dark:text-blue-400">
        <li><a class="underline" href="/test-modal">/test-modal</a></li>
        <li><a class="underline" href="/test-button">/test-button</a></li>
      </ul>
    </main>
    <component :is="page" v-else />
  </div>
</template>
