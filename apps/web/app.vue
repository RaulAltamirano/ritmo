<template>
  <div id="app">
    <!-- Loading Screen - Theme-aware desde el inicio -->
    <div v-if="isInitialLoading" class="loading-screen">
      <div class="loading-content">
        <!-- Animated Ritmo logo -->
        <div class="logo-container">
          <svg class="logo-animated" width="48" height="48" viewBox="0 0 40 40" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <g class="logo-bars">
              <rect x="10" y="22" width="3" height="8" rx="1.5" class="bar bar-1" fill="currentColor" />
              <rect x="17" y="16" width="3" height="14" rx="1.5" class="bar bar-2" fill="currentColor" />
              <rect x="24" y="20" width="3" height="10" rx="1.5" class="bar bar-3" fill="currentColor" />
              <rect x="31" y="12" width="3" height="18" rx="1.5" class="bar bar-4" fill="currentColor" />
            </g>
          </svg>
        </div>

        <!-- Loading text with motivational quotes -->
        <div class="loading-text">
          <p class="loading-text-content">{{ currentQuote }}</p>
        </div>
      </div>
    </div>

    <!-- Main App Content - Nuxt 3 Native Structure -->
    <div :class="{ 'opacity-0': isInitialLoading, 'opacity-100': !isInitialLoading }"
      class="transition-opacity duration-300">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

// Importar estilos de transiciones avanzadas
import '~/assets/css/theme-transitions.css'

// Global loading state
const isInitialLoading = ref(true)
const currentQuoteIndex = ref(0)
const usedQuotes = ref<number[]>([])

// Motivational quotes collection
const motivationalQuotes = [
  "Every great achievement begins with a single step",
  "Focus on progress, not perfection",
  "Your time is your most valuable asset",
  "Small consistent actions lead to big results",
  "Success is the sum of small efforts repeated daily",
  "The future belongs to those who prepare for it today",
  "Productivity is not about doing more, but doing what matters",
  "Time management is life management",
  "Excellence is not a destination, it's a journey",
  "Your potential is limitless when you take action",
  "Great things never come from comfort zones",
  "The secret to getting ahead is getting started",
  "Don't watch the clock; do what it does. Keep going",
  "Success is walking from failure to failure with no loss of enthusiasm",
  "The way to get started is to quit talking and begin doing"
]

// Function to get random quote index
const getRandomQuoteIndex = () => {
  // If all quotes have been used, reset the used quotes array
  if (usedQuotes.value.length >= motivationalQuotes.length) {
    usedQuotes.value = []
  }

  // Get available quotes (not used yet)
  const availableQuotes = motivationalQuotes
    .map((_, index) => index)
    .filter(index => !usedQuotes.value.includes(index))

  // Select random quote from available ones
  const randomIndex = availableQuotes[Math.floor(Math.random() * availableQuotes.length)]

  // Mark this quote as used
  usedQuotes.value.push(randomIndex)

  return randomIndex
}

// Current quote computed
const currentQuote = computed(() => motivationalQuotes[currentQuoteIndex.value])

// El tema se maneja globalmente a través del plugin
// No necesitamos inicializarlo aquí

// Initialize app
onMounted(() => {
  // El tema ya se inicializa en nuxt.config.ts script inline

  // Start with a random quote
  currentQuoteIndex.value = getRandomQuoteIndex()

  // Rotate quotes every 1.5 seconds with random selection
  const quoteInterval = setInterval(() => {
    currentQuoteIndex.value = getRandomQuoteIndex()
  }, 1500)

  // Solo mostrar loading por un tiempo mínimo para transición suave
  setTimeout(() => {
    clearInterval(quoteInterval)
    isInitialLoading.value = false
  }, 3000) // Aumentado a 3 segundos para mostrar varias frases
})

// SSR compatibility - ensure consistent initial state
if (process.server) {
  // On server, use a fixed initial quote to avoid hydration mismatch
  currentQuoteIndex.value = 0
}
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  height: 100vh;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
}

/* CSS Custom Properties para evitar FOUC - Mejores prácticas 2025 */
:root {
  --loading-bg: #ffffff;
  --loading-text: #374151;
  --loading-logo: #2563eb;
}

.dark {
  --loading-bg: #111827;
  --loading-text: #9ca3af;
  --loading-logo: #60a5fa;
}

/* Prevenir FOUC - aplicar estilos base inmediatamente */
html {
  background-color: #ffffff;
  /* Fallback light */
  color: #374151;
}

/* Asegurar que el tema se aplique inmediatamente */
html.dark {
  background-color: #111827;
  color: #9ca3af;
}

html:not(.dark) {
  background-color: #ffffff;
  color: #374151;
}

/* Loading screen styles - Theme-aware */
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-color: var(--loading-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  text-align: center;
}

.loading-text-content {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--loading-text);
  letter-spacing: 0.02em;
  margin: 0;
  min-height: 1.2rem;
  animation: fadeInOut 1.5s ease-in-out;
  text-align: center;
  max-width: 350px;
  line-height: 1.3;
  opacity: 0.9;
}

/* Animated logo styles */
.logo-animated {
  color: var(--loading-logo);
  transition: color 0.3s ease;
}

.logo-bars {
  transition: all 0.3s ease-out;
}

.bar {
  fill: currentColor;
  transition: all 0.3s ease-out;
  animation: barPulse 1.5s ease-in-out infinite;
  transform-origin: bottom;
}

.bar-1 {
  animation-delay: 0s;
}

.bar-2 {
  animation-delay: 0.15s;
}

.bar-3 {
  animation-delay: 0.3s;
}

.bar-4 {
  animation-delay: 0.45s;
}

@keyframes barPulse {

  0%,
  100% {
    opacity: 0.4;
    transform: scaleY(0.8);
  }

  50% {
    opacity: 1;
    transform: scaleY(1.3);
  }
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }

  20% {
    opacity: 1;
    transform: translateY(0);
  }

  80% {
    opacity: 1;
    transform: translateY(0);
  }

  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}

/* Smooth transitions */
* {
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}
</style>
