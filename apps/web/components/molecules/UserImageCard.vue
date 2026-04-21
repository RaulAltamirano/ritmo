<template>
  <div
    class="bg-surface rounded-lg shadow-sm border border-outline overflow-hidden group hover:shadow-md transition-all duration-200"
  >
    <!-- Imagen -->
    <div class="relative aspect-video overflow-hidden">
      <img
        :src="image.url"
        :alt="image.description"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      <!-- Overlay con información de la fase -->
      <div class="absolute top-3 left-3">
        <BaseBadge
          :variant="getPhaseVariant(image.phase)"
          :content="getPhaseDisplayText(image.phase)"
          size="sm"
          class="shadow-lg"
        />
      </div>

      <!-- Botón de like -->
      <button
        @click="$emit('like-image', image.id)"
        class="absolute top-3 right-3 w-8 h-8 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
        :class="image.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'"
      >
        <Heart :size="16" :fill="image.isLiked ? 'currentColor' : 'none'" />
      </button>
    </div>

    <!-- Contenido de la tarjeta -->
    <div class="p-4 space-y-3">
      <!-- Información del usuario -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center"
          >
            <User class="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ image.uploadedBy }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatDate(image.uploadedAt) }}
            </p>
          </div>
        </div>

        <!-- Contador de likes -->
        <div class="flex items-center gap-1">
          <Heart :size="14" class="text-red-500" />
          <span class="text-sm text-gray-600 dark:text-gray-400">{{
            image.likes
          }}</span>
        </div>
      </div>

      <!-- Descripción -->
      <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
        {{ image.description }}
      </p>

      <!-- Botón de agregar a mi fase -->
      <div class="flex items-center gap-2">
        <BaseButton
          variant="outline"
          size="sm"
          :icon="Plus"
          @click="showPhaseSelector = true"
          class="flex-1"
        >
          Agregar a mi fase
        </BaseButton>
      </div>
    </div>

    <!-- Modal selector de fase -->
    <div
      v-if="showPhaseSelector"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click="showPhaseSelector = false"
    >
      <div
        class="bg-surface rounded-lg p-6 max-w-sm w-full mx-4"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Seleccionar fase
        </h3>

        <div class="space-y-2">
          <button
            v-for="phase in phases"
            :key="phase.id"
            @click="addToPhase(phase.id)"
            class="w-full flex items-center gap-3 p-3 rounded-lg border border-outline-strong hover:bg-surface-raised transition-colors"
          >
            <BaseBadge
              :variant="getPhaseVariant(phase.id)"
              :content="`${phase.emoji} ${phase.name}`"
              size="sm"
            />
          </button>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <BaseButton variant="outline" size="sm" @click="showPhaseSelector = false">
            Cancelar
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import BaseBadge from '@ritmo/ui/components/atoms/feedback/BaseBadge.vue'
import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
import { Heart, Plus, User } from 'lucide-vue-next'
import { ref } from 'vue'

  interface Phase {
    id: string
    name: string
    emoji: string
    icon: string
    color: string
    image: string
    category: string
    priority: string
    startHour: number
    endHour: number
    duration: number
    keyword: string
    description: string
    idealFor: string
  }

  interface UserImage {
    id: string
    url: string
    phase: string
    phaseName: string
    uploadedBy: string
    uploadedAt: string
    likes: number
    isLiked: boolean
    description: string
  }

  interface UserImageCardProps {
    image: UserImage
    phases: Phase[]
  }

  const props = defineProps<UserImageCardProps>()

  const emit = defineEmits<{
    'add-to-phase': [imageId: string, phaseId: string]
    'like-image': [imageId: string]
  }>()

  const showPhaseSelector = ref(false)

  const getPhaseColor = (phaseId: string) => {
    const phase = props.phases.find(p => p.id === phaseId)
    return phase?.color || '#6B7280'
  }

  const getPhaseName = (phaseId: string) => {
    const phase = props.phases.find(p => p.id === phaseId)
    return phase?.name || 'Desconocida'
  }

  const getPhaseEmoji = (phaseId: string) => {
    const phase = props.phases.find(p => p.id === phaseId)
    return phase?.emoji || '❓'
  }

  const getPhaseDisplayText = (phaseId: string) => {
    const phase = props.phases.find(p => p.id === phaseId)
    if (!phase) return '❓ Desconocida'

    // Para el badge en la imagen, usar solo el emoji + nombre corto
    const shortName = phase.name.split(' ')[0] // Tomar solo la primera palabra
    return `${phase.emoji} ${shortName}`
  }

  const getPhaseVariant = (phaseId: string) => {
    const phase = props.phases.find(p => p.id === phaseId)
    if (!phase) return 'neutral'

    // Mapear categorías de fase a variantes de badge
    const categoryMap = {
      activation: 'warning',
      performance: 'primary',
      creative: 'info',
      reflection: 'secondary',
      rest: 'neutral',
    }

    return categoryMap[phase.category as keyof typeof categoryMap] || 'neutral'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const addToPhase = (phaseId: string) => {
    emit('add-to-phase', props.image.id, phaseId)
    showPhaseSelector.value = false
  }
</script>

<style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
