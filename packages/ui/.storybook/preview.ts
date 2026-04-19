import { withThemeByClassName } from '@storybook/addon-themes'
import type { Preview } from '@storybook/vue3-vite'
import { setup } from '@storybook/vue3-vite'
import '../src/styles/index.css'
import './design-system'
import './global.css'
import i18nPlugin from './i18n'

// Importar componentes globalmente
import BaseAlert from '../src/components/atoms/BaseAlert.vue'
import BaseBadge from '../src/components/atoms/BaseBadge.vue'
import BaseButton from '../src/components/atoms/BaseButton.vue'
import BaseCard from '../src/components/atoms/BaseCard.vue'
import BaseCheckbox from '../src/components/atoms/BaseCheckbox.vue'
import BaseIcon from '../src/components/atoms/BaseIcon.vue'
import BaseInput from '../src/components/atoms/BaseInput.vue'
import BaseModal from '../src/components/atoms/BaseModal.vue'
import BaseSkeleton from '../src/components/atoms/BaseSkeleton.vue'
import BaseSpinner from '../src/components/atoms/BaseSpinner.vue'
import BaseToast from '../src/components/atoms/BaseToast.vue'
import ClientOnly from '../src/components/atoms/ClientOnly.vue'
import DarkModeToggle from '../src/components/molecules/DarkModeToggle.vue'
import LoginForm from '../src/components/molecules/LoginForm.vue'
import RitmoBrand from '../src/components/molecules/RitmoBrand.vue'

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

    // Backgrounds
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1f2937',
        },
      ],
    },

    // Layout
    layout: 'padded',
  },

  // Decoradores globales
  decorators: [
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
}

export default preview
