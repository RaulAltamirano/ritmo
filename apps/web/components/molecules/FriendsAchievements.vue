<template>
  <BaseCard class="p-6">
    <h3 class="text-lg font-semibold mb-4 flex items-center">
      <Users class="mr-2" />
      Logros de Amigos
    </h3>
    <div class="space-y-3">
      <div
        v-for="achievement in achievements"
        :key="achievement.id"
        class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
      >
        <div
          class="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center"
        >
          <span class="text-white font-semibold text-sm">{{
            achievement.friend.initials
          }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ achievement.friend.name }} logró:
          </p>
          <p class="text-xs text-gray-600 dark:text-gray-400 truncate">
            {{ achievement.title }}
          </p>
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400">
          {{ formatTimeAgo(achievement.createdAt) }}
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="achievements.length === 0" class="text-center py-8">
      <Users class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        No hay logros recientes
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Los logros de tus amigos aparecerán aquí
      </p>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
  import BaseCard from '@ritmo/ui/components/atoms/layout/BaseCard.vue'
import { Users } from 'lucide-vue-next'

  interface Friend {
    name: string
    initials: string
  }

  interface Achievement {
    id: string
    friend: Friend
    title: string
    createdAt: Date
  }

  interface Props {
    achievements: Achievement[]
  }

  const props = defineProps<Props>()

  // Método para formatear tiempo transcurrido
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Hace menos de 1 hora'
    if (diffInHours < 24) return `Hace ${diffInHours} horas`

    const diffInDays = Math.floor(diffInHours / 24)
    return `Hace ${diffInDays} días`
  }
</script>
