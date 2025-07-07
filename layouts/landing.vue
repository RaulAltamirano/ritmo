<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo and brand -->
          <div class="flex items-center space-x-3">
            <img src="/logo-ritmo.svg" alt="Ritmo" class="w-8 h-8" />
            <div class="hidden sm:block">
              <h1 class="text-xl font-bold text-gray-900 dark:text-white">Ritmo</h1>
              <p class="text-xs text-gray-500 dark:text-gray-400">Organize your time, live your rhythm</p>
            </div>
          </div>

          <!-- Navigation links -->
          <div class="hidden md:flex items-center space-x-8">
            <a href="#features" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              Features
            </a>
            <a href="#how-it-works" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              How I Use It
            </a>
            <a href="#techniques" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              Study Techniques
            </a>
            <a href="#pricing" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              Open Source
            </a>
          </div>

          <!-- Right side actions -->
          <div class="flex items-center space-x-4">
            <!-- Dark mode toggle -->
            <button
              @click="toggleDarkMode"
              class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              aria-label="Toggle dark mode"
            >
              <Sun v-if="isDark" class="w-5 h-5" />
              <Moon v-else class="w-5 h-5" />
            </button>

            <!-- GitHub button -->
            <a
              href="https://github.com/yourusername/ritmo"
              target="_blank"
              rel="noopener noreferrer"
              class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              GitHub
            </a>

            <!-- View source button -->
            <a
              href="https://github.com/yourusername/ritmo"
              target="_blank"
              rel="noopener noreferrer"
              class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Source
            </a>

            <!-- Mobile menu button -->
            <button
              @click="toggleMobileMenu"
              class="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              aria-label="Toggle mobile menu"
            >
              <Menu class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Mobile menu -->
        <div v-if="showMobileMenu" class="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
          <div class="space-y-2">
            <a href="#features" class="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Features
            </a>
            <a href="#how-it-works" class="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              How it Works
            </a>
            <a href="#techniques" class="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Study Techniques
            </a>
            <a href="#pricing" class="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Open Source
            </a>
            <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
              <a
                href="https://github.com/yourusername/ritmo"
                target="_blank"
                rel="noopener noreferrer"
                class="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://github.com/yourusername/ritmo"
                target="_blank"
                rel="noopener noreferrer"
                class="block px-3 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mt-2"
              >
                View Source
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="pt-16">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid md:grid-cols-4 gap-8">
          <div class="col-span-2">
            <div class="flex items-center gap-3 mb-4">
              <img src="/logo-ritmo.svg" alt="Ritmo Logo" class="h-8 w-8" />
              <span class="text-xl font-bold text-gray-900 dark:text-white">Ritmo</span>
            </div>
            <p class="text-gray-600 dark:text-gray-300 mb-4 max-w-md">
              My personal study tool that combines cognitive science with AI to help me stay organized and learn effectively.
            </p>
            <div class="flex gap-4">
              <a href="#" class="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                <Twitter class="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </a>
              <a href="#" class="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                <Github class="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </a>
              <a href="#" class="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                <Linkedin class="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </a>
            </div>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Project</h3>
            <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li><a href="#features" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a></li>
              <li><a href="#pricing" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Open Source</a></li>
              <li><a href="https://github.com/yourusername/ritmo" target="_blank" rel="noopener noreferrer" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">GitHub</a></li>
              <li><a href="https://github.com/yourusername/ritmo/issues" target="_blank" rel="noopener noreferrer" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Issues</a></li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
            <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li><a href="#" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Help Center</a></li>
              <li><a href="#" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a></li>
              <li><a href="#" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; 2024 Ritmo. My personal study tool, open source for the community. MIT License.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Sun, Moon, Menu, Twitter, Github, Linkedin } from 'lucide-vue-next'

// Meta tags for landing page
useHead({
  title: 'Ritmo - AI-Powered Study System',
  meta: [
    { name: 'description', content: 'Study smarter, not harder. Ritmo combines cognitive science with AI to help you organize your day, master proven study techniques, and build lasting learning habits.' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { charset: 'utf-8' }
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/logo-ritmo.svg' }
  ]
})

// Local state
const isDark = ref(false)
const showMobileMenu = ref(false)

// Initialize theme
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
    document.documentElement.classList.toggle('dark', isDark.value)
  } else {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = systemPrefersDark
    document.documentElement.classList.toggle('dark', systemPrefersDark)
  }
}

// Toggle dark mode
const toggleDarkMode = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

// Toggle mobile menu
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

// Close mobile menu when clicking outside
const closeMobileMenu = () => {
  showMobileMenu.value = false
}

// Lifecycle
onMounted(() => {
  initializeTheme()
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('nav')) {
      closeMobileMenu()
    }
  })
})

// Smooth scrolling for anchor links
const handleAnchorClick = (e: Event) => {
  const target = e.target as HTMLAnchorElement
  if (target.hash) {
    e.preventDefault()
    const element = document.querySelector(target.hash)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }
}
</script>

<style scoped>
/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.ai-ritmo-svg {
  animation: float 3s ease-in-out infinite;
}
</style> 