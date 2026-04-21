<template>
  <div class="min-h-screen bg-canvas">
    <!-- Mobile-optimized container -->
    <div class="max-w-full mx-auto px-4 py-3 sm:px-6 lg:px-8 sm:py-6 lg:py-8">
      <!-- Header using PageHeader -->
      <PageHeader title="Trending Circadian Backgrounds"
        subtitle="Discover the most popular and voted backgrounds for your daily rhythm phases" :actions="true"
        size="lg">
        <template #actions>
          <!-- Desktop: Toggle filters button -->
          <BaseButton variant="outline" :icon="showFilters ? EyeOff : Eye" @click="showFilters = !showFilters"
            class="hidden sm:flex">
            {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
          </BaseButton>

          <!-- Mobile: Menu item -->
          <BaseMenuItem :icon="showFilters ? EyeOff : Eye" :label="showFilters ? 'Hide Filters' : 'Show Filters'"
            @click="showFilters = !showFilters" class="sm:hidden" />
        </template>
      </PageHeader>

      <!-- Image filters -->
      <div v-if="showFilters" class="mb-6">
        <ImageFilters :selected-phase="selectedPhaseFilter" :phases="phases" :filtered-count="filteredImages.length"
          :is-loading="isLoading" @filter-change="handleFilterChange" />
      </div>

      <!-- Image gallery -->
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            Most Voted Backgrounds
          </h2>
          <BaseButton variant="primary" :icon="Upload" @click="showUploadModal = true">
            Upload Image
          </BaseButton>
        </div>

        <!-- Loading state -->
        <LoadingState v-if="isLoading" title="Loading Phase Images"
          description="Discovering trending images from the community" spinner-variant="dots" spinner-size="lg"
          spinner-color="primary" :show-progress="false" />

        <!-- Image grid -->
        <div v-else-if="filteredImages.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <UserImageCard v-for="image in filteredImages" :key="image.id" :image="image" :phases="phases"
            @add-to-phase="handleAddToPhase" @like-image="handleLikeImage" />
        </div>

        <!-- Empty state -->
        <EmptyState v-else title="No images available"
          description="Be the first to share an image for this circadian phase" :icon="Image">
          <BaseButton variant="primary" :icon="Upload" @click="showUploadModal = true" class="mt-4">
            Upload First Image
          </BaseButton>
        </EmptyState>
      </div>

      <!-- Image upload modal -->
      <ImageUploadModal :is-open="showUploadModal" :phases="phases" @update:is-open="showUploadModal = $event"
        @close="showUploadModal = false" @upload-success="handleUploadSuccess" />
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
import EmptyState from '@ritmo/ui/components/molecules/feedback/EmptyState.vue'
import LoadingState from '@ritmo/ui/components/molecules/feedback/LoadingState.vue'
import PageHeader from '@ritmo/ui/components/molecules/layout/PageHeader.vue'
import BaseMenuItem from '@ritmo/ui/components/molecules/navigation/BaseMenuItem.vue'
import { Eye, EyeOff, Image, Upload } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import ImageFilters from '@/components/molecules/ImageFilters.vue'
import ImageUploadModal from '@/components/molecules/ImageUploadModal.vue'
import UserImageCard from '@/components/molecules/UserImageCard.vue'

// Page meta
definePageMeta({
  title: 'Trending Circadian Backgrounds - Ritmo',
  description:
    'Discover the most popular and voted backgrounds for your daily rhythm phases',
})

// Interfaces
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

// Estado de la interfaz
const showFilters = ref(true)
const showUploadModal = ref(false)
const selectedPhaseFilter = ref<string | null>(null)
const isLoading = ref(true)

// Datos de fases (ejemplo - en producción vendría de la API)
const phases = ref([
  {
    id: 'slow_activation',
    name: 'Slow Activation Phase',
    emoji: '🟡',
    icon: 'coffee',
    color: '#fde047',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    category: 'activation',
    priority: 'low',
    startHour: 5,
    endHour: 7,
    duration: 120,
    keyword: 'Calm',
    description:
      'Low alertness due to sleep inertia. Cortisol levels begin to rise, but performance is still suboptimal. Best suited for gentle activation tasks.',
    idealFor: 'Meditation, journaling, visualization',
  },
  {
    id: 'morning_focus_peak',
    name: 'Morning Focus Peak',
    emoji: '🟢',
    icon: 'sun',
    color: '#4ade80',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    category: 'performance',
    priority: 'critical',
    startHour: 7,
    endHour: 9,
    duration: 120,
    keyword: 'Focus',
    description:
      'High attention and short-term memory performance, supported by circadian cortisol peak. Ideal for structured study and detail-oriented tasks.',
    idealFor: 'Technical reading, structured study',
  },
  {
    id: 'cognitive_peak',
    name: 'Cognitive Performance Peak',
    emoji: '🔵',
    icon: 'activity',
    color: '#60a5fa',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    category: 'performance',
    priority: 'critical',
    startHour: 9,
    endHour: 12,
    duration: 180,
    keyword: 'Peak',
    description:
      'Maximum cognitive performance for problem-solving, logic, and deep work. Processing speed and working memory reach high levels.',
    idealFor: 'Programming, logic, deep work',
  },
  {
    id: 'second_productivity',
    name: 'Second Productivity Peak',
    emoji: '🔵',
    icon: 'repeat',
    color: '#38bdf8',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    category: 'performance',
    priority: 'high',
    startHour: 13,
    endHour: 15,
    duration: 120,
    keyword: 'Review',
    description:
      'Second circasemidian peak. If recovered, cognitive performance improves again, especially for review and technical tasks.',
    idealFor: 'Review, technical tasks, recap',
  },
  {
    id: 'creative_window',
    name: 'Creative/Verbal Window',
    emoji: '🟣',
    icon: 'pen-tool',
    color: '#a78bfa',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    category: 'creative',
    priority: 'medium',
    startHour: 15,
    endHour: 17,
    duration: 120,
    keyword: 'Create',
    description:
      'Verbal fluency and creative thinking increase in the afternoon. Creativity often benefits from reduced inhibition during descending energy.',
    idealFor: 'Writing, design, language output',
  },
  {
    id: 'transition',
    name: 'Transition Phase',
    emoji: '🟠',
    icon: 'book-open',
    color: '#fdba74',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    category: 'reflection',
    priority: 'medium',
    startHour: 17,
    endHour: 19,
    duration: 120,
    keyword: 'Reflect',
    description:
      'Energy starts to decline; reflection and memory consolidation become more prominent. Best for journaling and active review.',
    idealFor: 'Consolidation, active review, journaling',
  },
  {
    id: 'introspective',
    name: 'Introspective Phase',
    emoji: '🟡',
    icon: 'moon',
    color: '#fde047',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    category: 'reflection',
    priority: 'low',
    startHour: 19,
    endHour: 21,
    duration: 120,
    keyword: 'Plan',
    description:
      'Autobiographical memory and emotional integration become dominant. Good for planning and visualization.',
    idealFor: 'Slow reading, visualization, planning',
  },
  {
    id: 'sleep_preparation',
    name: 'Sleep Preparation',
    emoji: '⚫',
    icon: 'bed',
    color: '#a3a3a3',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    category: 'rest',
    priority: 'low',
    startHour: 21,
    endHour: 23,
    duration: 120,
    keyword: 'Sleep',
    description:
      'Cortical activity decreases as melatonin rises. Best for winding down and sleep hygiene routines.',
    idealFor: 'Rest routine, sleep hygiene',
  },
])

// Datos de imágenes de usuarios (ejemplo - en producción vendría de la API)
const userImages = ref([
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    phase: 'slow_activation',
    phaseName: 'Slow Activation Phase',
    uploadedBy: 'Ana García',
    uploadedAt: '2024-01-15',
    likes: 24,
    isLiked: false,
    description: 'Amanecer tranquilo para meditación matutina',
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    phase: 'morning_focus_peak',
    phaseName: 'Morning Focus Peak',
    uploadedBy: 'Carlos López',
    uploadedAt: '2024-01-14',
    likes: 18,
    isLiked: true,
    description: 'Espacio de trabajo optimizado para máxima concentración',
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    phase: 'cognitive_peak',
    phaseName: 'Cognitive Performance Peak',
    uploadedBy: 'María Rodríguez',
    uploadedAt: '2024-01-13',
    likes: 31,
    isLiked: false,
    description: 'Ambiente ideal para programación y trabajo profundo',
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    phase: 'creative_window',
    phaseName: 'Creative/Verbal Window',
    uploadedBy: 'Luis Martínez',
    uploadedAt: '2024-01-12',
    likes: 27,
    isLiked: false,
    description: 'Inspiración creativa para diseño y escritura',
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    phase: 'transition',
    phaseName: 'Transition Phase',
    uploadedBy: 'Elena Fernández',
    uploadedAt: '2024-01-11',
    likes: 15,
    isLiked: true,
    description: 'Momento de reflexión y consolidación del día',
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    phase: 'sleep_preparation',
    phaseName: 'Sleep Preparation',
    uploadedBy: 'David Pérez',
    uploadedAt: '2024-01-10',
    likes: 22,
    isLiked: false,
    description: 'Rutina relajante para preparar el sueño',
  },
])

// Imágenes filtradas
const filteredImages = computed(() => {
  if (!selectedPhaseFilter.value) {
    return userImages.value
  }
  return userImages.value.filter(img => img.phase === selectedPhaseFilter.value)
})

// Métodos

const handleFilterChange = (phaseId: string | null) => {
  selectedPhaseFilter.value = phaseId
}

const handleAddToPhase = (imageId: string, phaseId: string) => {
  // Aquí se implementaría la lógica para agregar la imagen a la fase del usuario
  console.log(`Agregando imagen ${imageId} a fase ${phaseId}`)
}

const handleLikeImage = (imageId: string) => {
  const imageIndex = userImages.value.findIndex(img => img.id === imageId)
  if (imageIndex !== -1) {
    userImages.value[imageIndex].isLiked = !userImages.value[imageIndex].isLiked
    userImages.value[imageIndex].likes += userImages.value[imageIndex].isLiked
      ? 1
      : -1
  }
}

const handleUploadSuccess = (newImage: any) => {
  userImages.value.unshift(newImage)
  showUploadModal.value = false
}

// Simple data loading simulation
const simulateDataLoading = async () => {
  const steps = [
    { message: 'Loading phases...' },
    { message: 'Fetching images...' },
    { message: 'Processing data...' },
    { message: 'Ready!' },
  ]

  for (const step of steps) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log(step.message)
  }

  // Complete loading
  await new Promise(resolve => setTimeout(resolve, 500))
  isLoading.value = false
}

// Initialize on page mount
onMounted(async () => {
  console.log('Starting trending circadian backgrounds data loading...')
  await simulateDataLoading()
  console.log('Trending circadian backgrounds data loaded successfully!')
})
</script>

<style scoped>
/* Specific styles for the trending circadian backgrounds page */
</style>
