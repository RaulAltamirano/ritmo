<template>
  <div class="min-h-screen bg-canvas">
    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:pt-6 pt-16">
      <div class="max-w-4xl mx-auto">
        <!-- Contenido principal -->
        <div class="space-y-6">
          <!-- Racha del estudiante con tareas -->
          <section aria-labelledby="streak-heading">
            <StreakCard :streak="streakData.streak" :sessions-this-week="streakData.sessionsThisWeek"
              :total-time="streakData.totalTime" :weekly-progress="streakData.weeklyProgress" :tasks="tasks"
              @start-task="startTask" @delete-task="deleteTask" />
          </section>

          <!-- NUEVA SECCIÓN: Red Social de Estudio -->
          <section aria-labelledby="social-heading">
            <SocialFeed :posts="socialPosts as any" />
          </section>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Importaciones de iconos removidas - no se usan en este componente
import { ref } from 'vue'

// Importar componentes existentes
import StreakCard from '@/components/molecules/StreakCard.vue'

// Importar nuevos componentes
import SocialFeed from '@/components/organisms/SocialFeed.vue'

// Page meta
definePageMeta({
  title: 'Dashboard',
  description: 'Overview of your productivity streaks, progress, and study community',
})

// Estado removido - no se usa en este componente

// Datos de ejemplo
const streakData = ref({
  streak: 5,
  sessionsThisWeek: 12,
  totalTime: '8h 30m',
  weeklyProgress: 75,
})

const tasks = ref([
  {
    id: '1',
    name: 'Estudiar React Hooks',
    createdAt: new Date('2024-01-15T10:00:00'),
  },
  {
    id: '2',
    name: 'Completar proyecto de API',
    createdAt: new Date('2024-01-15T14:30:00'),
  },
  {
    id: '3',
    name: 'Revisar documentación de TypeScript',
    createdAt: new Date('2024-01-16T09:00:00'),
  },
])


// NUEVOS DATOS: Red Social de Estudio
const socialPosts = ref([
  {
    id: '1',
    author: {
      id: '1',
      name: 'Maria Gonzalez',
      username: 'maria_gonzalez',
      initials: 'MG',
      avatar: '/avatars/maria.jpg',
      role: 'Language Student',
      experience: '2 years',
      verified: true,
      followersCount: 150,
      followingCount: 200
    },
    content: {
      id: '1',
      type: 'technique' as const,
      title: 'Shadowing Technique',
      description: 'Repeat aloud what you hear while studying languages to improve pronunciation and fluency',
      technique: 'Shadowing',
      category: 'Languages',
      difficulty: 'Beginner' as const,
      timeRequired: '15-30 minutes daily',
      effectiveness: 'Highly Effective',
      research: 'Based on research by Alexander Arguelles showing 40% improvement in pronunciation accuracy',
      sources: [
        {
          title: 'The Shadowing Technique: A Practical Guide',
          url: 'https://www.fluentu.com/blog/shadowing-technique/',
          type: 'Article',
        },
        {
          title: 'Shadowing: The Ultimate Language Learning Method',
          url: 'https://www.youtube.com/watch?v=shadowing-guide',
          type: 'Video Tutorial',
        },
      ],
      personalExperience: 'I applied this for 2 weeks studying English and my pronunciation improved by 80%. At first I felt weird talking to myself, but it works incredibly well. The key is consistency and choosing content at your level.'
    },
    interactions: {
      likes: 47,
      comments: 12,
      shares: 8,
      bookmarks: 23,
      isLiked: false,
      isBookmarked: false
    },
    comments: [
      {
        id: '1',
        author: {
          id: '2',
          name: 'Carlos Ruiz',
          username: 'carlos_ruiz',
          initials: 'CR',
          avatar: '/avatars/carlos.jpg',
          role: 'Physics Student',
          experience: '3 years',
          verified: false,
          followersCount: 89,
          followingCount: 120
        },
        content: '¡Excelente técnica! La he usado para estudiar francés y funciona increíblemente bien.',
        createdAt: new Date('2024-01-15T10:30:00'),
        likes: 5
      }
    ],
    createdAt: new Date('2024-01-15T09:00:00'),
    isPinned: false,
    isFeatured: true
  },
  {
    id: '2',
    author: {
      id: '3',
      name: 'Ana Martinez',
      username: 'ana_martinez',
      initials: 'AM',
      avatar: '/avatars/ana.jpg',
      role: 'Software Developer',
      experience: '4 years',
      verified: true,
      followersCount: 320,
      followingCount: 180
    },
    content: {
      id: '2',
      type: 'music' as const,
      title: 'Weightless',
      artist: 'Marconi Union',
      album: 'Weightless',
      genre: 'Ambient',
      spotifyUrl: 'https://open.spotify.com/track/weightless',
      youtubeUrl: 'https://youtube.com/watch?v=weightless',
      description: 'Esta canción está científicamente diseñada para reducir la ansiedad. Perfecta para sesiones de estudio intenso.',
      studyPhase: 'deep-work' as const,
      duration: '8:10',
      bpm: 60,
      mood: ['calm', 'focused', 'relaxed']
    },
    interactions: {
      likes: 89,
      comments: 15,
      shares: 22,
      bookmarks: 45,
      isLiked: true,
      isBookmarked: true
    },
    comments: [],
    createdAt: new Date('2024-01-15T11:15:00'),
    isPinned: false,
    isFeatured: false
  },
  {
    id: '3',
    author: {
      id: '4',
      name: 'David Kim',
      username: 'david_kim',
      initials: 'DK',
      avatar: '/avatars/david.jpg',
      role: 'Medical Student',
      experience: '5 years',
      verified: true,
      followersCount: 450,
      followingCount: 300
    },
    content: {
      id: '3',
      type: 'trophy' as const,
      title: '¡Completé 100 horas de estudio!',
      description: 'Después de 3 meses usando la técnica de repetición espaciada, finalmente logré mi meta de 100 horas.',
      achievement: {
        name: 'Estudiante Persistente',
        description: 'Completa 100 horas de estudio efectivo',
        icon: 'trophy',
        rarity: 'rare' as const,
        points: 1000
      },
      studySession: {
        duration: '2 horas',
        technique: 'Spaced Repetition',
        subject: 'Anatomía'
      }
    },
    interactions: {
      likes: 156,
      comments: 28,
      shares: 35,
      bookmarks: 67,
      isLiked: false,
      isBookmarked: false
    },
    comments: [],
    createdAt: new Date('2024-01-15T14:20:00'),
    isPinned: true,
    isFeatured: false
  },
  {
    id: '4',
    author: {
      id: '5',
      name: 'Sofia Chen',
      username: 'sofia_chen',
      initials: 'SC',
      avatar: '/avatars/sofia.jpg',
      role: 'History Student',
      experience: '3 years',
      verified: false,
      followersCount: 78,
      followingCount: 95
    },
    content: {
      id: '4',
      type: 'review' as const,
      title: 'Reseña del curso de Historia Medieval',
      rating: 4,
      category: 'course' as const,
      itemName: 'Historia Medieval - Universidad Online',
      itemUrl: 'https://universidad-online.com/historia-medieval',
      pros: [
        'Contenido muy completo y bien estructurado',
        'Profesores expertos en el tema',
        'Materiales de estudio excelentes'
      ],
      cons: [
        'Algunas clases son muy largas',
        'Falta más interacción en vivo'
      ],
      recommendation: 'Lo recomiendo para estudiantes serios de historia. El contenido es de alta calidad.',
      targetAudience: 'Estudiantes universitarios de historia'
    },
    interactions: {
      likes: 34,
      comments: 8,
      shares: 5,
      bookmarks: 12,
      isLiked: false,
      isBookmarked: false
    },
    comments: [],
    createdAt: new Date('2024-01-15T16:45:00'),
    isPinned: false,
    isFeatured: false
  },
  {
    id: '5',
    author: {
      id: '6',
      name: 'Alex Johnson',
      username: 'alex_johnson',
      initials: 'AJ',
      avatar: '/avatars/alex.jpg',
      role: 'Computer Science Student',
      experience: '2 years',
      verified: true,
      followersCount: 200,
      followingCount: 150
    },
    content: {
      id: '5',
      type: 'image' as const,
      title: 'Mi setup de estudio perfecto',
      description: 'Después de meses probando diferentes configuraciones, finalmente encontré el setup ideal para estudiar programación.',
      imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
      category: 'study-setup',
      tags: ['setup', 'programming', 'productivity', 'workspace'],
      studyPhase: 'focus' as const,
    },
    interactions: {
      likes: 67,
      comments: 14,
      shares: 18,
      bookmarks: 29,
      isLiked: false,
      isBookmarked: false
    },
    comments: [],
    createdAt: new Date('2024-01-15T18:30:00'),
    isPinned: false,
    isFeatured: false
  },
  {
    id: '6',
    author: {
      id: '7',
      name: 'Sarah Wilson',
      username: 'sarah_wilson',
      initials: 'SW',
      avatar: '/avatars/sarah.jpg',
      role: 'Psychology Student',
      experience: '3 years',
      verified: true,
      followersCount: 180,
      followingCount: 220
    },
    content: {
      id: '6',
      type: 'article' as const,
      title: 'Cómo mejorar tu concentración durante el estudio',
      excerpt: 'Descubre técnicas científicamente probadas para mantener tu atención durante largas sesiones de estudio.',
      content: 'La concentración es clave para un estudio efectivo...',
      category: 'Productividad',
      tags: ['concentración', 'estudio', 'productividad', 'atención'],
      readTime: '5 min',
      featuredImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
      externalUrl: 'https://ejemplo.com/mejorar-concentracion'
    },
    interactions: {
      likes: 92,
      comments: 19,
      shares: 31,
      bookmarks: 54,
      isLiked: true,
      isBookmarked: true
    },
    comments: [],
    createdAt: new Date('2024-01-15T20:15:00'),
    isPinned: false,
    isFeatured: true
  }
])


// Métodos
const startTask = (args: { task: any; mode: any }) => {
  // Aquí podrías implementar la lógica para iniciar una tarea
  console.log('Iniciando tarea:', args.task)
}

const deleteTask = (taskId: string) => {
  const index = tasks.value.findIndex(task => task.id === taskId)
  if (index !== -1) {
    tasks.value.splice(index, 1)
  }
}
</script>
