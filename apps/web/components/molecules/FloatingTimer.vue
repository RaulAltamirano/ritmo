<template>
  <Teleport to="body">
    <div
      v-if="isTimerVisible"
      class="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] right-4 z-50 sm:right-6"
      role="status"
      aria-live="polite"
      :aria-label="ariaLabelMain"
    >
      <!-- Pill trigger -->
      <div
        class="cursor-pointer outline-none rounded-2xl"
        tabindex="0"
        role="button"
        :aria-expanded="isBreak ? undefined : showDetails"
        :aria-label="
          isBreak
            ? `Descanso: ${formatTime(timeLeft)} restante. Click para abrir el descanso`
            : `Timer ${activeTask?.name}: ${formatTime(timeLeft)} restante. Click para ${showDetails ? 'ocultar' : 'mostrar'} detalles`
        "
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
          <!-- Clock icon with critical halo -->
          <div class="ft-clock shrink-0" aria-hidden="true">
            <Transition name="ft-halo">
              <span v-if="isCritical" class="ft-halo-layer" aria-hidden="true">
                <span class="ft-ring ft-ring--1" />
                <span class="ft-ring ft-ring--2" />
              </span>
            </Transition>
            <Clock
              :size="18"
              class="ft-clock-icon transition-colors duration-200"
              :class="[iconClasses, { 'ft-clock-icon--critical': isCritical }]"
            />
          </div>

          <!-- Time + state label -->
          <div class="flex flex-col min-w-0 flex-1">
            <span
              class="font-mono text-xl font-bold leading-none tracking-wide transition-colors duration-200"
              :class="timeClasses"
            >
              {{ formatTime(timeLeft) }}
            </span>
            <span
              class="text-[11px] font-medium text-gray-400 dark:text-gray-500 min-w-0 truncate max-w-[10rem] sm:max-w-[14rem]"
              :title="pillSubtitleFull"
            >
              {{ pillSubtitle }}
            </span>
          </div>

          <!-- Action buttons -->
          <div class="flex items-center gap-0.5 shrink-0">
            <button
              class="w-11 h-11 inline-flex items-center justify-center rounded-[10px] border-0 bg-transparent cursor-pointer touch-manipulation transition-colors duration-150 active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-500"
              :class="pauseBtnClasses"
              :title="isPaused ? 'Reanudar timer' : 'Pausar timer'"
              :aria-label="isPaused ? 'Reanudar timer' : 'Pausar timer'"
              @click.stop="handlePause"
            >
              <Pause v-if="!isPaused" :size="15" aria-hidden="true" />
              <Play v-else :size="15" aria-hidden="true" />
            </button>
            <button
              v-if="isBreak"
              :class="ghostBtn"
              title="Saltar descanso"
              aria-label="Saltar descanso"
              @click.stop="handleSkipBreak"
            >
              <span class="text-[11px] font-semibold">Saltar</span>
            </button>
            <button
              v-if="canReset"
              :class="ghostBtn"
              title="Reiniciar timer"
              aria-label="Reiniciar timer"
              @click.stop="handleReset"
            >
              <RotateCcw :size="15" aria-hidden="true" />
            </button>
            <button
              :class="ghostBtn"
              title="Cerrar timer"
              aria-label="Cerrar timer"
              @click.stop="handleClose"
            >
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
            <span>{{ getTimeStatus() }} · {{ timerStore.workBlockStatusLabel }}</span>
          </div>
          <p class="mt-0.5 text-xs text-gray-400">{{ getProgressText() }}</p>
          <p
            v-if="sessionMode"
            class="mt-0.5 text-xs text-gray-400 flex items-center gap-1"
          >
            <span>Modo:</span>
            <component
              v-if="sessionModeIcon"
              :is="sessionModeIcon"
              :size="11"
              aria-hidden="true"
            />
            <span>{{ sessionMode }}</span>
          </p>
          <p v-if="sessionCategory" class="mt-0.5 text-xs text-gray-400">
            Categoría: {{ sessionCategory }}
          </p>
          <p v-if="remoteIdPreview" class="mt-0.5 text-xs text-gray-500 font-mono">
            Bloque: {{ remoteIdPreview }}
          </p>
          <p class="mt-0.5 text-xs text-gray-400">
            {{ isBreak ? 'Click para abrir el descanso' : 'Click para detalles' }}
          </p>
        </div>
      </Transition>

      <!-- Details panel -->
      <Transition name="ft-panel">
        <div
          v-if="showDetails"
          class="absolute bottom-[calc(100%+10px)] right-0 w-[min(280px,calc(100vw-2rem))] bg-surface/95 dark:bg-surface-raised/95 border border-outline-strong rounded-2xl shadow-xl backdrop-blur-md p-3.5 z-20"
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
            <button
              :class="ghostBtn"
              title="Cerrar"
              aria-label="Cerrar panel"
              @click="showDetails = false"
            >
              <X :size="15" aria-hidden="true" />
            </button>
          </div>

          <!-- Progress (sin cronómetro en el panel) -->
          <div v-if="totalTime" class="flex flex-col gap-1.5 mb-4">
            <ProgressStrip
              :progress="(totalTime - timeLeft) / totalTime"
              :color="fillColor"
              height-class="h-1.5"
              track-class="bg-surface-overlay dark:bg-surface-overlay"
              :aria-label="`${progressPercent}% completado`"
            />
            <p class="text-center text-[11px] text-gray-500 dark:text-gray-400">
              {{ progressPercent }}% completado
            </p>
          </div>

          <!-- Work session / bloque -->
          <dl
            class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1.5 mb-4 text-[12px] border-t border-gray-200/80 dark:border-gray-600/60 pt-3"
          >
            <dt class="text-gray-500 dark:text-gray-400 shrink-0">Estado</dt>
            <dd class="text-gray-800 dark:text-gray-200 font-medium text-right">
              {{ timerStore.workBlockStatusLabel }}
            </dd>
            <dt class="text-gray-500 dark:text-gray-400">Modo</dt>
            <dd
              class="text-gray-800 dark:text-gray-200 text-right truncate"
              :title="sessionMode || undefined"
            >
              <span
                v-if="sessionMode"
                class="inline-flex items-center gap-1 justify-end"
              >
                <component
                  v-if="sessionModeIcon"
                  :is="sessionModeIcon"
                  :size="13"
                  aria-hidden="true"
                />
                <span>{{ sessionMode }}</span>
              </span>
              <span v-else>—</span>
            </dd>
            <template v-if="sessionCategory">
              <dt class="text-gray-500 dark:text-gray-400">Categoría</dt>
              <dd
                class="text-gray-800 dark:text-gray-200 text-right truncate"
                :title="sessionCategory"
              >
                {{ sessionCategory }}
              </dd>
            </template>
            <dt class="text-gray-500 dark:text-gray-400">Inicio</dt>
            <dd class="text-gray-800 dark:text-gray-200 text-right tabular-nums">
              {{ sessionStartedLabel }}
            </dd>
            <dt class="text-gray-500 dark:text-gray-400">Pausa acum.</dt>
            <dd
              class="text-gray-800 dark:text-gray-200 text-right font-mono tabular-nums"
            >
              {{ pausedFormatted }}
            </dd>
          </dl>

          <!-- Actions -->
          <div class="flex gap-2">
            <button
              class="flex-1 h-11 rounded-[10px] text-sm font-medium border-0 cursor-pointer touch-manipulation bg-primary-500 text-white transition-colors duration-150 hover:bg-primary-600 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              @click="handlePause"
            >
              {{ isPaused ? 'Reanudar' : 'Pausar' }}
            </button>
            <button
              v-if="isBreak"
              class="px-4 h-11 rounded-[10px] text-sm font-medium border-0 cursor-pointer touch-manipulation bg-emerald-500 text-white transition-colors duration-150 hover:bg-emerald-600 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              @click="handleSkipBreak"
            >
              Saltar descanso
            </button>
            <button
              v-if="canReset"
              class="px-4 h-11 rounded-[10px] text-sm font-medium border-0 cursor-pointer touch-manipulation bg-surface-overlay text-gray-700 dark:text-gray-300 transition-colors duration-150 hover:bg-surface-raised dark:hover:bg-surface-overlay active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
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
  import { computed, ref, type Component } from 'vue'
  import {
    Clock,
    Pause,
    Play,
    RotateCcw,
    SlidersHorizontal,
    Timer,
    Waves,
    X,
  } from 'lucide-vue-next'
  import { useTimerStore } from '@/stores/timer'
  import { useSessionGateStore } from '@/stores/sessionGate'
  import {
    getModeDisplay,
    mapModeLabelToTimerMode,
    type WorkSessionMode,
  } from '@/composables/timer/timerPresets'
  import ProgressStrip from '@/components/atoms/ProgressStrip.vue'

  const MODE_ICON: Record<WorkSessionMode, Component> = {
    pomodoro: Timer,
    ultradian: Waves,
    custom: SlidersHorizontal,
  }

  const timerStore = useTimerStore()
  const sessionGate = useSessionGateStore()

  const showDetails = ref(false)
  const isHovered = ref(false)

  const activeTask = computed(() => timerStore.activeTask)
  const timeLeft = computed(() => timerStore.activeTask?.timeLeft ?? 0)
  const totalTime = computed(() => timerStore.activeTask?.totalTime ?? 0)
  const isPaused = computed(() => timerStore.isPaused)
  const isTimerVisible = computed(() => timerStore.isTimerVisible)
  const isBreak = computed(() => timerStore.phase === 'break')
  const isRemote = computed(() => Boolean(timerStore.remoteWorkSessionId))
  const canReset = computed(() => !isRemote.value)

  // Modo canónico derivado del label libre guardado en `activeTask.type`.
  const sessionModeKind = computed<WorkSessionMode | null>(() => {
    const raw = activeTask.value?.type?.trim()
    if (!raw) return null
    return mapModeLabelToTimerMode(raw)
  })

  // Label mostrado junto al icono: usa el raw si existe, o el canónico como fallback.
  const sessionMode = computed(() => {
    const raw = activeTask.value?.type?.trim()
    if (raw) return raw
    const kind = sessionModeKind.value
    return kind ? getModeDisplay(kind).label : ''
  })

  const sessionModeIcon = computed<Component | null>(() =>
    sessionModeKind.value ? MODE_ICON[sessionModeKind.value] : null,
  )
  const sessionCategory = computed(() => activeTask.value?.category?.trim() ?? '')
  const pausedFormatted = computed(() =>
    formatDurationSec(activeTask.value?.totalPausedTime ?? 0),
  )

  const sessionStartedLabel = computed(() => {
    const raw = activeTask.value?.startedAt
    if (!raw) return '—'
    const d = raw instanceof Date ? raw : new Date(raw)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleString('es', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  })

  const remoteIdPreview = computed(() => timerStore.remoteWorkSessionIdPreview)

  const pillSubtitle = computed(() => {
    const parts = [timerStore.workBlockStatusLabel, sessionMode.value].filter(Boolean)
    return parts.join(' · ') || getTimeStatus()
  })

  const pillSubtitleFull = computed(() => {
    const base = [getTimeStatus(), timerStore.workBlockStatusLabel, sessionMode.value]
      .filter(Boolean)
      .join(' · ')
    const extra = [
      sessionCategory.value && `Categoría: ${sessionCategory.value}`,
      remoteIdPreview.value && `WorkSession: ${remoteIdPreview.value}`,
    ]
      .filter(Boolean)
      .join(' | ')
    return extra ? `${base} — ${extra}` : base
  })

  const ariaLabelMain = computed(() => {
    const name = activeTask.value?.name ?? 'tarea'
    return `Timer: ${name}. ${formatTime(timeLeft.value)} restante. ${pillSubtitle.value}.`
  })

  const isCritical = computed(() => timeLeft.value <= 300)
  const isWarning = computed(() => timeLeft.value > 300 && timeLeft.value <= 600)
  const progressPercent = computed(() =>
    totalTime.value
      ? Math.round(((totalTime.value - timeLeft.value) / totalTime.value) * 100)
      : 0,
  )

  /* Shared ghost button classes */
  const ghostBtn =
    'w-11 h-11 inline-flex items-center justify-center rounded-[10px] border-0 bg-transparent cursor-pointer touch-manipulation transition-colors duration-150 active:scale-90 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-500/5 dark:hover:bg-primary-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-500'

  /* State-driven Tailwind classes */
  const pillClasses = computed(() => {
    if (isBreak.value)
      return 'bg-emerald-50/95 dark:bg-emerald-950/20 border-emerald-300/40 dark:border-emerald-500/35'
    if (isCritical.value)
      return 'bg-error-50/95 dark:bg-error-950/20 border-error-300/40 dark:border-error-500/35 critical-pulse'
    if (isWarning.value)
      return 'bg-warning-50/95 dark:bg-warning-950/20 border-warning-300/35 dark:border-warning-500/30'
    return 'bg-surface/95 dark:bg-surface-raised/95 border border-outline-strong'
  })

  const iconClasses = computed(() => {
    if (isBreak.value) return 'text-emerald-500 dark:text-emerald-400'
    if (isCritical.value) return 'text-error-500 dark:text-error-400'
    if (isWarning.value) return 'text-warning-500 dark:text-warning-400'
    return 'text-primary-500 dark:text-primary-400'
  })

  const timeClasses = computed(() => {
    if (isBreak.value) return 'text-emerald-700 dark:text-emerald-400'
    if (isCritical.value) return 'text-error-700 dark:text-error-400'
    if (isWarning.value) return 'text-warning-700 dark:text-warning-400'
    return 'text-gray-900 dark:text-gray-100'
  })

  const fillColor = computed(() => {
    if (isBreak.value) return '#10b981' // emerald-500
    if (isCritical.value) return '#ef4444' // error-500
    if (isWarning.value) return '#f97316' // warning-500
    return '#0ea5e9' // primary-500
  })

  const dotClasses = computed(() => {
    if (isBreak.value) return 'bg-emerald-500'
    if (isCritical.value) return 'bg-error-500'
    if (isWarning.value) return 'bg-warning-500'
    return 'bg-primary-500'
  })

  const pauseBtnClasses = computed(() => {
    if (isBreak.value)
      return 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
    if (isCritical.value) return 'text-error-500 hover:bg-error-500/10'
    if (isWarning.value) return 'text-warning-500 hover:bg-warning-500/10'
    return 'text-primary-600 dark:text-primary-400 hover:bg-primary-500/10'
  })

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const formatDurationSec = (sec: number): string => {
    const s = Math.max(0, Math.floor(sec))
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const r = s % 60
    if (h > 0) return `${h}h ${m}m ${r}s`
    if (m > 0) return `${m}m ${r}s`
    return `${r}s`
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

  const toggleDetails = () => {
    if (isBreak.value) {
      timerStore.openBreakModal()
      showDetails.value = false
      return
    }
    showDetails.value = !showDetails.value
  }
  const handlePause = () => {
    timerStore.isPaused ? timerStore.resumeTimer() : timerStore.pauseTimer()
  }
  const handleReset = () => {
    timerStore.resetTimer()
  }
  const handleSkipBreak = () => {
    if (timerStore.breakFinishInFlight) return
    void timerStore.skipBreak().catch(() => {
      /* store already notifies */
    })
  }
  const handleClose = async () => {
    // After natural finish, reflection owns the remote session — do not abandon.
    const awaitingFeedback =
      sessionGate.showFeedback ||
      Boolean(sessionGate.feedbackWorkSessionId) ||
      (Boolean(timerStore.remoteWorkSessionId) &&
        !timerStore.isRunning &&
        (timerStore.activeTask?.timeLeft ?? -1) === 0)

    if (awaitingFeedback) {
      timerStore.closeTimer()
      return
    }

    try {
      await timerStore.stopTimer()
    } catch {
      // stopTimer already notified on abandon failure
    }
  }
</script>

<style scoped>
  /* Pill ambient glow when critical — slow, never frantic. */
  .critical-pulse {
    animation: critical-glow 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes critical-glow {
    0%,
    100% {
      box-shadow: 0 4px 22px rgba(239, 68, 68, 0.12);
    }
    50% {
      box-shadow: 0 6px 30px rgba(239, 68, 68, 0.32);
    }
  }

  /* ── Clock + halo stack ──────────────────────────────────────────────── */

  .ft-clock {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
  }

  .ft-clock-icon {
    position: relative;
    z-index: 1;
  }

  .ft-clock-icon--critical {
    animation: clock-breath 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes clock-breath {
    0%,
    100% {
      filter: drop-shadow(0 0 3px rgba(239, 68, 68, 0.4));
      transform: scale(1);
    }
    50% {
      filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.75));
      transform: scale(1.08);
    }
  }

  /* Halo layer: two staggered rings expanding out of the clock center. */
  .ft-halo-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  .ft-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 18px;
    height: 18px;
    margin-top: -9px;
    margin-left: -9px;
    border-radius: 9999px;
    border: 1.5px solid rgba(239, 68, 68, 0.55);
    opacity: 0;
    transform: scale(0.55);
    animation: halo-expand 2s cubic-bezier(0.22, 0.7, 0.25, 1) infinite;
    will-change: transform, opacity;
  }

  /* Second ring staggered by half the period so the wave feels continuous. */
  .ft-ring--2 {
    animation-delay: -1s;
  }

  @keyframes halo-expand {
    0% {
      transform: scale(0.55);
      opacity: 0.6;
      border-width: 1.5px;
    }
    60% {
      opacity: 0.12;
    }
    100% {
      transform: scale(1.9);
      opacity: 0;
      border-width: 1px;
    }
  }

  /* Halo enter/leave — smooths the state transition so nothing pops. */
  .ft-halo-enter-active,
  .ft-halo-leave-active {
    transition:
      opacity 220ms ease,
      transform 220ms ease;
  }
  .ft-halo-enter-from,
  .ft-halo-leave-to {
    opacity: 0;
    transform: scale(0.85);
  }

  /* Vue Transition classes */
  .ft-fade-enter-active,
  .ft-fade-leave-active {
    transition:
      opacity 0.15s ease,
      transform 0.15s ease;
  }
  .ft-fade-enter-from,
  .ft-fade-leave-to {
    opacity: 0;
    transform: translateY(6px);
  }

  .ft-panel-enter-active {
    transition:
      opacity 0.18s ease,
      transform 0.18s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .ft-panel-leave-active {
    transition:
      opacity 0.14s ease,
      transform 0.14s ease;
  }
  .ft-panel-enter-from,
  .ft-panel-leave-to {
    opacity: 0;
    transform: translateY(8px) scale(0.97);
  }

  @media (prefers-reduced-motion: reduce) {
    .critical-pulse,
    .ft-clock-icon--critical,
    .ft-ring {
      animation: none;
    }
    /* Keep a static but visible cue in critical state. */
    .ft-clock-icon--critical {
      filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.55));
    }
    .ft-ring {
      opacity: 0.35;
      transform: scale(1.25);
    }
    .ft-ring--2 {
      display: none;
    }

    .ft-fade-enter-active,
    .ft-fade-leave-active,
    .ft-panel-enter-active,
    .ft-panel-leave-active,
    .ft-halo-enter-active,
    .ft-halo-leave-active {
      transition-duration: 0.01ms;
    }
  }
</style>
