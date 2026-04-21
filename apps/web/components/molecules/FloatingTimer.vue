<template>
  <Teleport to="body">
    <div
      v-if="isTimerVisible"
      class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
      :style="phaseVars"
      role="status"
      aria-live="polite"
      :aria-label="`Timer: ${formatTime(timeLeft)} restante`"
    >
      <!-- Pill trigger -->
      <div
        class="cursor-pointer outline-none rounded-2xl"
        tabindex="0"
        role="button"
        :aria-expanded="showDetails"
        :aria-label="`Timer ${activeTask?.name}: ${formatTime(timeLeft)} restante. Click para ${showDetails ? 'ocultar' : 'mostrar'} detalles`"
        @click="toggleDetails"
        @keydown.enter="toggleDetails"
        @keydown.space.prevent="toggleDetails"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
      >
        <div
          class="flex items-center gap-2.5 pl-3.5 pr-2 min-h-[56px] rounded-2xl border backdrop-blur-md shadow-lg transition-all duration-200"
          :class="pillClasses"
        >
          <!-- Clock icon -->
          <div class="relative flex items-center shrink-0" aria-hidden="true">
            <Clock :size="18" class="transition-colors duration-200" :class="iconClasses" />
            <span v-if="isCritical" class="ping-dot absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" aria-hidden="true" />
          </div>

          <!-- Time + state label -->
          <div class="flex flex-col min-w-0 flex-1">
            <span
              class="font-mono text-xl font-bold leading-none tracking-wide transition-colors duration-200"
              :class="timeClasses"
            >
              {{ formatTime(timeLeft) }}
            </span>
            <span class="text-[11px] font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap" :title="getTimeStatus()">
              {{ getTimeStatus() }}
            </span>
          </div>

          <!-- Mini progress -->
          <div
            v-if="totalTime"
            class="w-12 h-1 rounded-full bg-gray-200/80 dark:bg-gray-700/80 shrink-0 overflow-hidden"
            role="progressbar"
            :aria-valuenow="progressPercent"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="`${progressPercent}% completado`"
          >
            <div
              class="h-full rounded-full transition-[width] duration-1000 ease-out"
              :class="fillClasses"
              :style="{ width: `${(timeLeft / totalTime) * 100}%` }"
            />
          </div>

          <!-- Action buttons -->
          <div class="flex items-center gap-0.5 shrink-0">
            <button
              class="w-11 h-11 inline-flex items-center justify-center rounded-[10px] border-0 bg-transparent cursor-pointer touch-manipulation transition-colors duration-150 active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ph)]"
              :class="pauseBtnClasses"
              :title="isPaused ? 'Reanudar timer' : 'Pausar timer'"
              :aria-label="isPaused ? 'Reanudar timer' : 'Pausar timer'"
              @click.stop="handlePause"
            >
              <Pause v-if="!isPaused" :size="15" aria-hidden="true" />
              <Play v-else :size="15" aria-hidden="true" />
            </button>
            <button :class="ghostBtn" title="Reiniciar timer" aria-label="Reiniciar timer" @click.stop="handleReset">
              <RotateCcw :size="15" aria-hidden="true" />
            </button>
            <button :class="ghostBtn" title="Cerrar timer" aria-label="Cerrar timer" @click.stop="handleClose">
              <X :size="15" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <!-- Hover tooltip -->
      <Transition name="ft-fade">
        <div
          v-if="isHovered && !showDetails"
          class="absolute bottom-[calc(100%+10px)] right-0 bg-gray-900 dark:bg-gray-800 text-gray-100 text-[13px] rounded-[10px] px-3 py-2 whitespace-nowrap shadow-lg border border-gray-700/80 dark:border-gray-600/60 pointer-events-none z-10"
          role="tooltip"
        >
          <div class="flex items-center gap-1.5 font-medium">
            <Clock :size="11" aria-hidden="true" />
            <span>{{ getTimeStatus() }}</span>
          </div>
          <p class="mt-0.5 text-xs text-gray-400">{{ getProgressText() }}</p>
          <p class="mt-0.5 text-xs text-gray-400">Click para detalles</p>
        </div>
      </Transition>

      <!-- Details panel -->
      <Transition name="ft-panel">
        <div
          v-if="showDetails"
          class="absolute bottom-[calc(100%+10px)] right-0 w-[min(280px,calc(100vw-2rem))] bg-white/95 dark:bg-gray-800/95 border border-gray-200/80 dark:border-gray-700/70 rounded-2xl shadow-xl backdrop-blur-md p-3.5 z-20"
          role="dialog"
          aria-labelledby="ft-panel-title"
        >
          <!-- Task + close -->
          <div class="flex items-center justify-between gap-2 mb-3.5">
            <p
              id="ft-panel-title"
              class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex-1"
              :title="activeTask?.name"
            >
              {{ activeTask?.name }}
            </p>
            <button :class="ghostBtn" title="Cerrar" aria-label="Cerrar panel" @click="showDetails = false">
              <X :size="15" aria-hidden="true" />
            </button>
          </div>

          <!-- Big time -->
          <div class="flex items-center justify-center gap-2.5 mb-4">
            <span class="w-2 h-2 rounded-full shrink-0" :class="dotClasses" />
            <span class="font-mono text-4xl font-bold leading-none tracking-wide" :class="timeClasses">
              {{ formatTime(timeLeft) }}
            </span>
            <span class="text-xs text-gray-400 dark:text-gray-500 self-end pb-1">restante</span>
          </div>

          <!-- Progress -->
          <div v-if="totalTime" class="flex flex-col gap-1.5 mb-4">
            <div
              class="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700/80 overflow-hidden"
              role="progressbar"
              :aria-valuenow="progressPercent"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="`${progressPercent}% completado`"
            >
              <div
                class="h-full rounded-full transition-[width] duration-1000 ease-out"
                :class="fillClasses"
                :style="{ width: `${((totalTime - timeLeft) / totalTime) * 100}%` }"
              />
            </div>
            <div class="flex justify-between text-[11px] text-gray-400 dark:text-gray-500">
              <span>{{ progressPercent }}%</span>
              <span class="font-mono">{{ formatTime(totalTime - timeLeft) }} / {{ formatTime(totalTime) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button
              class="flex-1 h-11 rounded-[10px] text-sm font-medium border-0 cursor-pointer touch-manipulation bg-[var(--ph)] text-white transition-[filter] duration-150 hover:brightness-110 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ph)]"
              @click="handlePause"
            >
              {{ isPaused ? 'Reanudar' : 'Pausar' }}
            </button>
            <button
              class="px-4 h-11 rounded-[10px] text-sm font-medium border-0 cursor-pointer touch-manipulation bg-surface-overlay/70 text-gray-700 dark:text-gray-300 transition-colors duration-150 hover:bg-gray-200 dark:hover:bg-gray-600/70 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ph)]"
              @click="handleReset"
            >
              Reiniciar
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Clock, Pause, Play, RotateCcw, X } from 'lucide-vue-next'
import { useTimerStore } from '@/stores/timer'
import { useCircadian } from '@/composables/useCircadian'

const timerStore = useTimerStore()
const { getPhaseDataForHeader } = useCircadian({ autoRefresh: true, refreshInterval: 60000 })

const showDetails = ref(false)
const isHovered = ref(false)

const activeTask = computed(() => timerStore.activeTask)
const timeLeft = computed(() => timerStore.activeTask?.timeLeft || 0)
const totalTime = computed(() => timerStore.activeTask?.totalTime || 0)
const isPaused = computed(() => timerStore.isPaused)
const isTimerVisible = computed(() => timerStore.isTimerVisible)

const isCritical = computed(() => timeLeft.value <= 300)
const isWarning = computed(() => timeLeft.value > 300 && timeLeft.value <= 600)
const progressPercent = computed(() =>
  totalTime.value ? Math.round(((totalTime.value - timeLeft.value) / totalTime.value) * 100) : 0,
)

const phaseVars = computed(() => {
  const color = (getPhaseDataForHeader.value as any)?.color || '#0ea5e9'
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color)
  const r = m ? Number.parseInt(m[1], 16) : 14
  const g = m ? Number.parseInt(m[2], 16) : 165
  const b = m ? Number.parseInt(m[3], 16) : 233
  return { '--ph': color, '--ph-r': r, '--ph-g': g, '--ph-b': b }
})

/* Shared ghost button classes */
const ghostBtn = 'w-11 h-11 inline-flex items-center justify-center rounded-[10px] border-0 bg-transparent cursor-pointer touch-manipulation transition-colors duration-150 active:scale-90 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-black/5 dark:hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ph)]'

/* State-driven Tailwind classes */
const pillClasses = computed(() => {
  if (isCritical.value)
    return 'bg-red-50/95 dark:bg-red-950/20 border-red-300/40 dark:border-red-500/35 critical-pulse'
  if (isWarning.value)
    return 'bg-orange-50/95 dark:bg-orange-950/20 border-orange-300/35 dark:border-orange-500/30'
  return 'bg-white/95 dark:bg-gray-800/95 border-gray-200/70 dark:border-gray-700/70'
})

const iconClasses = computed(() => {
  if (isCritical.value) return 'text-red-500 dark:text-red-400'
  if (isWarning.value) return 'text-orange-500 dark:text-orange-400'
  return 'text-[var(--ph)]'
})

const timeClasses = computed(() => {
  if (isCritical.value) return 'text-red-700 dark:text-red-400'
  if (isWarning.value) return 'text-orange-700 dark:text-orange-400'
  return 'text-gray-900 dark:text-gray-100'
})

const fillClasses = computed(() => {
  if (isCritical.value) return 'bg-red-500'
  if (isWarning.value) return 'bg-orange-500'
  return 'bg-[var(--ph)]'
})

const dotClasses = computed(() => {
  if (isCritical.value) return 'bg-red-500'
  if (isWarning.value) return 'bg-orange-500'
  return 'bg-[var(--ph)]'
})

const pauseBtnClasses = computed(() => {
  if (isCritical.value) return 'text-red-500 hover:bg-red-500/10'
  if (isWarning.value) return 'text-orange-500 hover:bg-orange-500/10'
  return 'text-[var(--ph)] phase-btn-hover'
})

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const getTimeStatus = (): string => {
  if (isCritical.value) return 'Crítico'
  if (isWarning.value) return 'Atención'
  return 'Normal'
}

const getProgressText = (): string => {
  if (!totalTime.value) return 'Timer en progreso'
  return `${progressPercent.value}% completado`
}

const toggleDetails = () => { showDetails.value = !showDetails.value }
const handlePause = () => { timerStore.isPaused ? timerStore.resumeTimer() : timerStore.pauseTimer() }
const handleReset = () => { timerStore.resetTimer() }
const handleClose = () => { timerStore.closeTimer() }
</script>

<style scoped>
/* Phase-aware hover — needs CSS var, can't do with Tailwind alone */
.phase-btn-hover:hover {
  background: rgba(var(--ph-r, 14), var(--ph-g, 165), var(--ph-b, 233), 0.1);
}

/* Critical pill pulse */
.critical-pulse {
  animation: critical-glow 1.2s ease-in-out infinite;
}

@keyframes critical-glow {
  0%, 100% { box-shadow: 0 4px 24px rgba(239, 68, 68, 0.1); }
  50%       { box-shadow: 0 4px 28px rgba(239, 68, 68, 0.28); }
}

/* Ping dot on clock icon */
.ping-dot {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% { transform: scale(1.8); opacity: 0; }
}

/* Vue Transition classes */
.ft-fade-enter-active, .ft-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.ft-fade-enter-from, .ft-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.ft-panel-enter-active {
  transition: opacity 0.18s ease, transform 0.18s cubic-bezier(0.22, 1, 0.36, 1);
}
.ft-panel-leave-active {
  transition: opacity 0.14s ease, transform 0.14s ease;
}
.ft-panel-enter-from, .ft-panel-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .critical-pulse, .ping-dot { animation: none; }
  .ft-fade-enter-active, .ft-fade-leave-active,
  .ft-panel-enter-active, .ft-panel-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
