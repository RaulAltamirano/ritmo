// Setup para pruebas de accesibilidad
import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// Extender tipos globales para testing

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

// Mock de composables - CORREGIDO
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

vi.mock('../composables/useTypography', () => ({
  useTypography: () => ({
    getButtonTypography: () => 'text-base font-medium',
    getVariantClasses: () => 'text-base',
    getInputTypography: () => 'text-sm',
  }),
}))

vi.mock('../composables/useColors', () => ({
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

vi.mock('../composables/useFocusTrap', () => ({
  useFocusTrap: () => ({
    activate: vi.fn(),
    deactivate: vi.fn(),
    containerRef: { value: null },
  }),
}))

vi.mock('../composables/useId', () => ({
  useId: (prefix: string) => ({ value: `${prefix}-123` }),
}))

// Mock de BaseIcon
vi.mock('../components/atoms/BaseIcon.vue', () => ({
  default: {
    name: 'BaseIcon',
    template:
      '<span data-testid="base-icon" :aria-label="ariaLabel" role="img" aria-hidden="true"></span>',
    props: ['ariaLabel'],
  },
}))

// Mock de BaseSpinner
vi.mock('../components/atoms/BaseSpinner.vue', () => ({
  default: {
    name: 'BaseSpinner',
    template: '<span data-testid="base-spinner" aria-hidden="true"></span>',
  },
}))

// Mock de BaseLoadingSpinner
vi.mock('../components/atoms/BaseLoadingSpinner.vue', () => ({
  default: {
    name: 'BaseLoadingSpinner',
    template: '<span data-testid="base-loading-spinner" aria-hidden="true"></span>',
  },
}))

// Configuración global de Vue Test Utils
config.global.mocks = {
  $t: (key: string) => key,
}

// Mock de IntersectionObserver
if (typeof global !== 'undefined') {
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock de ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
}

// Mock de matchMedia
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock de getComputedStyle
  Object.defineProperty(window, 'getComputedStyle', {
    value: () => ({
      display: 'block',
      visibility: 'visible',
      opacity: '1',
    }),
  })
}
