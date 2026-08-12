<template>
  <div ref="rootRef" class="flex flex-wrap items-start gap-2">
    <div class="flex min-w-0 flex-col">
      <label :for="repsId" class="mb-1 text-xs font-medium text-content-secondary">
        Reps
      </label>
      <input
        :id="repsId"
        :value="repsDraft"
        data-field="reps"
        aria-label="Reps"
        inputmode="numeric"
        type="text"
        autocomplete="off"
        :aria-invalid="Boolean(visibleErrors.reps)"
        class="min-h-11 w-16 rounded-md border border-outline bg-surface px-2 tabular-nums text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        @input="onInput('reps', $event)"
        @blur="onBlur('reps')"
      />
      <p v-if="visibleErrors.reps" class="mt-1 text-xs text-red-600 dark:text-red-400">
        {{ visibleErrors.reps }}
      </p>
    </div>

    <div class="flex min-w-0 flex-col">
      <label :for="rpeId" class="mb-1 text-xs font-medium text-content-secondary">
        RPE
      </label>
      <input
        :id="rpeId"
        :value="rpeDraft"
        data-field="rpe"
        aria-label="RPE"
        inputmode="decimal"
        type="text"
        autocomplete="off"
        :aria-invalid="Boolean(visibleErrors.rpe)"
        class="min-h-11 w-16 rounded-md border border-outline bg-surface px-2 tabular-nums text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        @input="onInput('rpe', $event)"
        @blur="onBlur('rpe')"
      />
      <p v-if="visibleErrors.rpe" class="mt-1 text-xs text-red-600 dark:text-red-400">
        {{ visibleErrors.rpe }}
      </p>
    </div>

    <div class="flex min-w-0 flex-col">
      <label :for="loadId" class="mb-1 text-xs font-medium text-content-secondary">
        Load
      </label>
      <input
        :id="loadId"
        :value="loadDraft"
        data-field="load"
        aria-label="Load"
        inputmode="decimal"
        type="text"
        autocomplete="off"
        :aria-invalid="Boolean(visibleErrors.load)"
        class="min-h-11 w-20 rounded-md border border-outline bg-surface px-2 tabular-nums text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        @input="onInput('load', $event)"
        @blur="onBlur('load')"
      />
      <p v-if="currentSet.unit === 'bw'" class="mt-1 text-xs text-content-muted">
        Extra kg (optional)
      </p>
      <p v-if="visibleErrors.load" class="mt-1 text-xs text-red-600 dark:text-red-400">
        {{ visibleErrors.load }}
      </p>
    </div>

    <div class="flex items-end self-stretch">
      <UnitChip :model-value="currentSet.unit" @update:model-value="onUnit" />
    </div>

    <div class="flex items-end gap-1 self-stretch">
      <button
        type="button"
        aria-label="Mark set complete"
        :aria-pressed="set.completed"
        class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-outline text-content-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        :class="set.completed ? 'border-brand bg-brand-subtle text-brand-text' : ''"
        @click="onComplete"
      >
        <Check class="h-4 w-4" aria-hidden="true" />
      </button>

      <div
        v-if="confirmingDelete"
        role="group"
        class="flex min-h-11 items-center gap-2 rounded-md border border-outline px-2"
      >
        <span class="text-xs font-medium text-content">Delete set?</span>
        <button
          type="button"
          class="text-sm font-medium text-red-600 dark:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          @click="emit('delete')"
        >
          Delete
        </button>
        <button
          type="button"
          class="text-sm font-medium text-content-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          @click="confirmingDelete = false"
        >
          Cancel
        </button>
      </div>
      <button
        v-else
        type="button"
        aria-label="Delete set"
        class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-outline text-content-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        @click="confirmingDelete = true"
      >
        <Trash2 class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Check, Trash2 } from 'lucide-vue-next'
  import { computed, nextTick, reactive, ref, useId, watch } from 'vue'
  import UnitChip from '~/components/molecules/UnitChip.vue'
  import type { LoadUnit, SetLog } from '~/types/training'
  import {
    completeSetErrors,
    isSetComplete,
    validateLoad,
    validateReps,
    validateRpe,
  } from '~/utils/trainingSetLog'

  type FieldName = 'reps' | 'rpe' | 'load'

  const props = defineProps<{
    set: SetLog
  }>()

  const emit = defineEmits<{
    'update:set': [value: SetLog]
    delete: []
  }>()

  const rootRef = ref<HTMLElement | null>(null)
  const baseId = useId()
  const repsId = `${baseId}-reps`
  const rpeId = `${baseId}-rpe`
  const loadId = `${baseId}-load`

  const repsDraft = ref(formatNum(props.set.reps))
  const rpeDraft = ref(formatNum(props.set.rpe))
  const loadDraft = ref(formatNum(props.set.load))
  const localUnit = ref<LoadUnit>(props.set.unit)
  const showErrors = ref(false)
  const confirmingDelete = ref(false)
  const touched = reactive({ reps: false, rpe: false, load: false })

  const currentSet = computed<SetLog>(() => ({
    ...props.set,
    reps: parseField(repsDraft.value),
    rpe: parseField(rpeDraft.value),
    load: parseField(loadDraft.value),
    unit: localUnit.value,
  }))

  const visibleErrors = computed(() => {
    const complete = completeSetErrors(currentSet.value)
    return {
      reps: errorFor('reps', complete.reps, validateReps(currentSet.value.reps)),
      rpe: errorFor('rpe', complete.rpe, validateRpe(currentSet.value.rpe)),
      load: errorFor(
        'load',
        complete.load,
        validateLoad(currentSet.value.load, currentSet.value.unit),
      ),
    }
  })

  watch(
    () => props.set.id,
    () => {
      repsDraft.value = formatNum(props.set.reps)
      rpeDraft.value = formatNum(props.set.rpe)
      loadDraft.value = formatNum(props.set.load)
      localUnit.value = props.set.unit
      showErrors.value = false
      confirmingDelete.value = false
      touched.reps = false
      touched.rpe = false
      touched.load = false
    },
  )

  function formatNum(value: number | null): string {
    return value === null ? '' : String(value)
  }

  function parseField(raw: string): number | null {
    const trimmed = raw.trim()
    if (trimmed === '') return null
    return Number(trimmed)
  }

  function errorFor(
    field: FieldName,
    completeError: string | null,
    blurError: string | null,
  ): string | null {
    if (showErrors.value) return completeError
    if (touched[field]) return blurError
    return null
  }

  function onInput(field: FieldName, event: Event) {
    const { value } = event.target as HTMLInputElement
    if (field === 'reps') repsDraft.value = value
    else if (field === 'rpe') rpeDraft.value = value
    else loadDraft.value = value
    emit('update:set', currentSet.value)
  }

  function onBlur(field: FieldName) {
    touched[field] = true
  }

  function onUnit(unit: LoadUnit) {
    localUnit.value = unit
    emit('update:set', currentSet.value)
  }

  async function onComplete() {
    const set = currentSet.value
    if (!isSetComplete(set)) {
      showErrors.value = true
      await nextTick()
      focusFirstInvalid(completeSetErrors(set))
      return
    }
    emit('update:set', { ...set, completed: true })
  }

  function focusFirstInvalid(errors: ReturnType<typeof completeSetErrors>) {
    const field = (['reps', 'rpe', 'load'] as const).find(name => errors[name])
    if (!field) return
    const input = rootRef.value?.querySelector<HTMLInputElement>(
      `[data-field="${field}"]`,
    )
    input?.focus()
  }
</script>
