<template>
  <div class="mb-8">
    <!-- Imagen de fase cognitiva -->
    <div v-if="phaseData" class="relative w-full h-48 sm:h-64 mb-6 rounded-xl overflow-hidden">
      <img
        :src="phaseData.image"
        :alt="phaseData.label"
        class="object-cover w-full h-full transition-all duration-300"
        :class="[darkMode ? 'brightness-75' : 'brightness-90']"
      />
      <div
        class="absolute inset-0"
        :class="darkMode ? 'bg-black/40' : 'bg-white/30'"
      ></div>
      <div class="absolute bottom-4 left-6">
        <span
          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow"
          :class="darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'"
        >
          <span class="mr-2 text-lg">{{ phaseData.emoji }}</span>
          {{ phaseData.label }}
        </span>
      </div>
    </div>
    <!-- Sugerencia de la fase -->
    <div v-if="phaseData" class="mb-4 flex items-center gap-2">
      <span
        class="inline-block rounded-lg px-3 py-2 text-sm font-medium shadow"
        :class="darkMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-800'"
      >
        <span class="font-bold">Sugerencia:</span> {{ phaseData.suggestion }}
      </span>
    </div>
    <div 
      :class="[
        'flex flex-col gap-4',
        actions ? 'sm:flex-row sm:items-center sm:justify-between' : ''
      ]"
    >
      <!-- Título y subtítulo -->
      <div class="flex-1 min-w-0">
        <h1 
          :class="[
            'font-bold text-gray-900 dark:text-white',
            sizeClasses[size]
          ]"
        >
          {{ title }}
        </h1>
        <p 
          v-if="subtitle"
          :class="[
            'text-gray-600 dark:text-gray-400 mt-2',
            subtitleSizeClasses[size]
          ]"
        >
          {{ subtitle }}
        </p>
      </div>
      
      <!-- Acciones -->
      <div 
        v-if="actions"
        :class="[
          'flex items-center gap-3',
          actionsLayout === 'horizontal' ? 'flex-row' : 'flex-col sm:flex-row'
        ]"
      >
        <slot name="actions" />
      </div>
    </div>
    
    <!-- Breadcrumbs opcionales -->
    <nav 
      v-if="breadcrumbs && breadcrumbs.length > 0"
      class="mt-4"
      aria-label="Breadcrumb"
    >
      <ol class="flex items-center space-x-2 text-sm">
        <li 
          v-for="(crumb, index) in breadcrumbs" 
          :key="index"
          class="flex items-center"
        >
          <NuxtLink
            v-if="crumb.to && index < breadcrumbs.length - 1"
            :to="crumb.to"
            class="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {{ crumb.label }}
          </NuxtLink>
          <span 
            v-else
            :class="[
              index === breadcrumbs.length - 1 
                ? 'text-gray-900 dark:text-white font-medium' 
                : 'text-gray-500 dark:text-gray-400'
            ]"
          >
            {{ crumb.label }}
          </span>
          
          <ChevronRight 
            v-if="index < breadcrumbs.length - 1"
            class="ml-2 text-gray-400 dark:text-gray-600" 
            :size="16"
          />
        </li>
      </ol>
    </nav>
    
    <!-- Badges o tags opcionales -->
    <!-- 
    <div 
      v-if="badges && badges.length > 0"
      class="mt-4 flex flex-wrap gap-2"
    >
      <Badge
        v-for="badge in badges"
        :key="badge.id"
        :variant="badge.variant"
        :size="badge.size"
      >
        {{ badge.label }}
      </Badge>
    </div>
    -->
  </div>
</template>

<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import { computed } from 'vue'

interface Breadcrumb {
  label: string
  to?: string
}

interface Badge {
  id: string
  label: string
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  actions?: boolean
  actionsLayout?: 'horizontal' | 'vertical'
  breadcrumbs?: Breadcrumb[]
  badges?: Badge[]
}

interface PhaseData {
  key: string
  label: string
  emoji: string
  image: string
  suggestion: string
}

const props = withDefaults(defineProps<PageHeaderProps & { phaseKey?: string; darkMode?: boolean }>(), {
  size: 'lg',
  actions: false,
  actionsLayout: 'horizontal',
  phaseKey: undefined,
  darkMode: false
})

const sizeClasses = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl'
}

const subtitleSizeClasses = {
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
}

const phaseMap: Record<string, PhaseData> = {
  slow_activation: {
    key: 'slow_activation',
    label: 'Fase de activación lenta',
    emoji: '🟡',
    image: '/phases/slow_activation.jpg',
    suggestion: 'Ideal para meditación, journaling o visualización tranquila.'
  },
  morning_peak: {
    key: 'morning_peak',
    label: 'Cresta matutina de enfoque',
    emoji: '🟢',
    image: '/phases/morning_peak.jpg',
    suggestion: 'Aprovecha para lectura técnica o estudio estructurado.'
  },
  cognitive_peak: {
    key: 'cognitive_peak',
    label: 'Pico de rendimiento cognitivo',
    emoji: '🔵',
    image: '/phases/cognitive_peak.jpg',
    suggestion: 'Enfócate en programación, lógica o deep work.'
  },
  mild_fatigue: {
    key: 'mild_fatigue',
    label: 'Fase de fatiga leve',
    emoji: '🟠',
    image: '/phases/mild_fatigue.jpg',
    suggestion: 'Momento para comer, caminar o tareas pasivas.'
  },
  second_peak: {
    key: 'second_peak',
    label: 'Segundo pico de productividad',
    emoji: '🔵',
    image: '/phases/second_peak.jpg',
    suggestion: 'Revisión, tareas técnicas o repaso.'
  },
  creative_window: {
    key: 'creative_window',
    label: 'Ventana creativa / verbal',
    emoji: '🟣',
    image: '/phases/creative_window.jpg',
    suggestion: 'Ideal para escritura, diseño o output de idiomas.'
  },
  transition: {
    key: 'transition',
    label: 'Fase de transición',
    emoji: '🟠',
    image: '/phases/transition.jpg',
    suggestion: 'Consolidación, repaso activo o journaling.'
  },
  introspective: {
    key: 'introspective',
    label: 'Fase introspectiva',
    emoji: '🟡',
    image: '/phases/introspective.jpg',
    suggestion: 'Lectura lenta, visualización o planificación.'
  },
  sleep_prep: {
    key: 'sleep_prep',
    label: 'Preparación del sueño',
    emoji: '⚫',
    image: '/phases/sleep_prep.jpg',
    suggestion: 'Rutina de descanso e higiene del sueño.'
  }
}

const phaseData = computed(() => props.phaseKey ? phaseMap[props.phaseKey] : undefined)
const darkMode = computed(() => props.darkMode)
</script>

<style scoped>
/* Puedes agregar estilos adicionales si lo requieres */
</style> 