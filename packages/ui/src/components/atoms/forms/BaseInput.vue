<template>
  <div class="w-full">
    <!-- Label -->
    <label v-if="label" :for="inputId" :class="[
      typography.getLabelTypography(props.size).value,
      'block mb-1',
      labelClasses,
    ]">
      {{ label }}
      <span v-if="required" :class="['ml-1', requiredClasses]" aria-label="required">*</span>
    </label>

    <!-- Contenedor del input -->
    <div :class="containerClasses">
      <!-- Icono izquierdo -->
      <BaseIcon v-if="leftIcon" :icon="leftIcon" size="sm" color="muted"
        class="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 z-10 text-gray-500 dark:text-gray-400"
        :aria-hidden="true" />

      <!-- Input principal -->
      <input :id="inputId" ref="inputRef" v-model="inputValue" :type="type" :placeholder="placeholder"
        :disabled="disabled" :readonly="readonly" :required="required" :min="min" :max="max" :step="step"
        :pattern="pattern" :autocomplete="autocomplete" :autocapitalize="autocapitalize" :spellcheck="spellcheck"
        :inputmode="inputmode" :maxlength="maxLength" :aria-describedby="describedBy"
        :aria-invalid="computedAriaInvalid" :aria-required="required" :aria-label="!label ? placeholder : undefined"
        :class="[
          'w-full transition-all duration-200 focus:outline-none focus:ring-2',
          typography.getInputTypography(props.size).value,
          inputClasses,
        ]" @input="handleInput" @change="handleChange" @focus="handleFocus" @blur="handleBlur"
        @keydown="handleKeyDown" />

      <!-- Icono derecho -->
      <div v-if="rightIcon && !(clearable && inputValue && !disabled)"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
        @click="emit('click:right-icon')">
        <BaseIcon :icon="rightIcon" size="sm" color="muted" :aria-hidden="true" />
      </div>

      <!-- Botón de limpiar -->
      <BaseButton v-if="clearable && inputValue && !disabled && !rightIcon" size="sm" variant="ghost" :icon="X"
        :aria-label="`${t('button.clear')} ${label || t('input.placeholder.name')}`"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 z-20" @click="clearInput" />
    </div>

    <!-- Contador de caracteres -->
    <div v-if="showCharacterCount && maxLength" :id="`${inputId}-counter`" :class="counterClasses"
      :aria-live="focused ? 'polite' : 'off'">
      {{ characterCount }}/{{ maxLength }}
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" :id="`${inputId}-error`" :class="[
      typography.getFormTypography('error').value,
      'mt-1 flex items-center',
      errorClasses,
    ]" role="alert" aria-live="polite">
      <BaseIcon :icon="AlertCircle" size="sm" color="error" class="mr-1" />
      {{ error }}
    </div>

    <!-- Texto de ayuda -->
    <p v-if="hint" :id="`${inputId}-hint`" :class="[typography.getFormTypography('help').value, 'mt-1', hintClasses]">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useColors, useId, useTypography } from '@ritmo/ui'
import {
  useClipboard,
  useDebounceFn,
  useEventListener,
  useFocus,
  usePreferredReducedMotion,
  useThrottleFn,
  useVModel,
} from '@vueuse/core'
import { AlertCircle, X } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useI18n } from '../../../i18n'
import BaseIcon from '../display/BaseIcon.vue'
import BaseButton from '../interactive/BaseButton.vue'

interface BaseInputProps {
  modelValue?: string | number
  label?: string
  placeholder?: string
  type?:
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'time'
  | 'datetime-local'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  clearable?: boolean
  leftIcon?: any
  rightIcon?: any
  error?: string
  hint?: string
  min?: number | string
  max?: number | string
  step?: number | string
  pattern?: string
  autocomplete?: string
  autocapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters'
  spellcheck?: boolean
  inputmode?:
  | 'none'
  | 'text'
  | 'tel'
  | 'url'
  | 'email'
  | 'numeric'
  | 'decimal'
  | 'search'
  labelClasses?: string
  inputClasses?: string
  errorClasses?: string
  hintClasses?: string
  requiredClasses?: string
  showCharacterCount?: boolean
  maxLength?: number
}

const props = withDefaults(defineProps<BaseInputProps>(), {
  modelValue: '',
  type: 'text',
  size: 'md',
  variant: 'default',
  disabled: false,
  readonly: false,
  required: false,
  clearable: false,
  autocapitalize: 'sentences',
  spellcheck: true,
  inputmode: 'text',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  input: [event: Event]
  change: [event: Event]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  keydown: [event: KeyboardEvent]
  clear: []
  'click:right-icon': []
}>()

// Referencias del DOM
const inputRef = ref<HTMLInputElement>()

// VueUse composables para mejor UX
const { focused } = useFocus(inputRef)
const prefersReducedMotion = usePreferredReducedMotion()
const { copy, copied, isSupported: isClipboardSupported } = useClipboard()

// Mejor manejo de v-model con VueUse
const inputValue = useVModel(props, 'modelValue', emit)

// Validación debounced para mejor performance
const debouncedValidation = useDebounceFn((value: string) => {
  validateInput(value)
}, 300)

// Throttle para eventos de input para mejor performance
const throttledInput = useThrottleFn((event: Event) => {
  emit('input', event)
}, 16) // ~60fps

// Usar tipografía unificada
const typography = useTypography()

// Usar colores del sistema de diseño
const { getColor, getTextColor, getBorderColor, getTextSemantic, getBorderSemantic } =
  useColors()

// ID único para accesibilidad usando el sistema determinístico
const inputId = useId('input', {
  label: props.label,
  type: props.type,
})

// i18n support
const { t } = useI18n()

// Computed para aria-describedby dinámico
const describedBy = computed(() => {
  const ids = []
  if (props.error) ids.push(`${inputId.value}-error`)
  if (props.hint) ids.push(`${inputId.value}-hint`)
  if (props.showCharacterCount && props.maxLength)
    ids.push(`${inputId.value}-counter`)
  return ids.length > 0 ? ids.join(' ') : undefined
})

// Computed para aria-invalid
const computedAriaInvalid = computed(() => {
  return !!props.error
})

// Clases del input mejoradas con VueUse
const inputClasses = computed(() => {
  const baseClasses = [
    'w-full border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'readonly:bg-gray-50 readonly:cursor-default dark:readonly:bg-gray-800 dark:readonly:text-gray-300',
  ]

  // Clases de tamaño usando tokens
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs min-h-[1.5rem]',
    sm: 'px-3 py-1.5 text-sm min-h-[2rem]',
    md: 'px-3 py-2 text-sm min-h-[2.5rem]',
    lg: 'px-4 py-2.5 text-base min-h-[3rem]',
    xl: 'px-4 py-3 text-lg min-h-[3.5rem]',
  }

  // Clases de variante con mejor soporte para dark mode
  const variantClasses = {
    default:
      'border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:bg-gray-800',
    primary:
      'border-blue-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 dark:border-blue-600 dark:text-gray-100 dark:placeholder-gray-400 dark:bg-gray-800',
    success:
      'border-green-300 text-gray-900 placeholder-gray-500 focus:ring-green-500 focus:border-green-500 dark:border-green-600 dark:text-gray-100 dark:placeholder-gray-400 dark:bg-gray-800',
    warning:
      'border-yellow-300 text-gray-900 placeholder-gray-500 focus:ring-yellow-500 focus:border-yellow-500 dark:border-yellow-600 dark:text-gray-100 dark:placeholder-gray-400 dark:bg-gray-800',
    error:
      'border-red-300 text-gray-900 placeholder-gray-500 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:text-gray-100 dark:placeholder-gray-400 dark:bg-gray-800',
    info: 'border-blue-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 dark:border-blue-600 dark:text-gray-100 dark:placeholder-gray-400 dark:bg-gray-800',
  }

  // Clases dinámicas basadas en estado VueUse
  const dynamicClasses = [
    // Focus mejorado
    focused.value ? 'ring-2 ring-offset-2 dark:ring-offset-gray-900' : '',

    // Error state con mejor soporte para dark mode
    props.error
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400'
      : '',

    // Transiciones respetando preferencias
    prefersReducedMotion.value
      ? 'transition-none'
      : 'transition-all duration-200 ease-out',
  ]

  return [
    ...baseClasses,
    sizeClasses[props.size] || sizeClasses.md,
    variantClasses[props.variant] || variantClasses.default,
    ...dynamicClasses,
  ]
    .filter(Boolean)
    .join(' ')
})

// Clases para el contenedor del input
const containerClasses = computed(() => {
  return [
    'relative',
    props.leftIcon ? 'pl-10' : '',
    props.rightIcon || (props.clearable && inputValue.value && !props.disabled)
      ? 'pr-10'
      : '',
  ]
    .filter(Boolean)
    .join(' ')
})

// Clases para el botón de limpiar
const clearButtonClasses = computed(() => {
  return [
    'absolute right-3 top-1/2 transform -translate-y-1/2',
    'p-1 rounded-md transition-colors duration-200',
    'hover:bg-gray-100 dark:hover:bg-gray-700',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ]
    .filter(Boolean)
    .join(' ')
})

// Clases para el mensaje de error
const errorClasses = computed(() => {
  return [
    'text-red-600 dark:text-red-400',
    'flex items-center gap-2',
    'mt-1 text-sm',
    'font-medium',
  ]
    .filter(Boolean)
    .join(' ')
})

// Clases para el texto de ayuda
const hintClasses = computed(() => {
  return ['text-gray-600 dark:text-gray-400', 'mt-1 text-sm', 'leading-relaxed']
    .filter(Boolean)
    .join(' ')
})

// Clases para el asterisco de requerido
const requiredClasses = computed(() => {
  return ['text-red-500 dark:text-red-400', 'font-medium'].filter(Boolean).join(' ')
})

// Event handlers optimizados con VueUse
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value

  // Emitir evento input
  emit('input', event)

  // Validación debounced
  debouncedValidation(value)

  // Throttled input para performance
  throttledInput(event)
}

const handleChange = (event: Event) => {
  emit('change', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleKeyDown = (event: KeyboardEvent) => {
  emit('keydown', event)

  // Atajos de teclado
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'c':
        if (inputValue.value) {
          copy(inputValue.value.toString())
        }
        break
      case 'v':
        // Permitir pegar
        break
      case 'a':
        event.preventDefault()
        inputRef.value?.select()
        break
    }
  }

  // Escape para limpiar
  if (event.key === 'Escape' && props.clearable && inputValue.value) {
    clearInput()
  }
}

const clearInput = () => {
  inputValue.value = ''
  emit('clear')
  inputRef.value?.focus()
}

// Función de validación
const validateInput = (value: string) => {
  // Implementar validación personalizada aquí
  // Por ejemplo, validación de email, número, etc.
}

// Función para copiar al clipboard
const copyToClipboard = async () => {
  if (inputValue.value && isClipboardSupported.value) {
    await copy(inputValue.value.toString())
  }
}

// Event listeners globales optimizados con VueUse
useEventListener('keydown', event => {
  if (
    focused.value &&
    event.key === 'Escape' &&
    props.clearable &&
    inputValue.value
  ) {
    event.preventDefault()
    clearInput()
  }
})

// Watch para cambios en el valor
watch(inputValue, newValue => {
  if (newValue) {
    debouncedValidation(newValue.toString())
  }
})

// Watch para preferencias de movimiento
watch(prefersReducedMotion, reduced => {
  // Ajustar transiciones si es necesario
})

// Computed para contador de caracteres
const characterCount = computed(() => String(inputValue.value || '').length)
const counterClasses = computed(() =>
  [
    'text-gray-500 dark:text-gray-400',
    'text-xs mt-1 text-right',
    characterCount.value > (props.maxLength || 0) * 0.9
      ? 'text-yellow-600 dark:text-yellow-400'
      : '',
    characterCount.value > (props.maxLength || 0)
      ? 'text-red-600 dark:text-red-400'
      : '',
  ]
    .filter(Boolean)
    .join(' '),
)

// Exponer métodos para uso externo
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select(),
  clear: clearInput,
  copyToClipboard,
})
</script>

<style scoped>
/* Estilos específicos para dark mode */
input:focus {
  outline: none;
}

/* Mejorar contraste en dark mode */
input::placeholder {
  color: inherit;
}

/* Estilos para readonly en dark mode */
input[readonly] {
  background-color: var(--readonly-bg, #f9fafb);
  color: var(--readonly-text, #374151);
}

.dark input[readonly] {
  background-color: var(--readonly-bg-dark, #1f2937);
  color: var(--readonly-text-dark, #d1d5db);
}

/* Mejorar accesibilidad del focus */
input:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* Soporte para high contrast mode */
@media (prefers-contrast: high) {
  input {
    border-width: 2px;
  }
}

/* Soporte para reduced motion */
@media (prefers-reduced-motion: reduce) {

  input,
  .transition-colors {
    transition: none !important;
  }
}

/* Optimizaciones para dispositivos de alta resolución */
@media (-webkit-min-device-pixel-ratio: 2),
(min-resolution: 192dpi) {
  input {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
</style>
