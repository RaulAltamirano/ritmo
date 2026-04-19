<template>
  <BaseCard class="p-6">
    <h3 class="text-lg font-semibold mb-4 flex items-center">
      <Lightbulb class="mr-2" />
      Study Techniques
    </h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
      Real experiences and proven methods from successful students
    </p>

    <div class="space-y-6">
      <div
        v-for="technique in techniques"
        :key="technique.id"
        class="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-200"
      >
        <!-- Header with author info -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center"
            >
              <span class="text-white font-semibold text-sm">{{
                technique.author.initials
              }}</span>
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-base text-gray-900 dark:text-white">
                {{ technique.title }}
              </h4>
              <div
                class="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400"
              >
                <span>{{ technique.author.name }}</span>
                <span>•</span>
                <span>{{ technique.author.role }}</span>
                <span>•</span>
                <span>{{ technique.author.experience }}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-1">
            <Heart :size="16" class="text-red-500" />
            <span class="text-sm text-gray-600 dark:text-gray-400 font-medium">{{
              technique.likes
            }}</span>
          </div>
        </div>

        <!-- Technique description -->
        <p class="text-sm text-gray-700 dark:text-gray-300 mb-4 font-medium">
          {{ technique.description }}
        </p>

        <!-- User experience -->
        <div class="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 mb-4">
          <div class="flex items-center space-x-2 mb-2">
            <MessageCircle :size="14" class="text-blue-600" />
            <span class="text-xs font-medium text-blue-600 dark:text-blue-400"
              >Personal Experience</span
            >
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 italic">
            "{{ technique.userComment }}"
          </p>
        </div>

        <!-- Research and effectiveness -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div
            class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
          >
            <div class="flex items-center space-x-2 mb-1">
              <TrendingUp :size="14" class="text-gray-600 dark:text-gray-400" />
              <span class="text-xs font-medium text-gray-700 dark:text-gray-300"
                >Research</span
              >
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ technique.research }}
            </p>
          </div>
          <div
            class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
          >
            <div class="flex items-center space-x-2 mb-1">
              <Clock :size="14" class="text-gray-600 dark:text-gray-400" />
              <span class="text-xs font-medium text-gray-700 dark:text-gray-300"
                >Time Required</span
              >
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ technique.timeRequired }}
            </p>
          </div>
        </div>

        <!-- Sources and links -->
        <div class="mb-4">
          <div class="flex items-center space-x-2 mb-3">
            <ExternalLink :size="14" class="text-gray-600" />
            <span class="text-xs font-medium text-gray-600 dark:text-gray-400"
              >Sources & Resources</span
            >
          </div>
          <div class="space-y-2">
            <div
              v-for="source in technique.sources"
              :key="source.title"
              class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div class="flex-1">
                <p class="text-xs font-medium text-gray-900 dark:text-white">
                  {{ source.title }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ source.type }}
                </p>
              </div>
              <a
                :href="source.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                <ExternalLink :size="12" />
              </a>
            </div>
          </div>
        </div>

        <!-- Metadata footer -->
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center space-x-3">
            <span
              class="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full font-medium"
            >
              {{ technique.category }}
            </span>
            <span
              class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
            >
              {{ technique.difficulty }}
            </span>
            <span class="text-gray-500 dark:text-gray-400">
              {{ technique.duration }}
            </span>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span class="text-green-600 dark:text-green-400 font-medium">{{
              technique.effectiveness
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="techniques.length === 0" class="text-center py-8">
      <Lightbulb class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        No techniques available
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Study techniques will appear here
      </p>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
  import BaseCard from '@ritmo/ui/components/atoms/layout/BaseCard.vue'
import {
    Clock,
    ExternalLink,
    Heart,
    Lightbulb,
    MessageCircle,
    TrendingUp,
} from 'lucide-vue-next'

  interface Author {
    name: string
    initials: string
    avatar: string
    role: string
    experience: string
  }

  interface Source {
    title: string
    url: string
    type: string
  }

  interface StudyTechnique {
    id: string
    title: string
    author: Author
    description: string
    userComment: string
    category: string
    likes: number
    technique: string
    duration: string
    effectiveness: string
    sources: Source[]
    research: string
    difficulty: string
    timeRequired: string
  }

  interface Props {
    techniques: StudyTechnique[]
  }

  const props = defineProps<Props>()
</script>
