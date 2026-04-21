// Setup simple para pruebas de accesibilidad
import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// Mock de i18n
vi.mock('../i18n', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'button.loading': 'Procesando...',
        'input.error.required': 'Este campo es requerido',
        'input.error.invalid': 'Valor inválido',
        'modal.opened': 'Modal abierto',
        'modal.closed': 'Modal cerrado',
        'common.close': 'Cerrar',
        'common.cancel': 'Cancelar',
        'common.confirm': 'Confirmar',
        'common.loading': 'Cargando...',
        'common.error': 'Error',
        'common.success': 'Éxito',
        'common.warning': 'Advertencia',
        'common.info': 'Información',
      }
      return translations[key] || key
    },
  }),
}))

// Mock de composables
vi.mock('../composables/useAtomicDesign', () => ({
  useAtomicDesign: () => ({
    useAtomicState: () => ({
      state: { value: { isPressed: false, isFocused: false, isHovered: false } },
      setHovered: vi.fn(),
      setPressed: vi.fn(),
      setFocused: vi.fn(),
    }),
    useAtomicSize: () => 'btn-md',
    useAtomicColor: () => 'btn-primary',
    useAtomicAccessibility: () => 'role="button"',
    useAtomicEvents: () => ({
      handleClick: vi.fn(),
      handleKeyDown: vi.fn(),
    }),
    useAtomicTransitions: () => ({
      value: { transform: '', duration: '', easing: '' },
    }),
    useAtomicStates: () => 'btn-base',
    componentVariants: {
      button: {
        base: 'btn-base',
        variants: { primary: 'btn-primary', secondary: 'btn-secondary' },
        sizes: { md: 'btn-md', lg: 'btn-lg' },
      },
    },
    composeClasses: (...args: any[]) => args.filter(Boolean).join(' '),
  }),
}))

// Mock de useAtomicIcon
vi.mock('../../composables/useAtomicIcon', () => ({
  useAtomicIcon: () => 'w-5 h-5',
}))

// Mock de useAtomicAccessibility
vi.mock('../../composables/useAtomicAccessibility', () => ({
  useAtomicAccessibility: () => ({
    role: 'img',
    'aria-label': 'icon',
  }),
}))

// Mock de useAtomicState
vi.mock('../../composables/useAtomicState', () => ({
  useAtomicState: () => ({
    state: { value: { isPressed: false, isFocused: false, isHovered: false } },
    setHovered: vi.fn(),
    setPressed: vi.fn(),
    setFocused: vi.fn(),
  }),
}))

// Mock de useAtomicEvents
vi.mock('../../composables/useAtomicEvents', () => ({
  useAtomicEvents: () => ({
    handleClick: vi.fn(),
    handleKeyDown: vi.fn(),
  }),
}))

vi.mock('../../composables/useTypography', () => ({
  useTypography: () => ({
    getButtonTypography: () => 'text-base font-medium',
    getVariantClasses: () => 'text-base',
    getInputTypography: () => 'text-sm',
  }),
}))

vi.mock('../../composables/useColors', () => ({
  useColors: () => ({
    forms: {
      value: {
        input: {
          background: 'bg-white',
          text: 'text-gray-900',
          border: 'border-gray-300',
          error: {
            background: 'bg-red-50',
            text: 'text-red-900',
            border: 'border-red-300',
          },
          disabled: {
            background: 'bg-gray-100',
            text: 'text-gray-500',
            border: 'border-gray-200',
          },
          focus: { border: 'border-blue-500', ring: 'ring-blue-500' },
        },
        label: { text: 'text-gray-700 font-medium' },
        help: { text: 'text-gray-500 text-sm' },
      },
    },
    variants: { value: { error: { text: 'text-red-600' } } },
    getSurface: () => ({ value: 'bg-white' }),
    getTextSemantic: () => ({ value: 'text-gray-900' }),
    getBorderSemantic: () => ({ value: 'border-gray-300' }),
  }),
}))

vi.mock('../../composables/useFocusTrap', () => ({
  useFocusTrap: () => ({
    activate: vi.fn(),
    deactivate: vi.fn(),
    containerRef: { value: null },
  }),
}))

vi.mock('../../composables/useId', () => ({
  useId: (prefix: string) => ({ value: `${prefix}-123` }),
}))

// Mock de BaseIcon
vi.mock('../../components/atoms/BaseIcon.vue', () => ({
  default: {
    name: 'BaseIcon',
    template:
      '<span data-testid="base-icon" :aria-label="ariaLabel" role="img" aria-hidden="true"></span>',
    props: ['ariaLabel', 'icon', 'size', 'color'],
    setup(props: any) {
      // Mock del setup para evitar errores de composables
      return {}
    },
  },
}))

// Mock de BaseSpinner
vi.mock('../../components/atoms/BaseSpinner.vue', () => ({
  default: {
    name: 'BaseSpinner',
    template: '<span data-testid="base-spinner" aria-hidden="true"></span>',
    props: ['size', 'variant', 'color'],
    setup(props: any) {
      // Mock del setup para evitar errores de colores
      return {}
    },
  },
}))

// Mock de BaseIcon
vi.mock('../../components/atoms/BaseIcon.vue', () => ({
  default: {
    name: 'BaseIcon',
    template:
      '<span data-testid="base-icon" :aria-label="ariaLabel" role="img" aria-hidden="true"></span>',
    props: ['ariaLabel', 'icon', 'size', 'color'],
    setup(props: any) {
      // Mock del setup para evitar errores de composables
      return {}
    },
  },
}))

// Mock de BaseLoadingSpinner
vi.mock('../../components/atoms/BaseLoadingSpinner.vue', () => ({
  default: {
    name: 'BaseLoadingSpinner',
    template: '<span data-testid="base-loading-spinner" aria-hidden="true"></span>',
  },
}))

// Mock de BaseButton
vi.mock('../../components/atoms/BaseButton.vue', () => ({
  default: {
    name: 'BaseButton',
    template:
      '<button data-testid="base-button" :aria-label="ariaLabel" @click="$emit(\'click\')"><slot /></button>',
    props: ['ariaLabel'],
    emits: ['click'],
  },
}))

// Configuración global de Vue Test Utils
config.global.mocks = {
  $t: (key: string) => key,
}
