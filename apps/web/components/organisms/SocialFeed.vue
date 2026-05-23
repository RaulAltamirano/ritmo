<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Users class="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Study Community
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ posts.length }} posts
          </p>
        </div>
      </div>

      <button
        @click="showCreatePost = true"
        class="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        <Plus class="h-4 w-4" />
        <span class="hidden sm:inline">Crear Post</span>
      </button>
    </div>

    <!-- Filtros -->
    <div class="flex items-center space-x-2 overflow-x-auto pb-2">
      <span class="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap"
        >Filtrar:</span
      >

      <div class="flex space-x-2">
        <button
          v-for="filter in filters"
          :key="filter.type"
          @click="activeFilter = filter.type"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap"
          :class="[
            activeFilter === filter.type
              ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
              : 'bg-surface-overlay text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600',
          ]"
        >
          <component :is="filter.icon" class="h-3 w-3 mr-1 inline" />
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Feed de posts -->
    <div class="space-y-4">
      <div
        v-for="post in filteredPosts"
        :key="post.id"
        class="bg-surface rounded-lg border border-outline overflow-hidden"
      >
        <!-- Header del post -->
        <div class="p-4 border-b border-outline">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="relative">
                <div
                  class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
                >
                  <span class="text-white font-semibold text-sm">{{
                    post.author.initials
                  }}</span>
                </div>
                <div
                  v-if="post.author.verified"
                  class="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <Check class="h-2 w-2 text-white" />
                </div>
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h4 class="font-semibold text-gray-900 dark:text-white text-sm">
                    {{ post.author.name }}
                  </h4>
                  <span class="text-xs text-gray-500 dark:text-gray-400"
                    >@{{ post.author.username }}</span
                  >
                </div>
                <div
                  class="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400"
                >
                  <span>{{ post.author.role }}</span>
                  <span>•</span>
                  <span>{{ formatTimeAgo(post.createdAt) }}</span>
                  <PostTypeBadge :type="post.content.type" />
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-1">
              <button
                v-if="post.isPinned"
                class="p-1 text-yellow-500 hover:text-yellow-600"
                title="Post fijado"
              >
                <Pin class="h-4 w-4" />
              </button>
              <button
                class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <MoreHorizontal class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Contenido del post -->
        <div class="p-4">
          <PostContent :post="post" />
        </div>

        <!-- Interacciones -->
        <div class="px-4 py-3 bg-surface-raised/50 border-t border-outline">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <!-- Like -->
              <button
                @click="toggleLike(post.id)"
                class="flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors"
                :class="[
                  post.interactions.isLiked
                    ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20',
                ]"
              >
                <Heart
                  :class="post.interactions.isLiked ? 'fill-current' : ''"
                  class="h-4 w-4"
                />
                <span class="text-sm font-medium">{{ post.interactions.likes }}</span>
              </button>

              <!-- Comentarios -->
              <button
                @click="toggleComments(post.id)"
                class="flex items-center space-x-1 px-2 py-1 rounded-lg text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <MessageCircle class="h-4 w-4" />
                <span class="text-sm font-medium">{{
                  post.interactions.comments
                }}</span>
              </button>

              <!-- Compartir -->
              <button
                class="flex items-center space-x-1 px-2 py-1 rounded-lg text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              >
                <Share2 class="h-4 w-4" />
                <span class="text-sm font-medium">{{ post.interactions.shares }}</span>
              </button>
            </div>

            <!-- Guardar -->
            <button
              @click="toggleBookmark(post.id)"
              class="p-2 rounded-lg transition-colors"
              :class="[
                post.interactions.isBookmarked
                  ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20',
              ]"
            >
              <Bookmark
                :class="post.interactions.isBookmarked ? 'fill-current' : ''"
                class="h-4 w-4"
              />
            </button>
          </div>
        </div>

        <!-- Comentarios expandidos -->
        <div v-if="expandedComments.includes(post.id)" class="border-t border-outline">
          <div class="p-4 space-y-3">
            <div
              v-for="comment in post.comments"
              :key="comment.id"
              class="flex items-start space-x-3"
            >
              <div
                class="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center"
              >
                <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">{{
                  comment.author.initials
                }}</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-1">
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                    comment.author.name
                  }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{
                    formatTimeAgo(comment.createdAt)
                  }}</span>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300">
                  {{ comment.content }}
                </p>
                <div class="flex items-center space-x-4 mt-2">
                  <button
                    class="text-xs text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Heart class="h-3 w-3 mr-1 inline" />
                    {{ comment.likes }}
                  </button>
                  <button
                    class="text-xs text-gray-500 hover:text-blue-500 transition-colors"
                  >
                    Responder
                  </button>
                </div>
              </div>
            </div>

            <!-- Input para nuevo comentario -->
            <div class="flex items-center space-x-3 pt-3 border-t border-outline">
              <div
                class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
              >
                <span class="text-xs font-semibold text-white">TU</span>
              </div>
              <div class="flex-1">
                <input
                  v-model="newComment[post.id]"
                  @keyup.enter="addComment(post.id)"
                  placeholder="Escribe un comentario..."
                  class="w-full px-3 py-2 text-sm border border-outline-strong rounded-lg bg-surface text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-if="filteredPosts.length === 0" class="text-center py-12">
      <Users class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        No hay posts disponibles
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Sé el primero en compartir algo con la comunidad
      </p>
    </div>

    <!-- Modal para crear post -->
    <CreatePostModal
      v-if="showCreatePost"
      @close="showCreatePost = false"
      @created="handlePostCreated"
    />
  </div>
</template>

<script setup lang="ts">
  import PostTypeBadge from '@/components/atoms/PostTypeBadge.vue'
  import CreatePostModal from '@/components/molecules/CreatePostModal.vue'
  import PostContent from '@/components/molecules/PostContent.vue'
  import type { SocialPost } from '@/types/social'
  import {
    Bookmark,
    Check,
    FileText,
    Heart,
    Image,
    Lightbulb,
    MessageCircle,
    MoreHorizontal,
    Music,
    Pin,
    Plus,
    Share2,
    Star,
    Trophy,
    Users,
  } from 'lucide-vue-next'
  import { computed, ref } from 'vue'

  // Props
  interface Props {
    posts: SocialPost[]
  }

  const props = defineProps<Props>()

  // Estado local
  const activeFilter = ref<string>('all')
  const expandedComments = ref<string[]>([])
  const newComment = ref<Record<string, string>>({})
  const showCreatePost = ref(false)

  // Filtros disponibles
  const filters = ref([
    { type: 'all', label: 'Todos', icon: Users },
    { type: 'technique', label: 'Técnicas', icon: Lightbulb },
    { type: 'music', label: 'Música', icon: Music },
    { type: 'image', label: 'Imágenes', icon: Image },
    { type: 'trophy', label: 'Trofeos', icon: Trophy },
    { type: 'review', label: 'Reseñas', icon: Star },
    { type: 'article', label: 'Artículos', icon: FileText },
  ])

  // Posts filtrados
  const filteredPosts = computed(() => {
    if (activeFilter.value === 'all') {
      return props.posts
    }
    return props.posts.filter(post => post.content.type === activeFilter.value)
  })

  // Métodos
  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'hace un momento'
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)}d`
    return `hace ${Math.floor(diffInSeconds / 2592000)}mes`
  }

  const toggleLike = (postId: string) => {
    // Implementar lógica de like
    console.log('Toggle like for post:', postId)
  }

  const toggleComments = (postId: string) => {
    const index = expandedComments.value.indexOf(postId)
    if (index > -1) {
      expandedComments.value.splice(index, 1)
    } else {
      expandedComments.value.push(postId)
    }
  }

  const toggleBookmark = (postId: string) => {
    // Implementar lógica de bookmark
    console.log('Toggle bookmark for post:', postId)
  }

  const addComment = (postId: string) => {
    const content = newComment.value[postId]
    if (content?.trim()) {
      // Implementar lógica de comentario
      console.log('Add comment to post:', postId, content)
      newComment.value[postId] = ''
    }
  }

  const handlePostCreated = (newPost: SocialPost) => {
    // Agregar el nuevo post al inicio del feed
    console.log('New post created:', newPost)
    showCreatePost.value = false
  }
</script>
