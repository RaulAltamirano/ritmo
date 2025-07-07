<template>
  <!-- Main navbar (top) -->
  <nav 
    class="fixed top-0 left-0 right-0 z-[9999] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm"
    role="navigation"
    aria-label="Main navigation"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        
        <!-- Logo and brand -->
        <div class="flex items-center space-x-3">
          <img src="/logo-ritmo.svg" alt="Ritmo" class="w-7 h-7 fill-current text-gray-900 dark:text-white" />
          <div class="hidden sm:block">
            <h1 class="text-lg font-bold text-gray-900 dark:text-white">Ritmo</h1>
            <p class="text-xs text-gray-500 dark:text-gray-400">Organize your time, live your rhythm</p>
          </div>
        </div>

        <!-- Main navigation -->
        <div class="hidden md:flex items-center space-x-1">
          <NuxtLink
            v-for="item in primaryNavItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 relative group',
              currentPath === item.path
                ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            ]"
            :aria-label="item.label"
            :aria-current="currentPath === item.path ? 'page' : undefined"
          >
            <component :is="item.icon" :size="16" />
            <span class="text-sm font-medium">{{ item.label }}</span>
            
            <!-- Active route indicator -->
            <div 
              v-if="currentPath === item.path"
              class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 dark:bg-primary-400 rounded-full"
            ></div>
          </NuxtLink>

          <!-- Dropdown menu for more options -->
          <div class="relative">
            <button
              @click="toggleMoreMenu"
              :class="[
                'flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                showMoreMenu
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              ]"
              aria-label="More options"
              :aria-expanded="showMoreMenu ? 'true' : 'false'"
            >
              <MoreHorizontal :size="16" />
              <span class="text-sm font-medium">More</span>
              <ChevronDown :size="12" class="transition-transform duration-200" :class="{ 'rotate-180': showMoreMenu }" />
            </button>

            <!-- More options dropdown -->
            <div 
              v-if="showMoreMenu"
              class="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
            >
              <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Organization</p>
              </div>
              
              <NuxtLink
                v-for="item in secondaryNavItems"
                :key="item.path"
                :to="item.path"
                :class="[
                  'flex items-center space-x-3 px-3 py-2 text-sm transition-colors duration-200',
                  currentPath === item.path
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                ]"
                @click="closeMoreMenu"
              >
                <component :is="item.icon" :size="16" />
                <span>{{ item.label }}</span>
              </NuxtLink>

              <div class="px-3 py-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Productivity</p>
              </div>

              <NuxtLink
                v-for="item in productivityNavItems"
                :key="item.path"
                :to="item.path"
                :class="[
                  'flex items-center space-x-3 px-3 py-2 text-sm transition-colors duration-200',
                  currentPath === item.path
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                ]"
                @click="closeMoreMenu"
              >
                <component :is="item.icon" :size="16" />
                <span>{{ item.label }}</span>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Right side actions -->
        <div class="flex items-center space-x-2">
          
          <!-- Dark mode toggle -->
          <button
            @click="toggleDarkMode"
            class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label="Toggle dark mode"
          >
            <Sun v-if="isDark" :size="18" />
            <Moon v-else :size="18" />
          </button>

          <!-- User profile -->
          <div class="relative">
            <button
              @click="toggleProfileMenu"
              class="flex items-center space-x-2 p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Profile menu"
              :aria-expanded="showProfileMenu ? 'true' : 'false'"
            >
              <!-- User Avatar -->
              <div class="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                <img 
                  v-if="userAvatar" 
                  :src="userAvatar" 
                  :alt="userDisplayName"
                  class="w-full h-full object-cover avatar-image"
                  @error="handleAvatarError"
                />
                <div 
                  v-else 
                  class="w-full h-full avatar-fallback flex items-center justify-center text-white text-sm font-medium"
                >
                  {{ userInitials }}
                </div>
              </div>
              <span class="hidden sm:block text-sm font-medium">{{ userDisplayName }}</span>
              <ChevronDown :size="12" class="transition-transform duration-200" :class="{ 'rotate-180': showProfileMenu }" />
            </button>

            <!-- Profile dropdown -->
            <div 
              v-if="showProfileMenu"
              class="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
            >
              <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                <div class="flex items-center space-x-3">
                  <!-- User Avatar in dropdown -->
                  <div class="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                    <img 
                      v-if="userAvatar" 
                      :src="userAvatar" 
                      :alt="userDisplayName"
                      class="w-full h-full object-cover avatar-image"
                      @error="handleAvatarError"
                    />
                    <div 
                      v-else 
                      class="w-full h-full avatar-fallback flex items-center justify-center text-white text-sm font-medium"
                    >
                      {{ userInitials }}
                    </div>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ userDisplayName }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ userEmail }}</p>
                  </div>
                </div>
              </div>

              <!-- Timer settings -->
              <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <Clock :size="14" class="text-gray-500 dark:text-gray-400" />
                    <span class="text-sm text-gray-700 dark:text-gray-300">Floating Timer</span>
                  </div>
                  <button
                    @click="toggleFloatingTimer"
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    :class="showFloatingTimer ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'"
                    :aria-label="showFloatingTimer ? 'Hide floating timer' : 'Show floating timer'"
                  >
                    <span
                      class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                      :class="showFloatingTimer ? 'translate-x-6' : 'translate-x-1'"
                    />
                  </button>
                </div>
              </div>
              
              <NuxtLink
                :to="ROUTES.PROFILE"
                class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                @click="closeProfileMenu"
              >
                <User :size="16" />
                <span>My Profile</span>
              </NuxtLink>

              <NuxtLink
                :to="ROUTES.CONFIGURACION"
                class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                @click="closeProfileMenu"
              >
                <Settings :size="16" />
                <span>Settings</span>
              </NuxtLink>

              <div class="border-t border-gray-100 dark:border-gray-700 my-1"></div>

              <!-- End day button -->
              <button
                @click="handleEndDay"
                class="w-full flex items-center space-x-3 px-3 py-2 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors duration-200"
              >
                <Flag :size="16" />
                <span>End Day</span>
              </button>

              <button
                @click="handleLogout"
                class="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
              >
                <LogOut :size="16" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          <!-- Mobile menu -->
          <button
            @click="toggleMobileMenu"
            class="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label="Open navigation menu"
          >
            <Menu :size="18" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile dropdown menu -->
    <div 
      v-if="showMobileMenu"
      class="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 shadow-lg"
    >
      <div class="px-4 py-2 space-y-1">
        <!-- Main mobile navigation -->
        <div class="mb-4">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-4 py-2">Main</p>
          <NuxtLink
            v-for="item in primaryNavItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              currentPath === item.path
                ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            ]"
            :aria-label="item.label"
            :aria-current="currentPath === item.path ? 'page' : undefined"
            @click="closeMobileMenu"
          >
            <component :is="item.icon" :size="18" />
            <span class="font-medium">{{ item.label }}</span>
          </NuxtLink>
        </div>

        <!-- Organization mobile -->
        <div class="mb-4">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-4 py-2">Organization</p>
          <NuxtLink
            v-for="item in secondaryNavItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              currentPath === item.path
                ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            ]"
            @click="closeMobileMenu"
          >
            <component :is="item.icon" :size="18" />
            <span class="font-medium">{{ item.label }}</span>
          </NuxtLink>
        </div>

        <!-- Productivity mobile -->
        <div class="mb-4">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-4 py-2">Productivity</p>
          <NuxtLink
            v-for="item in productivityNavItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              currentPath === item.path
                ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            ]"
            @click="closeMobileMenu"
          >
            <component :is="item.icon" :size="18" />
            <span class="font-medium">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>

  <!-- Spacer for content -->
  <div class="h-16"></div>
</template>

<script setup lang="ts">
import { 
  Home, 
  Calendar,
  BookOpen,
  Sun,
  Moon,
  Menu,
  MoreHorizontal,
  ChevronDown,
  GraduationCap,
  FolderOpen,
  BarChart3,
  Eye,
  Flag,
  Settings,
  User,
  LogOut,
  Clock
} from 'lucide-vue-next'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTimerStore } from '../../stores/timer'
import { useAuth } from '../../composables/useAuth'
import { ROUTES } from '../../utils/routes'

interface NavItem {
  path: string
  label: string
  icon: any
  description?: string
}

// Main navigation using centralized routes
const primaryNavItems: NavItem[] = [
  {
    path: ROUTES.DASHBOARD,
    label: 'Dashboard',
    icon: Home,
    description: 'Overview and metrics'
  },
  {
    path: ROUTES.HOY,
    label: 'Today',
    icon: Calendar,
    description: 'Today\'s tasks'
  },
  {
    path: ROUTES.PROYECTOS,
    label: 'Projects',
    icon: FolderOpen,
    description: 'Manage your projects'
  }
]

// Secondary navigation - Organization
const secondaryNavItems: NavItem[] = [
  {
    path: ROUTES.HORARIO,
    label: 'Schedule',
    icon: Calendar,
    description: 'Time planning'
  },
  {
    path: ROUTES.STUDY_PLAN,
    label: 'Study Plan',
    icon: GraduationCap,
    description: 'Manage your study plan'
  },
  {
    path: ROUTES.JOURNAL,
    label: 'Journal',
    icon: BookOpen,
    description: 'Personal journal and notes'
  }
]

// Productivity navigation
const productivityNavItems: NavItem[] = [
  {
    path: ROUTES.ANALITICAS,
    label: 'Analytics',
    icon: BarChart3,
    description: 'Insights and progress'
  },
  {
    path: ROUTES.ENFOQUE,
    label: 'Focus',
    icon: Eye,
    description: 'Concentration mode'
  }
]

interface MainNavbarProps {
  // Empty props since we don't need the timer in the navbar
}

const props = withDefaults(defineProps<MainNavbarProps>(), {
  // No default props
})

const emit = defineEmits<{
  'toggle-dark-mode': []
}>()

const route = useRoute()
const timerStore = useTimerStore()
const { user, userEmail, userAvatar, logout } = useAuth()

const isDark = ref(false)
const showMobileMenu = ref(false)
const showMoreMenu = ref(false)
const showProfileMenu = ref(false)

// Computed properties
const currentPath = computed(() => route?.path || '/')
const showFloatingTimer = computed(() => timerStore.showFloatingTimer)

// User display name
const userDisplayName = computed(() => {
  if (user.value?.name) {
    return user.value.name
  }
  if (userEmail.value) {
    return userEmail.value.split('@')[0]
  }
  return 'User'
})

// User initials for avatar fallback
const userInitials = computed(() => {
  if (user.value?.name) {
    return user.value.name.split(' ').map(word => word[0]).join('').toUpperCase()
  }
  if (userEmail.value) {
    return userEmail.value.charAt(0).toUpperCase()
  }
  return 'U'
})

// Methods
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  if (showMobileMenu.value) {
    showMoreMenu.value = false
    showProfileMenu.value = false
  }
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

const toggleMoreMenu = () => {
  showMoreMenu.value = !showMoreMenu.value
  if (showMoreMenu.value) {
    showMobileMenu.value = false
    showProfileMenu.value = false
  }
}

const closeMoreMenu = () => {
  showMoreMenu.value = false
}

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value
  if (showProfileMenu.value) {
    showMobileMenu.value = false
    showMoreMenu.value = false
  }
}

const closeProfileMenu = () => {
  showProfileMenu.value = false
}

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  emit('toggle-dark-mode')
}

const toggleFloatingTimer = () => {
  timerStore.toggleFloatingTimer()
}

const handleLogout = async () => {
  try {
    await logout()
    closeProfileMenu()
  } catch (error) {
    console.error('Logout error:', error)
  }
}

const handleEndDay = () => {
  timerStore.endDay()
  closeProfileMenu()
}

const handleAvatarError = (event: Event) => {
  // Hide the image and show initials instead
  const img = event.target as HTMLImageElement
  if (img) {
    img.style.display = 'none'
  }
}

// Lifecycle
onMounted(() => {
  // Detect initial dark mode
  isDark.value = document.documentElement.classList.contains('dark')
  
  // Load timer preferences
  timerStore.loadPreferences()
  timerStore.loadDaySummary()
  
  // Close menus when route changes
  watch(() => route?.path, () => {
    closeMobileMenu()
    closeMoreMenu()
    closeProfileMenu()
  })
})

// Close menus when clicking outside
onMounted(() => {
  const handleClickOutside = (event: Event) => {
    const target = event.target as Element
    if (!target.closest('nav')) {
      closeMobileMenu()
      closeMoreMenu()
      closeProfileMenu()
    }
  }
  
  document.addEventListener('click', handleClickOutside)
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>

<style scoped>
/* Smooth animations */
.transition-all {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced backdrop blur effect */
.backdrop-blur-md {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Subtle gradients */
.bg-gradient-to-br {
  background: linear-gradient(135deg, var(--tw-gradient-stops));
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Avatar styles */
.avatar-fallback {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 500;
  text-transform: uppercase;
}

/* Avatar image error handling */
.avatar-image {
  transition: opacity 0.2s ease;
}

.avatar-image[style*="display: none"] {
  opacity: 0;
}
</style> 