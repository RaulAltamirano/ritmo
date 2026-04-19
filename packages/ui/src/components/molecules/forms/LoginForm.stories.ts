import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import LoginForm from './LoginForm.vue'

const meta: Meta<typeof LoginForm> = {
  title: 'Design System/Molecules/Forms/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Formulario de inicio de sesión completo con validación, estados de carga, credenciales de demostración y accesibilidad. Incluye campos de email y contraseña, checkbox "recordar", enlaces de recuperación y registro.',
      },
    },
  },
  argTypes: {
    initialData: {
      control: { type: 'object' },
      description: 'Datos iniciales del formulario',
    },
    isLoading: {
      control: { type: 'boolean' },
      description: 'Estado de carga del formulario',
    },
    generalError: {
      control: { type: 'text' },
      description: 'Mensaje de error general',
    },
  },
  args: {
    initialData: {},
    isLoading: false,
    generalError: '',
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Historia principal
export const Default: Story = {
  render: args => ({
    components: { LoginForm },
    setup() {
      const handleSubmit = (data: any) => {
        console.log('Form submitted:', data)
      }

      const handleForgotPassword = () => {
        console.log('Forgot password clicked')
      }

      const handleSignUp = () => {
        console.log('Sign up clicked')
      }

      return { args, handleSubmit, handleForgotPassword, handleSignUp }
    },
    template: `
      <LoginForm 
        v-bind="args"
        @submit="handleSubmit"
        @forgot-password="handleForgotPassword"
        @sign-up="handleSignUp"
      />
    `,
  }),
}

// Con datos iniciales
export const WithInitialData: Story = {
  render: () => ({
    components: { LoginForm },
    setup() {
      const initialData = {
        email: 'usuario@ejemplo.com',
        password: '',
        rememberMe: true,
      }

      const handleSubmit = (data: any) => {
        console.log('Form submitted:', data)
      }

      return { initialData, handleSubmit }
    },
    template: `
      <LoginForm 
        :initial-data="initialData"
        @submit="handleSubmit"
      />
    `,
  }),
}

// Estado de carga
export const Loading: Story = {
  render: () => ({
    components: { LoginForm },
    setup() {
      const handleSubmit = (data: any) => {
        console.log('Form submitted:', data)
      }

      return { handleSubmit }
    },
    template: `
      <LoginForm 
        :is-loading="true"
        @submit="handleSubmit"
      />
    `,
  }),
}

// Con error general
export const WithGeneralError: Story = {
  render: () => ({
    components: { LoginForm },
    setup() {
      const generalError = 'Invalid email or password. Please try again.'

      const handleSubmit = (data: any) => {
        console.log('Form submitted:', data)
      }

      return { generalError, handleSubmit }
    },
    template: `
      <LoginForm 
        :general-error="generalError"
        @submit="handleSubmit"
      />
    `,
  }),
}

// Con errores de validación
export const WithValidationErrors: Story = {
  render: () => ({
    components: { LoginForm },
    setup() {
      const initialData = {
        email: 'invalid-email',
        password: '',
        rememberMe: false,
      }

      const handleSubmit = (data: any) => {
        console.log('Form submitted:', data)
      }

      return { initialData, handleSubmit }
    },
    template: `
      <LoginForm 
        :initial-data="initialData"
        @submit="handleSubmit"
      />
    `,
  }),
}

// En contexto de página
export const InPageContext: Story = {
  render: () => ({
    components: { LoginForm },
    setup() {
      const handleSubmit = (data: any) => {
        console.log('Form submitted:', data)
      }

      const handleForgotPassword = () => {
        console.log('Forgot password clicked')
      }

      const handleSignUp = () => {
        console.log('Sign up clicked')
      }

      return { handleSubmit, handleForgotPassword, handleSignUp }
    },
    template: `
      <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div class="w-full max-w-md">
          <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Ritmo
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              Tu plataforma de gestión de ritmos
            </p>
          </div>
          
          <LoginForm 
            @submit="handleSubmit"
            @forgot-password="handleForgotPassword"
            @sign-up="handleSignUp"
          />
          
          <div class="mt-8 text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              © 2024 Ritmo. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    `,
  }),
}

// En modal
export const InModal: Story = {
  render: () => ({
    components: { LoginForm },
    setup() {
      const showModal = ref(false)

      const handleSubmit = (data: any) => {
        console.log('Form submitted:', data)
        showModal.value = false
      }

      const handleForgotPassword = () => {
        console.log('Forgot password clicked')
      }

      const handleSignUp = () => {
        console.log('Sign up clicked')
        showModal.value = false
      }

      return { showModal, handleSubmit, handleForgotPassword, handleSignUp }
    },
    template: `
      <div>
        <button 
          @click="showModal = true"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Abrir Login
        </button>
        
        <div 
          v-if="showModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          @click="showModal = false"
        >
          <div @click.stop>
            <LoginForm 
              @submit="handleSubmit"
              @forgot-password="handleForgotPassword"
              @sign-up="handleSignUp"
            />
          </div>
        </div>
      </div>
    `,
  }),
}

// Estados de interacción
export const InteractionStates: Story = {
  render: () => ({
    components: { LoginForm },
    setup() {
      const states = ref([
        { name: 'Normal', props: {} },
        { name: 'Cargando', props: { isLoading: true } },
        { name: 'Con Error', props: { generalError: 'Error de autenticación' } },
        {
          name: 'Datos Prellenados',
          props: { initialData: { email: 'demo@ritmo.app', rememberMe: true } },
        },
      ])

      const handleSubmit = (data: any) => {
        console.log('Form submitted:', data)
      }

      return { states, handleSubmit }
    },
    template: `
      <div class="space-y-8">
        <div 
          v-for="state in states" 
          :key="state.name"
          class="space-y-4"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ state.name }}
          </h3>
        <LoginForm 
            v-bind="state.props"
            @submit="handleSubmit"
          />
        </div>
      </div>
    `,
  }),
}

// Accesibilidad
export const Accessibility: Story = {
  render: () => ({
    components: { LoginForm },
    setup() {
      const handleSubmit = (data: any) => {
        console.log('Form submitted:', data)
      }

      const handleForgotPassword = () => {
        console.log('Forgot password clicked')
      }

      const handleSignUp = () => {
        console.log('Sign up clicked')
      }

      return { handleSubmit, handleForgotPassword, handleSignUp }
    },
    template: `
      <div class="space-y-6">
        <LoginForm 
          @submit="handleSubmit"
          @forgot-password="handleForgotPassword"
          @sign-up="handleSignUp"
        />
        
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Características de Accesibilidad
          </h4>
          <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Labels asociados con todos los campos</li>
            <li>• Mensajes de error descriptivos</li>
            <li>• Navegación completa por teclado</li>
            <li>• Estados de carga anunciados</li>
            <li>• Enlaces con texto descriptivo</li>
            <li>• Roles ARIA apropiados</li>
          </ul>
        </div>
      </div>
    `,
  }),
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'label', enabled: true },
          { id: 'button-name', enabled: true },
          { id: 'form-field-multiple-labels', enabled: true },
        ],
      },
    },
  },
}
