import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import BaseButton from './BaseButton.vue'
import BaseModal from './BaseModal.vue'

const meta: Meta<typeof BaseModal> = {
  title: 'Atoms/BaseModal',
  component: BaseModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Componente de modal versátil con focus trap, backdrop, animaciones y accesibilidad completa. Incluye soporte para diferentes tamaños, posiciones y navegación por teclado. Compatible con WCAG 2.1 AA.',
      },
    },
  },
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controla si el modal está abierto o cerrado',
    },
    title: {
      control: 'text',
      description: 'Título del modal (opcional si se usa slot header)',
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Muestra el botón de cerrar en el header',
    },
    closeButtonLabel: {
      control: 'text',
      description: 'Texto del aria-label para el botón de cerrar',
    },
    closeButtonStyle: {
      control: { type: 'select' },
      options: ['minimal', 'subtle', 'floating'],
      description: 'Estilo del botón de cerrar',
    },
    closeOnBackdropClick: {
      control: 'boolean',
      description: 'Permite cerrar el modal haciendo clic en el backdrop',
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'Permite cerrar el modal con la tecla Escape',
    },
    preventScroll: {
      control: 'boolean',
      description: 'Previene el scroll del body cuando el modal está abierto',
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// Story básica con estado controlado
export const Default: Story = {
  render: args => ({
    components: { BaseModal, BaseButton },
    setup() {
      const isOpen = ref(false)
      return { args, isOpen }
    },
    template: `
      <div>
        <BaseButton @click="isOpen = true" variant="primary">
          Abrir Modal
        </BaseButton>
        
        <BaseModal 
          v-bind="args" 
          :is-open="isOpen"
          @close="isOpen = false"
          @update:is-open="isOpen = $event"
        >
          <template #header="{ titleId }">
            <h2 :id="titleId" class="text-xl font-semibold text-gray-900 dark:text-white">
              Modal de Ejemplo
            </h2>
          </template>
          
          <div class="space-y-4">
            <p class="text-gray-600 dark:text-gray-300">
              Este es un modal de ejemplo que demuestra las capacidades del componente BaseModal.
            </p>
            <p class="text-gray-600 dark:text-gray-300">
              Incluye soporte para slots personalizados, transiciones suaves y gestión de accesibilidad.
            </p>
          </div>
          
          <template #footer>
            <BaseButton variant="secondary" @click="isOpen = false">
              Cancelar
            </BaseButton>
            <BaseButton variant="primary" @click="isOpen = false">
              Confirmar
            </BaseButton>
          </template>
        </BaseModal>
      </div>
    `,
  }),
  args: {
    isOpen: false,
    title: 'Modal de Ejemplo',
    showCloseButton: true,
    closeButtonLabel: 'Cerrar modal',
    closeButtonStyle: 'minimal',
    closeOnBackdropClick: true,
    closeOnEscape: true,
    preventScroll: true,
  },
}

// Story con modal sin botón de cerrar
export const WithoutCloseButton: Story = {
  render: args => ({
    components: { BaseModal, BaseButton },
    setup() {
      const isOpen = ref(false)
      return { args, isOpen }
    },
    template: `
      <div>
        <BaseButton @click="isOpen = true" variant="outline">
          Modal sin Botón Cerrar
        </BaseButton>
        
        <BaseModal 
          v-bind="args" 
          :is-open="isOpen"
          @close="isOpen = false"
          @update:is-open="isOpen = $event"
        >
          <div class="text-center space-y-4">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              Modal Informativo
            </h2>
            <p class="text-gray-600 dark:text-gray-300">
              Este modal no tiene botón de cerrar y solo se puede cerrar con Escape o clic en backdrop.
            </p>
            <BaseButton variant="primary" @click="isOpen = false">
              Entendido
            </BaseButton>
          </div>
        </BaseModal>
      </div>
    `,
  }),
  args: {
    title: 'Modal Informativo',
    showCloseButton: false,
    closeOnBackdropClick: true,
    closeOnEscape: true,
  },
}

// Story con modal de confirmación
export const ConfirmationModal: Story = {
  render: args => ({
    components: { BaseModal, BaseButton },
    setup() {
      const isOpen = ref(false)
      const handleConfirm = () => {
        console.log('Acción confirmada!')
        isOpen.value = false
      }
      return { args, isOpen, handleConfirm }
    },
    template: `
      <div>
        <BaseButton @click="isOpen = true" variant="error">
          Eliminar Elemento
        </BaseButton>
        
        <BaseModal 
          v-bind="args" 
          :is-open="isOpen"
          @close="isOpen = false"
          @update:is-open="isOpen = $event"
        >
          <div class="text-center space-y-4">
            <div class="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              ¿Estás seguro?
            </h2>
            <p class="text-gray-600 dark:text-gray-300">
              Esta acción no se puede deshacer. El elemento será eliminado permanentemente.
            </p>
          </div>
          
          <template #footer>
            <BaseButton variant="secondary" @click="isOpen = false">
              Cancelar
            </BaseButton>
            <BaseButton variant="error" @click="handleConfirm">
              Eliminar
            </BaseButton>
          </template>
        </BaseModal>
      </div>
    `,
  }),
  args: {
    title: 'Confirmar Eliminación',
    showCloseButton: false,
    closeOnBackdropClick: false,
    closeOnEscape: true,
  },
}

// Story con modal de formulario
export const FormModal: Story = {
  render: args => ({
    components: { BaseModal, BaseButton },
    setup() {
      const isOpen = ref(false)
      const formData = ref({
        name: '',
        email: '',
        message: '',
      })

      const handleSubmit = () => {
        console.log(`Formulario enviado: ${JSON.stringify(formData.value)}`)
        isOpen.value = false
        formData.value = { name: '', email: '', message: '' }
      }

      return { args, isOpen, formData, handleSubmit }
    },
    template: `
      <div>
        <BaseButton @click="isOpen = true" variant="primary">
          Nuevo Contacto
        </BaseButton>
        
        <BaseModal 
          v-bind="args" 
          :is-open="isOpen"
          @close="isOpen = false"
          @update:is-open="isOpen = $event"
        >
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre
              </label>
              <input
                v-model="formData.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                placeholder="Tu nombre"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                v-model="formData.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                placeholder="tu@email.com"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mensaje
              </label>
              <textarea
                v-model="formData.message"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                placeholder="Tu mensaje..."
              ></textarea>
            </div>
          </form>
          
          <template #footer>
            <BaseButton variant="secondary" @click="isOpen = false">
              Cancelar
            </BaseButton>
            <BaseButton variant="primary" @click="handleSubmit">
              Enviar
            </BaseButton>
          </template>
        </BaseModal>
      </div>
    `,
  }),
  args: {
    title: 'Nuevo Contacto',
    showCloseButton: true,
    closeOnBackdropClick: false,
    closeOnEscape: true,
  },
}

// Story con modal de tamaño personalizado
export const CustomSizeModal: Story = {
  render: args => ({
    components: { BaseModal, BaseButton },
    setup() {
      const isOpen = ref(false)
      return { args, isOpen }
    },
    template: `
      <div>
        <BaseButton @click="isOpen = true" variant="outline">
          Modal Grande
        </BaseButton>
        
        <BaseModal 
          v-bind="args" 
          :is-open="isOpen"
          @close="isOpen = false"
          @update:is-open="isOpen = $event"
        >
          <div class="space-y-4">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              Modal de Tamaño Personalizado
            </h2>
            <p class="text-gray-600 dark:text-gray-300">
              Este modal demuestra cómo se puede personalizar el tamaño y estilo.
            </p>
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 class="font-semibold mb-2">Columna 1</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Contenido de ejemplo para la primera columna.
                </p>
              </div>
              <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 class="font-semibold mb-2">Columna 2</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Contenido de ejemplo para la segunda columna.
                </p>
              </div>
            </div>
          </div>
          
          <template #footer>
            <BaseButton variant="primary" @click="isOpen = false">
              Cerrar
            </BaseButton>
          </template>
        </BaseModal>
      </div>
    `,
  }),
  args: {
    title: 'Modal Grande',
    showCloseButton: true,
    closeOnBackdropClick: true,
    closeOnEscape: true,
  },
}

// Diferentes estilos del botón de cerrar
export const CloseButtonStyles: Story = {
  render: args => ({
    components: { BaseModal, BaseButton },
    setup() {
      const isOpen = ref(false)
      const closeButtonStyle = ref('minimal')

      const openModal = (style: string) => {
        closeButtonStyle.value = style
        isOpen.value = true
      }

      return { args, isOpen, closeButtonStyle, openModal }
    },
    template: `
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Estilos del Botón de Cerrar</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center">
              <BaseButton @click="openModal('minimal')" variant="outline" class="w-full">
                Minimal
              </BaseButton>
              <p class="text-sm text-gray-500 mt-2">Sin fondo, solo icono</p>
            </div>
            
            <div class="text-center">
              <BaseButton @click="openModal('subtle')" variant="outline" class="w-full">
                Subtle
              </BaseButton>
              <p class="text-sm text-gray-500 mt-2">Fondo sutil al hacer hover</p>
            </div>
            
            <div class="text-center">
              <BaseButton @click="openModal('floating')" variant="outline" class="w-full">
                Floating
              </BaseButton>
              <p class="text-sm text-gray-500 mt-2">Fondo flotante con sombra</p>
            </div>
          </div>
        </div>
        
        <BaseModal 
          :is-open="isOpen"
          :close-button-style="closeButtonStyle"
          @close="isOpen = false"
          @update:is-open="isOpen = $event"
        >
          <template #header="{ titleId }">
            <h2 :id="titleId" class="text-xl font-semibold text-gray-900 dark:text-white">
              Modal con Botón {{ closeButtonStyle.charAt(0).toUpperCase() + closeButtonStyle.slice(1) }}
            </h2>
          </template>
          
          <div class="space-y-4">
            <p class="text-gray-600 dark:text-gray-300">
              Este modal demuestra el estilo "{{ closeButtonStyle }}" del botón de cerrar.
            </p>
            <p class="text-gray-600 dark:text-gray-300">
              Haz hover sobre el botón X para ver el efecto visual.
            </p>
          </div>
          
          <template #footer>
            <BaseButton variant="secondary" @click="isOpen = false">
              Cerrar
            </BaseButton>
          </template>
        </BaseModal>
      </div>
    `,
  }),
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Diferentes estilos del botón de cerrar: minimal (sin fondo), subtle (fondo sutil) y floating (fondo flotante con sombra).',
      },
    },
  },
}
