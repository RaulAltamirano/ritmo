<template>
  <BaseModal
    :is-open="gate.showEndDaySummary"
    title="Resumen del día"
    aria-label="Resumen del día"
    size="lg"
    @update:is-open="handleIsOpenUpdate"
  >
    <div class="space-y-6">
      <p class="text-sm text-content-secondary">{{ dateLabel }}</p>

      <div
        v-if="loading"
        class="space-y-3"
        role="status"
        aria-live="polite"
        aria-label="Cargando resumen del día"
      >
        <div class="h-28 animate-pulse rounded-2xl border border-outline bg-surface" />
        <div class="h-16 animate-pulse rounded-2xl border border-outline bg-surface" />
        <div class="h-16 animate-pulse rounded-2xl border border-outline bg-surface" />
      </div>

      <template v-else-if="loadError">
        <p
          role="alert"
          class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
        >
          {{ loadError }}
        </p>
        <BaseButton type="button" variant="outline" size="sm" @click="loadSessions">
          Reintentar
        </BaseButton>
      </template>

      <template v-else>
        <!-- Hero KPI -->
        <div
          class="relative overflow-hidden rounded-2xl border border-outline bg-surface p-5"
        >
          <div
            class="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-500/[0.07] via-transparent to-transparent"
            aria-hidden="true"
          />
          <div class="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <p
                class="text-[11px] font-medium uppercase tracking-[0.14em] text-content-secondary"
              >
                Tiempo de foco
              </p>
              <p
                class="mt-1 font-mono text-4xl font-semibold tracking-tight text-content tabular-nums"
              >
                {{ formatDurationSec(totalFocusSec) }}
              </p>
            </div>
            <div class="flex gap-2">
              <div
                class="min-w-[5.5rem] rounded-xl border border-outline bg-canvas/80 px-3 py-2 text-right backdrop-blur-sm"
              >
                <p class="text-[10px] uppercase tracking-wide text-content-secondary">
                  Descanso
                </p>
                <p class="mt-0.5 font-mono text-sm font-semibold tabular-nums text-content">
                  {{ formatDurationSec(totalBreakSec) }}
                </p>
              </div>
              <div
                class="min-w-[5.5rem] rounded-xl border border-outline bg-canvas/80 px-3 py-2 text-right backdrop-blur-sm"
              >
                <p class="text-[10px] uppercase tracking-wide text-content-secondary">
                  Bloques
                </p>
                <p class="mt-0.5 font-mono text-sm font-semibold tabular-nums text-content">
                  {{ rows.length }}
                </p>
              </div>
            </div>
          </div>

          <div
            v-if="rows.length > 0"
            class="relative mt-4 h-1.5 overflow-hidden rounded-full bg-outline/60"
            :title="`Foco ${focusSharePct}% · Descanso ${100 - focusSharePct}%`"
          >
            <div
              class="h-full rounded-full bg-primary-500 transition-[width] duration-500 ease-out"
              :style="{ width: `${focusSharePct}%` }"
            />
          </div>
          <p
            v-if="rows.length > 0"
            class="relative mt-2 text-[11px] text-content-secondary"
          >
            {{ focusSharePct }}% foco · {{ 100 - focusSharePct }}% descanso
          </p>
        </div>

        <p
          v-if="rows.length === 0"
          class="rounded-2xl border border-dashed border-outline px-4 py-10 text-center text-sm text-content-secondary"
        >
          Hoy no hay bloques registrados.
        </p>

        <!-- Timeline -->
        <ul
          v-else
          class="relative max-h-[min(48vh,26rem)] space-y-0 overflow-y-auto pr-1"
          role="list"
        >
          <li
            v-for="(row, index) in rows"
            :key="row.id"
            class="eds-row relative flex gap-3 pb-4 last:pb-0"
            :style="{ animationDelay: `${index * 40}ms` }"
          >
            <div class="flex w-3 shrink-0 flex-col items-center pt-1.5" aria-hidden="true">
              <span
                class="z-[1] h-2.5 w-2.5 rounded-full border-2 border-primary-500 bg-canvas"
              />
              <span
                v-if="index < rows.length - 1"
                class="mt-1 w-px flex-1 bg-outline"
              />
            </div>

            <div
              class="min-w-0 flex-1 rounded-2xl border border-outline bg-canvas px-3.5 py-3 transition-colors hover:border-outline-strong"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-content">
                    {{ row.taskTitle }}
                  </p>
                  <p class="mt-0.5 font-mono text-[11px] tabular-nums text-content-secondary">
                    {{ row.timeRangeLabel }}
                  </p>
                </div>
                <span
                  class="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide"
                  :class="stateBadgeClass(row.state)"
                >
                  {{ row.stateLabel }}
                </span>
              </div>

              <div class="mt-3 flex items-center gap-3">
                <div
                  class="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-outline/50"
                  aria-hidden="true"
                >
                  <div
                    class="h-full rounded-full bg-primary-500/80"
                    :style="{ width: `${Math.round(row.focusShare * 100)}%` }"
                  />
                </div>
                <div
                  class="flex shrink-0 gap-3 font-mono text-[11px] tabular-nums text-content-secondary"
                >
                  <span>
                    <span class="text-content">{{ row.focusLabel }}</span> foco
                  </span>
                  <span>
                    <span class="text-content">{{ row.breakLabel }}</span> descanso
                  </span>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </template>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
  import { listWorkSessions } from '@/services/workSessionsApi'
  import { useAuthStore } from '@/stores/auth'
  import { useSessionGateStore } from '@/stores/sessionGate'
  import { getCivilDateYmd } from '@/utils/civilDate'
  import {
    extractWorkSessionItems,
    mapWorkSessionToSummaryRow,
    stateBadgeClass,
    type EndDaySessionRow,
  } from '@/utils/endDaySummary'
  import { fetchErrorUserMessage } from '@/utils/parseFetchError'
  import { formatDurationSec } from '@/utils/workSessionDurations'
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import BaseModal from '@ritmo/ui/components/atoms/interactive/BaseModal.vue'
  import { computed, ref, watch } from 'vue'

  const gate = useSessionGateStore()
  const auth = useAuthStore()

  const loading = ref(false)
  const loadError = ref<string | null>(null)
  const rows = ref<EndDaySessionRow[]>([])
  const calendarYmd = ref('')

  const dateLabel = computed(() => {
    if (!calendarYmd.value) return 'Hoy'
    const [y, m, d] = calendarYmd.value.split('-').map(Number)
    if (!y || !m || !d) return calendarYmd.value
    return new Date(y, m - 1, d).toLocaleDateString('es', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  })

  const totalFocusSec = computed(() =>
    rows.value.reduce((n, r) => n + r.focusSec, 0),
  )
  const totalBreakSec = computed(() =>
    rows.value.reduce((n, r) => n + r.breakSec, 0),
  )
  const focusSharePct = computed(() => {
    const total = totalFocusSec.value + totalBreakSec.value
    if (total <= 0) return 100
    return Math.round((totalFocusSec.value / total) * 100)
  })

  function handleIsOpenUpdate(open: boolean) {
    if (!open) gate.closeEndDaySummary()
  }

  async function loadSessions() {
    loading.value = true
    loadError.value = null
    try {
      const tz = auth.user?.timezone ?? 'UTC'
      const ymd = getCivilDateYmd(tz)
      calendarYmd.value = ymd
      const res = await listWorkSessions({ from: ymd, to: ymd, limit: 100 })
      const now = new Date()
      const mapped = extractWorkSessionItems(res)
        .map(item => mapWorkSessionToSummaryRow(item, now))
        .filter((r): r is EndDaySessionRow => r !== null)
      mapped.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      )
      rows.value = mapped
    } catch (e) {
      rows.value = []
      loadError.value = fetchErrorUserMessage(e, 'No se pudo cargar el resumen.')
    } finally {
      loading.value = false
    }
  }

  watch(
    () => gate.showEndDaySummary,
    open => {
      if (open) void loadSessions()
      else {
        rows.value = []
        loadError.value = null
        loading.value = false
      }
    },
  )
</script>

<style scoped>
  @media (prefers-reduced-motion: no-preference) {
    .eds-row {
      animation: eds-fade-up 0.35s ease-out both;
    }
  }

  @keyframes eds-fade-up {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
