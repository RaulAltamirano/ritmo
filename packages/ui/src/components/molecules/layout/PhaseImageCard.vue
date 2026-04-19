<template>
  <div class="relative">
    <!-- Contenedor de la imagen con overflow-hidden -->
    <div class="relative w-full h-32 sm:h-48 lg:h-64 mb-4 sm:mb-6 rounded-xl overflow-hidden shadow-lg group">
      <img :src="phaseData.image" :alt="phaseData.label"
        class="object-cover w-full h-full transition-all duration-700 ease-out group-hover:scale-105" :class="[
          currentDarkMode
            ? 'brightness-75 contrast-120 saturate-115'
            : 'brightness-100 contrast-105 saturate-110',
        ]" @error="handleImageError" />

      <!-- Overlay dinámico mejorado -->
      <div class="absolute inset-0 transition-all duration-500 ease-out" :class="currentDarkMode
        ? 'bg-gradient-to-b from-black/40 via-black/20 to-black/60'
        : 'bg-gradient-to-b from-white/30 via-white/15 to-white/40'
        "></div>

      <!-- Overlay de gradiente sutil mejorado -->
      <div class="absolute inset-0 bg-gradient-to-t transition-all duration-500" :class="currentDarkMode
        ? 'from-black/50 via-transparent to-transparent'
        : 'from-white/40 via-transparent to-transparent'
        "></div>

      <!-- Badge principal mejorado usando BaseBadge -->
      <div class="absolute bottom-4 sm:bottom-6 left-4 sm:left-6">
        <BaseBadge variant="outline" size="lg"
          class="shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-white/95 dark:bg-black/85 text-gray-900 dark:text-white border-white/40 dark:border-white/30 hover:bg-white/100 dark:hover:bg-black/95">
          <template #default>
            <span class="mr-2.5 text-lg sm:text-xl">{{ phaseData.emoji }}</span>
            {{ phaseData.label }}
          </template>
        </BaseBadge>
      </div>

      <!-- Indicador de progreso opcional -->
      <div v-if="phaseData?.progress !== undefined" class="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
        <div class="h-full transition-all duration-500 ease-out"
          :class="currentDarkMode ? 'bg-primary-400' : 'bg-primary-500'" :style="{ width: `${phaseData.progress}%` }">
        </div>
      </div>
    </div>

    <!-- Tooltips fuera del contenedor con overflow-hidden -->
    <div class="absolute top-4 sm:top-6 right-4 sm:right-6 flex items-center gap-3 sm:gap-4">
      <!-- Icono de tiempo con tooltip moderno -->
      <div class="relative">
        <BaseTooltip v-if="phaseData?.timeUntilNext" variant="info" size="lg" :delay="300" :duration="200"
          trigger-role="button" aria-live="polite">
          <template #trigger>
            <button type="button"
              class="w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all duration-300 hover:scale-110 text-white dark:text-white bg-transparent hover:bg-white/10 dark:hover:bg-black/20 focus:bg-white/10 dark:focus:bg-black/20 border-none outline-none focus:outline-none focus:ring-2 focus:ring-white/30 dark:focus:ring-white/20"
              aria-label="Ver tiempo restante">
              <BaseIcon :icon="Clock" size="sm" color="current" />
            </button>
          </template>

          <div class="space-y-3">
            <!-- Header moderno y minimalista -->
            <div class="flex items-center gap-3">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
                <BaseIcon :icon="Clock" size="sm" color="info" />
              </div>
              <div>
                <h3 class="font-semibold text-sm text-gray-900 dark:text-white">
                  Tiempo Restante
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">Fase actual</p>
              </div>
            </div>

            <!-- Contenido principal con diseño moderno -->
            <div class="text-center py-1">
              <div
                class="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-6 py-4 shadow-sm">
                <span class="font-bold text-2xl text-gray-900 dark:text-white">{{
                  phaseData.timeUntilNext
                }}</span>
              </div>
            </div>
          </div>
        </BaseTooltip>
      </div>

      <!-- Icono de sugerencias con tooltip moderno -->
      <div class="relative">
        <BaseTooltip v-if="phaseData?.suggestion" variant="warning" size="lg" :delay="300" :duration="200"
          trigger-role="button" aria-live="polite">
          <template #trigger>
            <button type="button"
              class="w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all duration-300 hover:scale-110 text-white dark:text-white bg-transparent hover:bg-white/10 dark:hover:bg-black/20 focus:bg-white/10 dark:focus:bg-black/20 border-none outline-none focus:outline-none focus:ring-2 focus:ring-white/30 dark:focus:ring-white/20"
              aria-label="Ver sugerencias para esta fase">
              <BaseIcon :icon="Lightbulb" size="sm" color="current" />
            </button>
          </template>

          <div class="space-y-3">
            <!-- Header moderno y minimalista -->
            <div class="flex items-center gap-3">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30">
                <BaseIcon :icon="Lightbulb" size="sm" color="warning" />
              </div>
              <div>
                <h3 class="font-semibold text-sm text-gray-900 dark:text-white">
                  Recomendación
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Basado en tu ritmo
                </p>
              </div>
            </div>

            <!-- Contenido principal con diseño moderno -->
            <div class="py-1">
              <div
                class="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 shadow-sm">
                <p class="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {{ phaseData.suggestion }}
                </p>
              </div>
            </div>
          </div>
        </BaseTooltip>
      </div>

      <!-- Icono de configuración con tooltip moderno -->
      <div class="relative">
        <BaseTooltip variant="info" size="lg" :delay="300" :duration="200" trigger-role="button" aria-live="polite">
          <template #trigger>
            <button type="button" @click="navigateToSettings"
              class="w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all duration-300 hover:scale-110 text-white dark:text-white bg-transparent hover:bg-white/10 dark:hover:bg-black/20 focus:bg-white/10 dark:focus:bg-black/20 border-none outline-none focus:outline-none focus:ring-2 focus:ring-white/30 dark:focus:ring-white/20"
              aria-label="Configurar imágenes de fases">
              <BaseIcon :icon="Settings" size="sm" color="current" />
            </button>
          </template>

          <div class="space-y-3">
            <!-- Header moderno y minimalista -->
            <div class="flex items-center gap-3">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
                <BaseIcon :icon="Settings" size="sm" color="info" />
              </div>
              <div>
                <h3 class="font-semibold text-sm text-gray-900 dark:text-white">
                  Configurar Imágenes
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Personalizar fases
                </p>
              </div>
            </div>

            <!-- Contenido principal con diseño moderno -->
            <div class="py-1">
              <div
                class="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 shadow-sm">
                <p class="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  Configura imágenes, ve galerías de otros usuarios y vota por tus
                  favoritas
                </p>
              </div>
            </div>
          </div>
        </BaseTooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDark } from '@vueuse/core'
import { Clock, Lightbulb, Settings } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import BaseIcon from '../../atoms/display/BaseIcon.vue'
import BaseBadge from '../../atoms/feedback/BaseBadge.vue'
import BaseTooltip from '../../atoms/interactive/BaseTooltip.vue'

interface PhaseData {
  label: string
  emoji: string
  image: string
  suggestion: string
  color?: string
  progress?: number
  timeUntilNext?: string
}

interface PhaseImageCardProps {
  phaseData: PhaseData
  darkMode?: boolean
}

const props = withDefaults(defineProps<PhaseImageCardProps>(), {
  darkMode: false,
})

// Detección automática del modo oscuro usando VueUse
const isDark = useDark()

// Estado para manejo de errores de imagen
const imageError = ref(false)
const fallbackImage =
  'https://plus.unsplash.com/premium_photo-1755882941142-5c8a5f27e2f3?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'

// Computed para determinar el modo actual (prioriza la prop, luego el sistema)
const currentDarkMode = computed(() => {
  // Si la prop darkMode está explícitamente definida, úsala
  if (props.darkMode !== undefined) {
    return props.darkMode
  }
  // Si no, usa la detección automática del sistema
  return isDark.value
})

// Método para manejar errores de imagen
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (img.src !== fallbackImage) {
    img.src = fallbackImage
    imageError.value = true
  }
}

// Método para navegar a la página de configuración de imágenes
const navigateToSettings = () => {
  // Navegar a la página de configuración de imágenes
  window.location.href = '/phase-images'
}
</script>

<style scoped>
/* Mejoras de calidad visual y transiciones */
.group:hover img {
  transform: scale(1.05);
}

/* Optimización de sombras para mejor rendimiento */
.shadow-xl {
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Mejoras en backdrop-blur para mejor calidad */
.backdrop-blur-md {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Mejoras en la imagen para evitar saltos */
img {
  will-change: transform;
  backface-visibility: hidden;
}

/* Optimización de gradientes */
.bg-gradient-to-b,
.bg-gradient-to-t {
  background-attachment: fixed;
}

/* Mejoras en el indicador de progreso */
.h-1 {
  background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent);
}

/* Optimización para modo oscuro */
.dark .shadow-black\/50 {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

/* Optimización para modo claro */
.shadow-gray-400\/30 {
  box-shadow: 0 25px 50px -12px rgba(156, 163, 175, 0.3);
}
</style>
