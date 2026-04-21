<script setup lang="ts">
  import { Check, Plus, User, X } from 'lucide-vue-next'
  import { computed, onMounted } from 'vue'
  import {
    BaseAlert,
    BaseBadge,
    BaseButton,
    BaseCard,
    BaseIcon,
    checkCompositionCompatibility,
    getAtomicSystemInfo,
    useAtomicDesign,
  } from '../components/atoms'

  // Usar el sistema de diseño atómico
  const { tokens, componentVariants } = useAtomicDesign()

  // Información del sistema
  const systemInfo = computed(() => getAtomicSystemInfo())

  // Verificar compatibilidad de composición
  const compositionExamples = computed(() => ({
    buttonWithIcon: checkCompositionCompatibility('button', 'icon'),
    buttonWithSpinner: checkCompositionCompatibility('button', 'spinner'),
    badgeWithIcon: checkCompositionCompatibility('badge', 'icon'),
    alertWithIcon: checkCompositionCompatibility('alert', 'icon'),
  }))

  // Log del sistema al montar
  onMounted(() => {
    console.log('🎨 Sistema de Diseño Atómico - Ritmo UI')
    console.log('📊 Información del Sistema:', systemInfo.value)
    console.log('🔗 Compatibilidad de Composición:', compositionExamples.value)
    console.log('🎯 Tokens Disponibles:', tokens)
    console.log('🎨 Variantes de Componentes:', componentVariants)
  })
</script>

<template>
  <div class="p-8 space-y-8 bg-gray-50 dark:bg-gray-900">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Sistema de Composición de Átomos - Ritmo UI
      </h1>

      <!-- Sección: Composición Básica -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
          1. Composición Básica
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Botón con Icono -->
          <div class="space-y-3">
            <h3 class="font-medium text-gray-700 dark:text-gray-300">Botón + Icono</h3>
            <BaseButton variant="primary" size="md">
              <BaseIcon :icon="Plus" size="sm" color="current" class="mr-2" />
              Crear Nuevo
            </BaseButton>
          </div>

          <!-- Botón con Spinner -->
          <div class="space-y-3">
            <h3 class="font-medium text-gray-700 dark:text-gray-300">
              Botón + Spinner
            </h3>
            <BaseButton variant="success" size="md" :loading="true">
              Guardando...
            </BaseButton>
          </div>

          <!-- Badge con Icono -->
          <div class="space-y-3">
            <h3 class="font-medium text-gray-700 dark:text-gray-300">Badge + Icono</h3>
            <BaseBadge variant="success" content="Completado" icon="check" />
          </div>
        </div>
      </section>

      <!-- Sección: Composición Avanzada -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
          2. Composición Avanzada
        </h2>

        <div class="space-y-6">
          <!-- Card con Badge y Icono -->
          <BaseCard class="p-6">
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-3">
                <BaseIcon :icon="User" size="lg" color="primary" />
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-white">
                    Usuario Activo
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400">
                    Sesión iniciada hace 2 horas
                  </p>
                </div>
              </div>
              <BaseBadge variant="success" content="Online" icon="check" />
            </div>
          </BaseCard>

          <!-- Alert con Icono y Botón -->
          <BaseAlert variant="info" title="Información Importante" dismissible>
            <p class="mb-4">
              Este es un ejemplo de cómo los átomos se componen entre sí.
            </p>
            <div class="flex space-x-3">
              <BaseButton variant="primary" size="sm">
                <BaseIcon :icon="Check" size="sm" color="current" class="mr-2" />
                Entendido
              </BaseButton>
              <BaseButton variant="outline" size="sm">
                <BaseIcon :icon="X" size="sm" color="current" class="mr-2" />
                Cerrar
              </BaseButton>
            </div>
          </BaseAlert>
        </div>
      </section>

      <!-- Sección: Estados Interactivos -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
          3. Estados Interactivos Compartidos
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Botón con Estados -->
          <div class="space-y-4">
            <h3 class="font-medium text-gray-700 dark:text-gray-300">
              Estados del Botón
            </h3>
            <div class="space-y-3">
              <BaseButton variant="primary" size="md">Normal</BaseButton>
              <BaseButton variant="primary" size="md" :loading="true"
                >Loading</BaseButton
              >
              <BaseButton variant="primary" size="md" disabled>Disabled</BaseButton>
            </div>
          </div>

          <!-- Badge con Estados -->
          <div class="space-y-4">
            <h3 class="font-medium text-gray-700 dark:text-gray-300">
              Estados del Badge
            </h3>
            <div class="space-y-3">
              <BaseBadge variant="primary" content="Normal" />
              <BaseBadge variant="primary" content="Loading" :loading="true" />
              <BaseBadge variant="primary" content="Clickable" clickable />
            </div>
          </div>
        </div>
      </section>

      <!-- Sección: Sistema de Tokens -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
          4. Sistema de Tokens Unificado
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Colores -->
          <div class="space-y-4">
            <h3 class="font-medium text-gray-700 dark:text-gray-300">
              Colores Semánticos
            </h3>
            <div class="space-y-2">
              <BaseBadge variant="primary" content="Primary" />
              <BaseBadge variant="success" content="Success" />
              <BaseBadge variant="warning" content="Warning" />
              <BaseBadge variant="error" content="Error" />
              <BaseBadge variant="info" content="Info" />
            </div>
          </div>

          <!-- Tamaños -->
          <div class="space-y-4">
            <h3 class="font-medium text-gray-700 dark:text-gray-300">
              Tamaños Consistentes
            </h3>
            <div class="space-y-2">
              <BaseButton variant="primary" size="xs">XS</BaseButton>
              <BaseButton variant="primary" size="sm">SM</BaseButton>
              <BaseButton variant="primary" size="md">MD</BaseButton>
              <BaseButton variant="primary" size="lg">LG</BaseButton>
            </div>
          </div>

          <!-- Variantes -->
          <div class="space-y-4">
            <h3 class="font-medium text-gray-700 dark:text-gray-300">Variantes</h3>
            <div class="space-y-2">
              <BaseButton variant="primary" size="sm">Primary</BaseButton>
              <BaseButton variant="outline" size="sm">Outline</BaseButton>
              <BaseButton variant="ghost" size="sm">Ghost</BaseButton>
            </div>
          </div>
        </div>
      </section>

      <!-- Sección: Información del Sistema -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
          5. Información del Sistema
        </h2>

        <BaseCard class="p-6">
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Componentes Disponibles
                </h4>
                <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li
                    v-for="component in systemInfo.availableComponents"
                    :key="component"
                  >
                    • {{ component }}
                  </li>
                </ul>
              </div>

              <div>
                <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Composiciones
                </h4>
                <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li
                    v-for="(compositions, component) in systemInfo.composition"
                    :key="component"
                  >
                    <strong>{{ component }}:</strong> {{ compositions.join(', ') }}
                  </li>
                </ul>
              </div>

              <div>
                <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tokens
                </h4>
                <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li v-for="(values, token) in systemInfo.tokens" :key="token">
                    <strong>{{ token }}:</strong> {{ values.join(', ') }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                <strong>Versión del Sistema:</strong> {{ systemInfo.version }}
              </p>
            </div>
          </div>
        </BaseCard>
      </section>
    </div>
  </div>
</template>

<style scoped>
  /* Estilos específicos para el ejemplo */
  .space-y-8 > * + * {
    margin-top: 2rem;
  }

  .space-y-6 > * + * {
    margin-top: 1.5rem;
  }

  .space-y-4 > * + * {
    margin-top: 1rem;
  }

  .space-y-3 > * + * {
    margin-top: 0.75rem;
  }

  .space-y-2 > * + * {
    margin-top: 0.5rem;
  }

  .space-y-1 > * + * {
    margin-top: 0.25rem;
  }

  /* Responsive grid */
  @media (min-width: 768px) {
    .md\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .md\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (min-width: 1024px) {
    .lg\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
</style>
