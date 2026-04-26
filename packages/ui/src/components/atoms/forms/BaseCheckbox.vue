<script setup lang="ts">
  import { useColors } from '../../../composables/useColors'
  import { useId } from '../../../composables/useId'
  import { useTypography } from '../../../composables/useTypography'
  import { AlertCircle, Check, Minus } from 'lucide-vue-next'
  import { computed, ref, watch } from 'vue'

  interface BaseCheckboxProps {
    modelValue: boolean
    label: string
    description?: string
    disabled?: boolean
    required?: boolean
    error?: string | false
    name?: string
    id?: string
    value?: string
    indeterminate?: boolean
    hint?: string
    ariaLabel?: string
  }

  const props = withDefaults(defineProps<BaseCheckboxProps>(), {
    disabled: false,
    required: false,
    indeterminate: false,
    hint: '',
    ariaLabel: '',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    change: [value: boolean]
    focus: []
    blur: []
  }>()

  const checkboxRef = ref<HTMLInputElement | null>(null)

  // Usar tipografía y colores unificados
  const { getVariantClasses, getLabelTypography: getLabelTypographyFn } =
    useTypography()
  const {
    getTextSemantic,
    getBorderSemantic,
    getFormColors,
    getAlertColors,
    getSurface,
    getColor,
    getBorderColor,
    getTextColor,
  } = useColors()

  // Funciones de tipografía
  const getLabelTypography = () =>
    `${getLabelTypographyFn('md').value} ${getTextSemantic('primary').value} dark:${getTextSemantic('primary').value}`
  const getBodyTypography = () =>
    `${getVariantClasses('body').value} ${getTextSemantic('primary').value} dark:${getTextSemantic('primary').value}`
  const getErrorTypography = () =>
    `${getVariantClasses('body').value} ${getAlertColors('error').value.text} dark:${getAlertColors('error').value.text}`
  const getHintTypography = () =>
    `${getVariantClasses('body').value} ${getTextSemantic('tertiary').value} dark:${getTextSemantic('tertiary').value}`

  // ID único para accesibilidad usando el sistema determinístico
  const checkboxId = useId('checkbox', {
    label: props.label,
    name: props.name,
  })

  // Estado interno del checkbox usando computed para v-model
  const isChecked = computed({
    get() {
      return props.modelValue
    },
    set(value: boolean) {
      emit('update:modelValue', value)
      emit('change', value)
    },
  })

  // Sincronizar con props.indeterminate
  watch(
    () => props.indeterminate,
    newValue => {
      if (checkboxRef.value) {
        checkboxRef.value.indeterminate = newValue
      }
    },
    { immediate: true },
  )

  // Clases de colores usando tokens del sistema de diseño
  const checkboxClasses = computed(() => {
    if (props.disabled) {
      return `${getBorderSemantic('secondary').value} ${getSurface('tertiary').value} dark:${getSurface('tertiary').value}`
    }

    if (hasError.value) {
      if (isChecked.value) {
        return `${getAlertColors('error').value.background} ${getAlertColors('error').value.border} text-white shadow-sm`
      }
      return `${getAlertColors('error').value.background} ${getAlertColors('error').value.border} ${getTextSemantic('primary').value}`
    }

    if (isChecked.value || props.indeterminate) {
      return `${getColor('primary', '600').value} ${getBorderColor('primary', '600').value} ${getTextColor('primary', '600')} shadow-sm hover:${getColor('primary', '700').value} hover:${getBorderColor('primary', '700').value}`
    }

    return `${getFormColors('input').value} hover:${getSurface('secondary').value} dark:hover:${getSurface('secondary').value}`
  })

  const labelClasses = computed(() => {
    if (props.disabled) {
      return `${getTextSemantic('quaternary').value} cursor-not-allowed`
    }
    if (hasError.value) {
      return `${getAlertColors('error').value.text} cursor-pointer`
    }
    return `${getTextSemantic('primary').value} cursor-pointer hover:${getTextSemantic('secondary').value}`
  })

  const requiredClasses = computed(() => {
    return `${getAlertColors('error').value.text}`
  })

  const descriptionClasses = computed(() => {
    if (props.disabled) {
      return `${getTextSemantic('quaternary').value}`
    }
    return `${getTextSemantic('tertiary').value}`
  })

  const errorClasses = computed(() => {
    return `${getAlertColors('error').value.text} font-medium`
  })

  const hintClasses = computed(() => {
    if (props.disabled) {
      return `${getTextSemantic('quaternary').value}`
    }
    return `${getTextSemantic('tertiary').value}`
  })

  // IDs para accesibilidad
  const describedBy = computed(() => {
    const ids = []
    if (props.description) ids.push(`${checkboxId.value}-description`)
    if (props.error && typeof props.error === 'string')
      ids.push(`${checkboxId.value}-error`)
    if (props.hint) ids.push(`${checkboxId.value}-hint`)
    return ids.length > 0 ? ids.join(' ') : undefined
  })

  const hasError = computed(() => !!props.error && typeof props.error === 'string')

  const ariaLabel = computed(() => props.ariaLabel || props.label)

  // Event handlers
  const handleChange = (event: Event) => {
    if (props.disabled) return

    const target = event.target as HTMLInputElement
    const newValue = target.checked

    // Emitir eventos (el v-model se encarga de la sincronización)
    emit('update:modelValue', newValue)
    emit('change', newValue)
  }

  const handleFocus = () => {
    emit('focus')
  }

  const handleBlur = () => {
    emit('blur')
  }

  const handleLabelClick = () => {
    if (props.disabled) return

    // Toggle del estado usando el computed
    isChecked.value = !isChecked.value
  }

  // Exponer métodos para uso externo
  defineExpose({
    focus: () => checkboxRef.value?.focus(),
    blur: () => checkboxRef.value?.blur(),
    click: () => checkboxRef.value?.click(),
  })
</script>

<template>
  <div class="flex items-start">
    <div class="flex items-center h-5">
      <input
        :id="checkboxId"
        ref="checkboxRef"
        v-model="isChecked"
        :name="name"
        :value="value"
        :disabled="disabled"
        :required="required"
        :indeterminate="indeterminate"
        type="checkbox"
        class="sr-only focus:ring-2 focus:ring-offset-2"
        :class="[hasError ? 'focus:ring-red-500' : 'focus:ring-blue-500']"
        :aria-describedby="describedBy"
        :aria-invalid="hasError"
        :aria-required="required"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <label
        :for="checkboxId"
        class="relative flex h-5 w-5 cursor-pointer items-center justify-center rounded border transition-all duration-200"
        :class="[
          checkboxClasses,
          disabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-105',
        ]"
        :aria-label="ariaLabel"
        @click="handleLabelClick"
      >
        <!-- Checkmark icon -->
        <Check
          v-if="isChecked && !indeterminate"
          class="w-3 h-3 pointer-events-none text-white"
          aria-hidden
        />

        <!-- Indeterminate icon -->
        <Minus
          v-else-if="indeterminate"
          class="w-3 h-3 pointer-events-none text-white"
          aria-hidden
        />

        <!-- Focus ring -->
        <div
          class="absolute inset-0 rounded ring-2 ring-transparent transition-all duration-200 focus-within:ring-offset-2"
          :class="[
            hasError ? 'focus-within:ring-red-500' : 'focus-within:ring-blue-500',
          ]"
          :aria-hidden="true"
        />
      </label>
    </div>

    <!-- Label text -->
    <div v-if="$slots.default || label" class="ml-3 text-sm">
      <label
        v-if="label"
        :for="checkboxId"
        :class="[
          getLabelTypography(),
          labelClasses,
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        ]"
      >
        {{ label }}
        <span
          v-if="required"
          class="ml-1"
          :class="[requiredClasses]"
          aria-label="required"
          >*</span
        >
      </label>

      <slot />

      <!-- Error message -->
      <div
        v-if="hasError"
        :id="`${checkboxId}-error`"
        class="mt-1 flex items-center"
        :class="[getErrorTypography(), errorClasses]"
        role="alert"
        aria-live="polite"
      >
        <AlertCircle :class="[`w-4 h-3 mr-1 ${getColor('error', '600').value}`]" />
        {{ error }}
      </div>

      <!-- Help text -->
      <p
        v-if="hint"
        :id="`${checkboxId}-hint`"
        class="mt-1"
        :class="[getHintTypography(), hintClasses]"
      >
        {{ hint }}
      </p>
    </div>
  </div>
</template>

<style scoped>
  /* Estilos específicos del checkbox */
  input[type='checkbox'] {
    @apply appearance-none;
  }

  /* Transiciones suaves */
  label {
    @apply transition-all duration-200 ease-in-out;
  }

  /* Focus visible para accesibilidad */
  input[type='checkbox']:focus-visible + label {
    @apply ring-2 ring-blue-500 ring-offset-2;
  }
</style>
