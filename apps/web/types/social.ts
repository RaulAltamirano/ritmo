// Tipos para la red social de técnicas de estudio

export interface User {
  id: string
  name: string
  username: string
  initials: string
  avatar: string
  role: string
  experience: string
  verified?: boolean
  followersCount: number
  followingCount: number
}

export interface PostInteraction {
  likes: number
  comments: number
  shares: number
  bookmarks: number
  isLiked: boolean
  isBookmarked: boolean
}

export interface Comment {
  id: string
  author: User
  content: string
  createdAt: Date
  likes: number
  replies?: Comment[]
}

// Tipos específicos de contenido
export interface StudyTechniquePost {
  id: string
  type: 'technique'
  title: string
  description: string
  technique: string
  category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  timeRequired: string
  effectiveness: string
  research: string
  sources: Array<{
    title: string
    url: string
    type: string
  }>
  personalExperience: string
}

export interface MusicRecommendationPost {
  id: string
  type: 'music'
  title: string
  artist: string
  album?: string
  genre: string
  spotifyUrl?: string
  youtubeUrl?: string
  description: string
  studyPhase: 'focus' | 'break' | 'deep-work' | 'review'
  duration: string
  bpm?: number
  mood: string[]
}

export interface ImagePost {
  id: string
  type: 'image'
  title: string
  description: string
  imageUrl: string
  category: 'circadian-phase' | 'motivation' | 'study-setup' | 'achievement'
  tags: string[]
  studyPhase?: string
}

export interface TrophyPost {
  id: string
  type: 'trophy'
  title: string
  description: string
  achievement: {
    name: string
    description: string
    icon: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    points: number
  }
  studySession?: {
    duration: string
    technique: string
    subject: string
  }
}

export interface ReviewPost {
  id: string
  type: 'review'
  title: string
  rating: number
  category: 'book' | 'course' | 'app' | 'tool' | 'technique'
  itemName: string
  itemUrl?: string
  pros: string[]
  cons: string[]
  recommendation: string
  targetAudience: string
}

export interface ArticlePost {
  id: string
  type: 'article'
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  readTime: string
  featuredImage?: string
  externalUrl?: string
}

// Union type para todos los tipos de posts
export type PostContent =
  | StudyTechniquePost
  | MusicRecommendationPost
  | ImagePost
  | TrophyPost
  | ReviewPost
  | ArticlePost

export interface SocialPost {
  id: string
  author: User
  content: PostContent
  interactions: PostInteraction
  comments: Comment[]
  createdAt: Date
  updatedAt?: Date
  isPinned?: boolean
  isFeatured?: boolean
}

export interface FeedFilter {
  type?: PostContent['type']
  category?: string
  timeRange?: 'today' | 'week' | 'month' | 'all'
  sortBy?: 'recent' | 'popular' | 'trending'
}

export interface CreatePostData {
  type: PostContent['type']
  content: Partial<PostContent>
}
