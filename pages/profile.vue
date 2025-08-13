<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-soft border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-primary-700">Ritmo</h1>
            <span class="ml-2 text-sm text-gray-500">Tu agenda inteligente</span>
          </div>
          <nav class="flex space-x-8">
            <NuxtLink to="/" class="text-gray-600 hover:text-primary-700 font-medium">Inicio</NuxtLink>
            <NuxtLink to="/profile" class="text-primary-700 hover:text-primary-800 font-medium">Perfil</NuxtLink>
            <button @click="logout" class="text-gray-600 hover:text-red-600 font-medium">Cerrar sesión</button>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Profile Header -->
      <div class="bg-white rounded-lg shadow-medium p-6 mb-8">
        <div class="flex items-center space-x-6">
          <div class="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
            <span class="text-white font-bold text-2xl">{{ userInitials }}</span>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{{ user?.name || 'Usuario' }}</h2>
            <p class="text-gray-600">{{ user?.email || 'usuario@email.com' }}</p>
            <p class="text-sm text-gray-500">Miembro desde {{ joinDate }}</p>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-medium p-6">
          <div class="flex items-center">
            <div class="p-2 bg-primary-100 rounded-lg">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Tareas Completadas</p>
              <p class="text-2xl font-bold text-gray-900">127</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-medium p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Horas de Estudio</p>
              <p class="text-2xl font-bold text-gray-900">89.5</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-medium p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Productividad</p>
              <p class="text-2xl font-bold text-gray-900">94%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Section -->
      <div class="bg-white rounded-lg shadow-medium p-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-6">Configuración</h3>
        
        <div class="space-y-6">
          <!-- Personal Information -->
          <div>
            <h4 class="text-lg font-medium text-gray-900 mb-4">Información Personal</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  v-model="profile.name"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  v-model="profile.email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <!-- Preferences -->
          <div>
            <h4 class="text-lg font-medium text-gray-900 mb-4">Preferencias</h4>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-900">Notificaciones por email</p>
                  <p class="text-sm text-gray-500">Recibe recordatorios por correo electrónico</p>
                </div>
                <button
                  @click="profile.emailNotifications = !profile.emailNotifications"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    profile.emailNotifications ? 'bg-primary-600' : 'bg-gray-200'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      profile.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  ></span>
                </button>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-900">Modo oscuro</p>
                  <p class="text-sm text-gray-500">Cambia el tema de la aplicación</p>
                </div>
                <button
                  @click="profile.darkMode = !profile.darkMode"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    profile.darkMode ? 'bg-primary-600' : 'bg-gray-200'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      profile.darkMode ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  ></span>
                </button>
              </div>
            </div>
          </div>

          <!-- Save Button -->
          <div class="flex justify-end">
            <button
              @click="saveProfile"
              :disabled="saving"
              class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ saving ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@stores/auth'
import { ROUTES } from '@utils/routes'

const authStore = useAuthStore()

const user = computed(() => authStore.user)
const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  return user.value.name.split(' ').map(n => n[0]).join('').toUpperCase()
})

const joinDate = computed(() => {
  return new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long'
  })
})

const profile = ref({
  name: user.value?.name || '',
  email: user.value?.email || '',
  emailNotifications: true,
  darkMode: false
})

const saving = ref(false)

const saveProfile = async () => {
  saving.value = true
  // Simular guardado
  await new Promise(resolve => setTimeout(resolve, 1000))
  saving.value = false
  // Aquí se guardarían los cambios en el backend
}

const logout = () => {
  authStore.logout()
  navigateTo(ROUTES.LOGIN)
}
</script>
