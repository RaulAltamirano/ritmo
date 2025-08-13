<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header de la página -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Mi Perfil
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Gestiona tu información personal y preferencias
      </p>
    </div>

    <!-- Información del perfil -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center space-x-6 mb-8">
        <!-- Avatar -->
        <div class="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
          <User class="text-white" :size="32" />
        </div>
        
        <!-- Información básica -->
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Usuario Demo
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-2">
            usuario@ejemplo.com
          </p>
          <span class="px-3 py-1 text-sm font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-full">
            Activo
          </span>
        </div>
      </div>

      <!-- Formulario de información -->
      <form class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Nombre -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre completo
            </label>
            <input
              id="name"
              type="text"
              value="Usuario Demo"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value="usuario@ejemplo.com"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <!-- Teléfono -->
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Teléfono
            </label>
            <input
              id="phone"
              type="tel"
              value="+1 234 567 8900"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <!-- Zona horaria -->
          <div>
            <label for="timezone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Zona horaria
            </label>
            <select
              id="timezone"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="UTC-5">UTC-5 (Eastern Time)</option>
              <option value="UTC-6">UTC-6 (Central Time)</option>
              <option value="UTC-7">UTC-7 (Mountain Time)</option>
              <option value="UTC-8">UTC-8 (Pacific Time)</option>
            </select>
          </div>
        </div>

        <!-- Biografía -->
        <div>
          <label for="bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Biografía
          </label>
          <textarea
            id="bio"
            rows="4"
            placeholder="Cuéntanos un poco sobre ti..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          ></textarea>
        </div>

        <!-- Preferencias -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Preferencias
          </h3>
          
          <div class="space-y-4">
            <!-- Modo oscuro -->
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Modo oscuro
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Cambiar entre tema claro y oscuro
                </p>
              </div>
              <button
                @click="toggleDarkMode"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                :class="isDark ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="isDark ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>

            <!-- Notificaciones -->
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notificaciones por email
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Recibir recordatorios por correo
                </p>
              </div>
              <button
                class="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <span class="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6"></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User } from 'lucide-vue-next'

// Meta tags para la página
useHead({
  title: 'Mi Perfil',
  meta: [
    { name: 'description', content: 'Gestiona tu información personal y preferencias' }
  ]
})

// Estado del modo oscuro
const isDark = ref(false)

// Detectar modo oscuro inicial
onMounted(() => {
  if (!process.client) return
  isDark.value = document.documentElement.classList.contains('dark')
})

// Toggle del modo oscuro
const toggleDarkMode = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}
</script> 