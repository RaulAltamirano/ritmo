<template>
  <li class="relative px-3.5 py-3 sm:px-4 sm:py-3.5">
    <div class="flex min-w-0 flex-col gap-3">
      <button
        type="button"
        :aria-label="`View progress for ${exercise.name}`"
        class="text-left text-sm font-semibold leading-snug text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        :class="{ 'font-bold': exercise.emphasis === 'main' }"
        @click="emit('open-progress')"
      >
        <span class="sr-only">Block {{ exercise.block }}. </span>
        {{ exercise.name }}
      </button>

      <p
        class="inline-flex max-w-full flex-wrap items-start gap-1.5 text-sm leading-normal text-content-secondary"
      >
        <Repeat2
          class="mt-0.5 h-3.5 w-3.5 shrink-0 text-content-muted"
          aria-hidden="true"
        />
        <span class="font-mono tracking-tight text-content">{{
          exercise.setsReps
        }}</span>
        <span>RPE {{ exercise.rpe }}</span>
      </p>

      <p v-if="lastSessionLine" class="text-xs text-content-muted">
        {{ lastSessionLine }}
      </p>

      <ol
        class="flex list-decimal flex-col gap-3 pl-5 marker:text-xs marker:text-content-muted"
      >
        <li v-for="set in setRows" :key="set.id">
          <SetLogRow
            :set="set"
            @update:set="onUpdateSet"
            @delete="onDeleteSet(set.id)"
          />
        </li>
      </ol>

      <button
        type="button"
        class="inline-flex min-h-11 w-fit items-center rounded-md border border-outline px-3 text-sm font-medium text-content-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        @click="onAddSet"
      >
        Add set
      </button>

      <details>
        <summary
          class="cursor-pointer text-sm font-medium text-content-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          Note
        </summary>
        <textarea
          :value="log?.note ?? ''"
          aria-label="Note"
          class="mt-2 min-h-20 w-full rounded-md border border-outline bg-surface px-2 py-1.5 text-sm text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          @input="onNoteInput"
        />
      </details>
    </div>

    <p
      v-if="showNextCue"
      class="mt-2 flex items-center gap-1.5 text-[11px] font-medium tracking-wide"
      :class="cueClass"
    >
      <Link2 class="h-3 w-3 shrink-0" aria-hidden="true" />
      Then, minimal rest
    </p>
  </li>
</template>

<script setup lang="ts">
  import { Link2, Repeat2 } from 'lucide-vue-next'
  import { computed } from 'vue'
  import SetLogRow from '~/components/molecules/SetLogRow.vue'
  import type { ExerciseEntry, ExerciseLog, LoadUnit, SetLog } from '~/types/training'
  import { emptySetLog, ensureSetRows, nextSetLogId } from '~/utils/trainingSetLog'

  const props = withDefaults(
    defineProps<{
      exercise: ExerciseEntry
      /** Shown between exercises inside a superset / triset / giant set. */
      showNextCue?: boolean
      cueClass?: string
      dayKey?: string
      log?: ExerciseLog | null
      lastSessionLine?: string | null
      lastUnit?: LoadUnit
    }>(),
    {
      showNextCue: false,
      cueClass: 'text-content-muted',
      dayKey: '',
      log: null,
      lastSessionLine: null,
      lastUnit: 'kg',
    },
  )

  const emit = defineEmits<{
    'update:log': [value: ExerciseLog]
    'open-progress': []
  }>()

  const setRows = computed(() =>
    ensureSetRows(props.log, props.exercise.setsReps, props.lastUnit),
  )

  function emitLog(sets: SetLog[], note: string | null = props.log?.note ?? null) {
    emit('update:log', {
      exerciseId: props.exercise.id,
      dayKey: props.dayKey,
      note,
      sets,
    })
  }

  function onUpdateSet(updated: SetLog) {
    emitLog(setRows.value.map(set => (set.id === updated.id ? updated : set)))
  }

  function onDeleteSet(id: string) {
    emitLog(
      setRows.value
        .filter(set => set.id !== id)
        .map((set, index) => ({ ...set, index: index + 1 })),
    )
  }

  function onAddSet() {
    const sets = setRows.value
    emitLog([
      ...sets,
      emptySetLog(sets.length + 1, props.lastUnit, nextSetLogId(sets)),
    ])
  }

  function onNoteInput(event: Event) {
    const { value } = event.target as HTMLTextAreaElement
    emitLog(setRows.value, value === '' ? null : value)
  }
</script>
