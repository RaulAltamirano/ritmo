<template>
  <div class="cognitive-phase-indicator w-full">
    <div class="timeline flex justify-center items-center gap-4 w-full overflow-x-auto overflow-y-hidden pb-3 pt-2 relative scrollbar-none">
      <div
        v-for="(phase, idx) in phases"
        :key="phase.name"
        class="phase flex flex-col items-center min-w-[64px] relative cursor-pointer select-none"
        :class="{ 'font-bold scale-110 z-20': idx === currentPhaseIndex }"
        :style="{ '--phase-color': phase.color }"
        @mouseenter="hoveredIndex = idx"
        @mouseleave="hoveredIndex = null"
        @focus="hoveredIndex = idx"
        @blur="hoveredIndex = null"
        tabindex="0"
      >
        <div class="ring-indicator relative flex items-center justify-center mb-1"
          :class="{
            'is-active': idx === currentPhaseIndex,
            'is-hovered': hoveredIndex === idx && idx !== currentPhaseIndex
          }"
        >
          <div class="icon-wrapper flex items-center justify-center rounded-full transition-all duration-150 shadow-sm"
            :class="[
              idx === currentPhaseIndex ? 'bg-[var(--phase-color)] text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200',
              hoveredIndex === idx && idx !== currentPhaseIndex ? 'ring-2 ring-[var(--phase-color)]' : '',
              'w-9 h-9 md:w-11 md:h-11'
            ]"
          >
            <component :is="phase.icon" class="phase-icon" :size="22" aria-hidden="true" />
          </div>
        </div>
        <span class="phase-keyword mt-1 text-xs md:text-sm font-semibold text-center transition-colors duration-150"
          :class="[
            idx === currentPhaseIndex ? 'text-[var(--phase-color)]' : 'text-gray-600 dark:text-gray-300',
            hoveredIndex === idx && idx !== currentPhaseIndex ? 'text-[var(--phase-color)]' : ''
          ]"
        >{{ phase.keyword }}</span>
        <transition name="fade-tooltip">
          <div
            v-if="hoveredIndex === idx"
            class="tooltip-bubble absolute z-30 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl px-5 py-3 text-sm left-1/2 -translate-x-1/2 mt-14 w-72 text-gray-800 dark:text-gray-100 animate-tooltip"
            :style="tooltipStyle(idx)"
          >
            <div class="tooltip-arrow absolute left-1/2 -translate-x-1/2 -top-3 w-6 h-3 overflow-hidden">
              <div class="w-4 h-4 bg-white dark:bg-gray-900 border-l border-t border-gray-200 dark:border-gray-700 rotate-45 mx-auto shadow-md"></div>
            </div>
            <div class="font-bold mb-1 text-base">{{ phase.name }}</div>
            <div class="mb-1 text-xs text-gray-500 dark:text-gray-400">Horas: {{ phase.start }}:00 - {{ phase.end }}:00</div>
            <div class="mb-2">{{ phase.description }}</div>
            <div class="mb-2 text-xs"><span class="font-semibold">Ideal para:</span> {{ phase.idealFor }}</div>
            <div v-if="phase.premium" class="inline-block bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 rounded px-2 py-0.5 text-xs font-semibold mr-2">Alto Premium</div>
            <div v-if="phase.intuitive" class="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded px-2 py-0.5 text-xs font-semibold">Altamente Intuitivo</div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Sun, Coffee, BookOpen, Activity, Utensils, Repeat, PenTool, Moon, Bed } from 'lucide-vue-next'

interface Phase {
  start: number
  end: number
  icon: any
  name: string
  keyword: string
  description: string
  idealFor: string
  color: string
  premium?: boolean
  intuitive?: boolean
}

const phases: Phase[] = [
  { start: 5, end: 7, icon: Coffee, name: 'Slow Activation Phase', keyword: 'Calm', description: 'Calm introspection, gentle alertness.', idealFor: 'Meditation, journaling, visualization', color: '#fde047', premium: false, intuitive: true },
  { start: 7, end: 9, icon: Sun, name: 'Morning Focus Peak', keyword: 'Focus', description: 'High attention, mental clarity.', idealFor: 'Technical reading, structured study', color: '#4ade80', premium: true, intuitive: false },
  { start: 9, end: 12, icon: Activity, name: 'Cognitive Performance Peak', keyword: 'Peak', description: 'Maximum focus, problem solving.', idealFor: 'Programming, logic, deep work', color: '#60a5fa', premium: true, intuitive: false },
  { start: 12, end: 13, icon: Utensils, name: 'Mild Fatigue Phase', keyword: 'Break', description: 'Transitional energy dip.', idealFor: 'Lunch, walking, passive tasks', color: '#fdba74', premium: false, intuitive: false },
  { start: 13, end: 15, icon: Repeat, name: 'Second Productivity Peak', keyword: 'Review', description: 'Good performance if recovered.', idealFor: 'Review, technical tasks, recap', color: '#38bdf8', premium: true, intuitive: false },
  { start: 15, end: 17, icon: PenTool, name: 'Creative/Verbal Window', keyword: 'Create', description: 'Verbal fluency and creativity.', idealFor: 'Writing, design, language output', color: '#a78bfa', premium: false, intuitive: true },
  { start: 17, end: 19, icon: BookOpen, name: 'Transition Phase', keyword: 'Reflect', description: 'Descending energy, reflection.', idealFor: 'Consolidation, active review, journaling', color: '#fdba74', premium: false, intuitive: true },
  { start: 19, end: 21, icon: Moon, name: 'Introspective Phase', keyword: 'Plan', description: 'Autobiographical memory, emotional integration.', idealFor: 'Slow reading, visualization, planning', color: '#fde047', premium: false, intuitive: true },
  { start: 21, end: 23, icon: Bed, name: 'Sleep Preparation', keyword: 'Sleep', description: 'Cortical activity decreases.', idealFor: 'Rest routine, sleep hygiene', color: '#a3a3a3', premium: false, intuitive: false },
]

const hoveredIndex = ref<number|null>(null)
const currentPhaseIndex = computed(() => {
  const hour = new Date().getHours() + new Date().getMinutes() / 60
  return phases.findIndex(phase => hour >= phase.start && hour < phase.end) !== -1
    ? phases.findIndex(phase => hour >= phase.start && hour < phase.end)
    : phases.length - 1
})

// Tooltip dinámico: calcula si hay espacio arriba, si no, lo muestra abajo
const tooltipPosition = ref<'top'|'bottom'>('bottom')
const tooltipCoords = ref({ x: 0, y: 0 })

function tooltipStyle(idx: number) {
  const el = document.querySelectorAll('.phase')[idx] as HTMLElement
  if (!el) return {}
  const rect = el.getBoundingClientRect()
  const tooltipHeight = 90 // px aprox
  const spaceAbove = rect.top
  const spaceBelow = window.innerHeight - rect.bottom
  tooltipPosition.value = spaceAbove > tooltipHeight + 16 ? 'top' : 'bottom'
  return {
    left: `${rect.left + rect.width / 2}px`,
    top: tooltipPosition.value === 'top'
      ? `${rect.top - tooltipHeight - 12}px`
      : `${rect.bottom + 12}px`,
    transform: 'translateX(-50%)',
    position: 'fixed' as const,
    pointerEvents: 'auto' as const,
  }
}

// Recalcula tooltip en resize/scroll
function updateTooltip() {
  if (hoveredIndex.value !== null) tooltipStyle(hoveredIndex.value)
}
onMounted(() => {
  window.addEventListener('scroll', updateTooltip, true)
  window.addEventListener('resize', updateTooltip)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateTooltip, true)
  window.removeEventListener('resize', updateTooltip)
})
</script>

<style scoped>
.cognitive-phase-indicator {
  width: 100%;
  overflow: hidden;
}
.timeline {
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}
.timeline::-webkit-scrollbar {
  display: none;
}
.ring-indicator {
  position: relative;
  width: 44px;
  height: 44px;
}
/* Tooltip styles */
.tooltip-bubble {
  box-shadow: 0 8px 32px 0 rgba(0,0,0,0.18), 0 1.5px 8px 0 rgba(0,0,0,0.10);
  border-radius: 1rem;
  pointer-events: auto;
  transition: box-shadow 0.2s, background 0.2s;
  min-width: 220px;
  max-width: 320px;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 1;
  z-index: 50;
}
.tooltip-arrow {
  pointer-events: none;
  height: 12px;
  width: 32px;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  position: absolute;
  z-index: 51;
}
.tooltip-arrow > div {
  width: 16px;
  height: 16px;
  margin: 0 auto;
  border-radius: 2px;
  transform: rotate(45deg) translateY(8px);
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
}
.fade-tooltip-enter-active, .fade-tooltip-leave-active {
  transition: opacity 0.18s cubic-bezier(0.4,0,0.2,1), transform 0.18s cubic-bezier(0.4,0,0.2,1);
}
.fade-tooltip-enter-from, .fade-tooltip-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}
.fade-tooltip-enter-to, .fade-tooltip-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  /* Asegura que el SVG no se corte arriba */
  padding-top: 2px;
  padding-bottom: 2px;
  overflow: visible;
}
.phase-icon {
  display: block;
  margin: 0 auto;
  /* Asegura que el SVG ocupe todo el espacio vertical */
  vertical-align: middle;
}
</style> 