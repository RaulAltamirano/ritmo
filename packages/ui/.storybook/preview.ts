import type { Preview } from '@storybook/vue3-vite'
import { setup } from '@storybook/vue3-vite'
import '../src/styles/index.css'
import './design-system'
import './global.css'
import i18nPlugin from './i18n'

// Importar componentes globalmente
import BaseAlert from '../src/components/atoms/feedback/BaseAlert.vue'
import BaseBadge from '../src/components/atoms/feedback/BaseBadge.vue'
import BaseButton from '../src/components/atoms/interactive/BaseButton.vue'
import BaseCard from '../src/components/atoms/layout/BaseCard.vue'
import BaseCheckbox from '../src/components/atoms/forms/BaseCheckbox.vue'
import BaseIcon from '../src/components/atoms/display/BaseIcon.vue'
import BaseInput from '../src/components/atoms/forms/BaseInput.vue'
import BaseModal from '../src/components/atoms/interactive/BaseModal.vue'
import BaseSkeleton from '../src/components/atoms/layout/BaseSkeleton.vue'
import BaseSpinner from '../src/components/atoms/display/BaseSpinner.vue'
import BaseToast from '../src/components/atoms/feedback/BaseToast.vue'
import ClientOnly from '../src/components/atoms/display/ClientOnly.vue'
import DarkModeToggle from '../src/components/molecules/navigation/DarkModeToggle.vue'
import LoginForm from '../src/components/molecules/forms/LoginForm.vue'
import RitmoBrand from '../src/components/molecules/navigation/RitmoBrand.vue'

// Importar mocks de composables
import mockComposables from '../src/composables/mock'

// Configuración global de Vue
setup(app => {
  // Configurar i18n
  app.use(i18nPlugin)

  // Registrar componentes globalmente
  app.component('BaseButton', BaseButton)
  app.component('BaseModal', BaseModal)
  app.component('BaseIcon', BaseIcon)
  app.component('BaseSpinner', BaseSpinner)
  app.component('BaseInput', BaseInput)
  app.component('BaseCard', BaseCard)
  app.component('BaseAlert', BaseAlert)
  app.component('BaseBadge', BaseBadge)
  app.component('BaseCheckbox', BaseCheckbox)
  app.component('BaseSkeleton', BaseSkeleton)
  app.component('BaseToast', BaseToast)
  app.component('ClientOnly', ClientOnly)
  app.component('DarkModeToggle', DarkModeToggle)
  app.component('LoginForm', LoginForm)
  app.component('RitmoBrand', RitmoBrand)

  // Mock de composables global
  app.config.globalProperties.$composables = mockComposables

  // Configuración global de la app
  app.config.globalProperties.$storybook = true

  // Mock de toast global
  app.config.globalProperties.$toast = {
    success: (message: string) => console.log('Toast success:', message),
    error: (message: string) => console.log('Toast error:', message),
    info: (message: string) => console.log('Toast info:', message),
    warning: (message: string) => console.log('Toast warning:', message),
  }

  // Debug: verificar que los estilos se cargan
  console.log('Storybook preview setup complete')
})

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme mode',
      defaultValue: 'light',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
      },
    },
  },
  parameters: {
    // Accesibilidad
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'button-name', enabled: true },
          { id: 'form-field-multiple-labels', enabled: true },
          { id: 'aria-required-attr', enabled: true },
          { id: 'aria-describedby', enabled: true },
          { id: 'heading-order', enabled: true },
          { id: 'landmark-one-main', enabled: true },
          { id: 'page-has-heading-one', enabled: true },
          { id: 'region', enabled: true },
          { id: 'skip-link', enabled: true },
        ],
      },
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21aa'],
        },
      },
    },

    // Actions
    actions: {
      argTypesRegex: '^on[A-Z].*',
      handles: ['click', 'submit', 'focus', 'blur', 'change'],
    },

    // Controls
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
      sort: 'requiredFirst',
    },

    // Viewport
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1920px',
            height: '1080px',
          },
        },
      },
    },

    // Backgrounds (alineados con tokens de superficie en colors.ts)
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#0f172a',
        },
      ],
    },

    // Layout
    layout: 'padded',
  },

  // Decoradores globales
  decorators: [
    (story, context) => {
      if (typeof document !== 'undefined') {
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(context.globals.theme === 'dark' ? 'dark' : 'light')
      }
      return story()
    },
  ],
}

export default preview
