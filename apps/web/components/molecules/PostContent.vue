<template>
  <div class="space-y-4">
    <!-- Técnica de Estudio -->
    <div v-if="post.content.type === 'technique'" class="space-y-4">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {{ post.content.title }}
        </h3>
        <p class="text-gray-700 dark:text-gray-300 mb-4">
          {{ post.content.description }}
        </p>
      </div>

      <!-- Experiencia personal -->
      <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div class="flex items-center space-x-2 mb-2">
          <MessageCircle class="h-4 w-4 text-blue-600" />
          <span class="text-sm font-medium text-blue-700 dark:text-blue-300"
            >Experiencia Personal</span
          >
        </div>
        <p class="text-sm text-gray-700 dark:text-gray-300 italic">
          "{{ post.content.personalExperience }}"
        </p>
      </div>

      <!-- Detalles de la técnica -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-surface-raised rounded-lg p-3">
          <div class="flex items-center space-x-2 mb-1">
            <TrendingUp class="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >Efectividad</span
            >
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ post.content.effectiveness }}
          </p>
        </div>
        <div class="bg-surface-raised rounded-lg p-3">
          <div class="flex items-center space-x-2 mb-1">
            <Clock class="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >Tiempo Requerido</span
            >
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ post.content.timeRequired }}
          </p>
        </div>
      </div>

      <!-- Fuentes -->
      <div v-if="post.content.sources.length > 0">
        <div class="flex items-center space-x-2 mb-3">
          <ExternalLink class="h-4 w-4 text-gray-600" />
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
            >Fuentes y Recursos</span
          >
        </div>
        <div class="space-y-2">
          <div
            v-for="source in post.content.sources"
            :key="source.title"
            class="flex items-center justify-between p-2 bg-surface-raised rounded-lg hover:bg-surface-overlay transition-colors"
          >
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ source.title }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ source.type }}</p>
            </div>
            <a
              :href="source.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <ExternalLink class="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <!-- Tags -->
      <div class="flex items-center space-x-2">
        <span
          class="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
        >
          {{ post.content.category }}
        </span>
        <span
          class="px-2 py-1 bg-surface-overlay text-gray-600 dark:text-gray-400 rounded-full text-xs"
        >
          {{ post.content.difficulty }}
        </span>
      </div>
    </div>

    <!-- Recomendación de Música -->
    <div v-else-if="post.content.type === 'music'" class="space-y-4">
      <div class="flex items-start space-x-4">
        <div
          class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center"
        >
          <Music class="h-8 w-8 text-white" />
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ post.content.title }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400">{{ post.content.artist }}</p>
          <p v-if="post.content.album" class="text-sm text-gray-500 dark:text-gray-500">
            {{ post.content.album }}
          </p>
        </div>
      </div>

      <p class="text-gray-700 dark:text-gray-300">{{ post.content.description }}</p>

      <!-- Detalles de la música -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-surface-raised rounded-lg p-3 text-center">
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Género</div>
          <div class="text-xs text-gray-600 dark:text-gray-400">
            {{ post.content.genre }}
          </div>
        </div>
        <div class="bg-surface-raised rounded-lg p-3 text-center">
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Fase</div>
          <div class="text-xs text-gray-600 dark:text-gray-400">
            {{ post.content.studyPhase }}
          </div>
        </div>
        <div class="bg-surface-raised rounded-lg p-3 text-center">
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Duración
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400">
            {{ post.content.duration }}
          </div>
        </div>
        <div
          v-if="post.content.bpm"
          class="bg-surface-raised rounded-lg p-3 text-center"
        >
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300">BPM</div>
          <div class="text-xs text-gray-600 dark:text-gray-400">
            {{ post.content.bpm }}
          </div>
        </div>
      </div>

      <!-- Mood tags -->
      <div v-if="post.content.mood.length > 0" class="flex flex-wrap gap-2">
        <span
          v-for="mood in post.content.mood"
          :key="mood"
          class="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-full text-xs"
        >
          {{ mood }}
        </span>
      </div>

      <!-- Enlaces -->
      <div class="flex space-x-3">
        <a
          v-if="post.content.spotifyUrl"
          :href="post.content.spotifyUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Music class="h-4 w-4" />
          <span class="text-sm font-medium">Spotify</span>
        </a>
        <a
          v-if="post.content.youtubeUrl"
          :href="post.content.youtubeUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Play class="h-4 w-4" />
          <span class="text-sm font-medium">YouTube</span>
        </a>
      </div>
    </div>

    <!-- Imagen -->
    <div v-else-if="post.content.type === 'image'" class="space-y-4">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {{ post.content.title }}
        </h3>
        <p class="text-gray-700 dark:text-gray-300 mb-4">
          {{ post.content.description }}
        </p>
      </div>

      <div class="relative">
        <img
          :src="post.content.imageUrl"
          :alt="post.content.title"
          class="w-full h-64 object-cover rounded-lg"
        />
        <div class="absolute top-3 left-3">
          <span
            class="px-2 py-1 bg-black/50 text-white rounded-full text-xs font-medium"
          >
            {{ post.content.category }}
          </span>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="post.content.tags.length > 0" class="flex flex-wrap gap-2">
        <span
          v-for="tag in post.content.tags"
          :key="tag"
          class="px-2 py-1 bg-surface-overlay text-gray-600 dark:text-gray-400 rounded-full text-xs"
        >
          #{{ tag }}
        </span>
      </div>
    </div>

    <!-- Trofeo -->
    <div v-else-if="post.content.type === 'trophy'" class="space-y-4">
      <div class="flex items-start space-x-4">
        <div
          class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center"
        >
          <Trophy class="h-8 w-8 text-white" />
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ post.content.title }}
          </h3>
          <p class="text-gray-700 dark:text-gray-300">{{ post.content.description }}</p>
        </div>
      </div>

      <!-- Detalles del logro -->
      <div
        class="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4"
      >
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-semibold text-gray-900 dark:text-white">
            {{ post.content.achievement.name }}
          </h4>
          <span
            class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-full text-xs font-medium"
          >
            {{ post.content.achievement.rarity }}
          </span>
        </div>
        <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">
          {{ post.content.achievement.description }}
        </p>
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600 dark:text-gray-400"
            >{{ post.content.achievement.points }} puntos</span
          >
          <Trophy class="h-5 w-5 text-yellow-500" />
        </div>
      </div>

      <!-- Sesión de estudio asociada -->
      <div v-if="post.content.studySession" class="bg-surface-raised rounded-lg p-3">
        <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Sesión de Estudio
        </h5>
        <div class="grid grid-cols-3 gap-3 text-center">
          <div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Duración</div>
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {{ post.content.studySession.duration }}
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Técnica</div>
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {{ post.content.studySession.technique }}
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Materia</div>
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {{ post.content.studySession.subject }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reseña -->
    <div v-else-if="post.content.type === 'review'" class="space-y-4">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {{ post.content.title }}
        </h3>
        <div class="flex items-center space-x-3 mb-3">
          <div class="flex items-center">
            <Star
              v-for="i in 5"
              :key="i"
              :class="
                i <= post.content.rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              "
              class="h-4 w-4"
            />
          </div>
          <span class="text-sm text-gray-600 dark:text-gray-400"
            >{{ post.content.rating }}/5</span
          >
          <span
            class="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full text-xs"
          >
            {{ post.content.category }}
          </span>
        </div>
        <p class="text-gray-700 dark:text-gray-300">{{ post.content.itemName }}</p>
      </div>

      <!-- Pros y Contras -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <h5 class="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
            ✅ Pros
          </h5>
          <ul class="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li v-for="pro in post.content.pros" :key="pro" class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ pro }}</span>
            </li>
          </ul>
        </div>
        <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
          <h5 class="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
            ❌ Contras
          </h5>
          <ul class="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li v-for="con in post.content.cons" :key="con" class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ con }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Recomendación -->
      <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
        <h5 class="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
          💡 Recomendación
        </h5>
        <p class="text-sm text-gray-700 dark:text-gray-300">
          {{ post.content.recommendation }}
        </p>
        <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">
          <strong>Audiencia objetivo:</strong> {{ post.content.targetAudience }}
        </p>
      </div>
    </div>

    <!-- Artículo -->
    <div v-else-if="post.content.type === 'article'" class="space-y-4">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {{ post.content.title }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-3">{{ post.content.excerpt }}</p>
        <div
          class="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400"
        >
          <span>{{ post.content.readTime }} de lectura</span>
          <span>•</span>
          <span>{{ post.content.category }}</span>
        </div>
      </div>

      <!-- Imagen destacada -->
      <div v-if="post.content.featuredImage" class="relative">
        <img
          :src="post.content.featuredImage"
          :alt="post.content.title"
          class="w-full h-48 object-cover rounded-lg"
        />
      </div>

      <!-- Tags -->
      <div v-if="post.content.tags.length > 0" class="flex flex-wrap gap-2">
        <span
          v-for="tag in post.content.tags"
          :key="tag"
          class="px-2 py-1 bg-surface-overlay text-gray-600 dark:text-gray-400 rounded-full text-xs"
        >
          #{{ tag }}
        </span>
      </div>

      <!-- Enlace externo -->
      <div v-if="post.content.externalUrl" class="flex justify-center">
        <a
          :href="post.content.externalUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <ExternalLink class="h-4 w-4" />
          <span class="text-sm font-medium">Leer artículo completo</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { SocialPost } from '@/types/social'
  import {
    Clock,
    ExternalLink,
    MessageCircle,
    Music,
    Play,
    Star,
    TrendingUp,
    Trophy,
  } from 'lucide-vue-next'

  interface Props {
    post: SocialPost
  }

  defineProps<Props>()
</script>
