<template>
  <div>
    <!-- Hero Section -->
    <section id="hero" class="pt-16 pb-20 text-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm text-blue-700 dark:text-blue-300 mb-8">
          <Sparkles class="w-4 h-4" />
          <span>AI-Powered Study System</span>
        </div>
        <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
          Study Smarter,
          <span class="text-blue-600 dark:text-blue-400">Not Harder</span>
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Ritmo combines cognitive science with AI to help you organize your day, master proven study techniques, and build lasting learning habits.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a href="https://github.com/yourusername/ritmo" target="_blank" rel="noopener noreferrer" class="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
            <span class="flex items-center gap-2">
              <Github class="w-5 h-5" />
              View on GitHub
            </span>
          </a>
          <button class="flex items-center gap-2 px-6 py-4 text-gray-700 dark:text-gray-200 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <Play class="w-4 h-4" />
            Watch Demo
          </button>
        </div>
      </div>
    </section>

    <!-- Key Features -->
    <section id="features" class="py-20">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Why I Built Ritmo?</h2>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">A personal tool that combines cognitive science with AI to help me study smarter and stay organized.</p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="feature in features" :key="feature.title" 
               class="group p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div class="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <component :is="feature.icon" class="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">{{ feature.title }}</h3>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works - Simplified -->
    <section id="how-it-works" class="py-20 bg-gray-50 dark:bg-gray-800/50">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">How I Use Ritmo</h2>
          <p class="text-xl text-gray-600 dark:text-gray-300">My personalized learning rhythm, optimized for maximum focus and retention.</p>
        </div>

        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div class="space-y-8">
            <div v-for="(step, index) in workflowSteps" :key="step.title" 
                 class="flex gap-6 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div class="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                {{ index + 1 }}
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ step.title }}</h3>
                <p class="text-gray-600 dark:text-gray-300">{{ step.description }}</p>
              </div>
            </div>
          </div>
          
          <div class="relative">
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Clock class="w-6 h-6 text-blue-600" />
                Your Optimal Day Structure
              </h3>
              <div class="space-y-4">
                <div v-for="timeBlock in timeBlocks" :key="timeBlock.time" 
                     class="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div class="w-20 text-sm font-mono text-gray-500 dark:text-gray-400 font-semibold">{{ timeBlock.time }}</div>
                  <div class="flex-1">
                    <div class="font-semibold text-gray-900 dark:text-white">{{ timeBlock.phase }}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-300">{{ timeBlock.bestFor }}</div>
                  </div>
                  <component :is="timeBlock.icon" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Study Techniques - Simplified Grid -->
    <section id="techniques" class="py-20">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Study Techniques I Use</h2>
          <p class="text-xl text-gray-600 dark:text-gray-300">The most effective learning methods I've implemented, backed by cognitive science.</p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="technique in studyTechniques.slice(0, 6)" :key="technique.name" 
               class="group p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg cursor-pointer">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <component :is="technique.icon" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">{{ technique.name }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-1">{{ technique.type }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ technique.subjects }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-12">
          <button class="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            View All 10+ Techniques →
          </button>
        </div>
      </div>
    </section>

    <!-- Timer Modes - Simplified -->
    <section class="py-20 bg-gray-50 dark:bg-gray-800/50">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">My Focus Timer Modes</h2>
          <p class="text-xl text-gray-600 dark:text-gray-300">The timing strategies I use for different types of work and energy levels.</p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="mode in timerModes" :key="mode.id" 
               class="group p-8 bg-white dark:bg-gray-800 rounded-xl border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl cursor-pointer">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <component :is="mode.icon" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ mode.name }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300">{{ mode.duration }}</p>
              </div>
            </div>
            <p class="text-gray-600 dark:text-gray-300">{{ mode.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- AI Assistant - Highlighted -->
    <section class="py-20">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 lg:p-16 text-white">
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm mb-8">
                <Bot class="w-4 h-4" />
                <span>AI-Powered Assistant</span>
              </div>
              <h2 class="text-4xl font-bold mb-8">My Personal Learning Coach</h2>
              <div class="space-y-4 mb-10">
                <div v-for="benefit in aiBenefits" :key="benefit" class="flex items-center gap-3">
                  <CheckCircle class="w-5 h-5 text-blue-200 flex-shrink-0" />
                  <span class="text-blue-100">{{ benefit }}</span>
                </div>
              </div>
              <a href="https://github.com/yourusername/ritmo" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                <Github class="w-5 h-5" />
                View Source Code
              </a>
            </div>
            <div class="flex justify-center">
              <div class="relative">
                <img src="/ai-ritmo.svg" alt="AI Assistant" class="w-64 h-64 object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-gray-900 text-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-full text-sm mb-6">
          <Github class="w-4 h-4" />
          <span>Open Source</span>
        </div>
        <h2 class="text-4xl font-bold mb-6">Interested in My Study Tool?</h2>
        <p class="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">Check out the source code, contribute, or build your own version! MIT License - Use it freely.</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="https://github.com/yourusername/ritmo" target="_blank" rel="noopener noreferrer" class="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
            <span class="flex items-center gap-2">
              <Github class="w-5 h-5" />
              View on GitHub
            </span>
          </a>
          <a href="https://github.com/yourusername/ritmo/issues" target="_blank" rel="noopener noreferrer" class="px-8 py-4 border-2 border-gray-600 text-gray-300 font-semibold rounded-xl hover:bg-gray-800 hover:border-gray-500 transition-colors">
            Report Issues
          </a>
        </div>
        <p class="text-gray-400 text-sm mt-6">MIT License • Open Source • Built with ❤️ for the community</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { 
  Brain, 
  Clock, 
  FileText, 
  Castle, 
  Map, 
  Mic, 
  Headphones, 
  Image, 
  FolderOpen, 
  BookOpen,
  Timer,
  Zap,
  Target,
  Calendar,
  Play,
  Sparkles,
  Bot,
  CheckCircle,
  Sun,
  Lightbulb,
  Moon,
  Github
} from 'lucide-vue-next'

// Set layout
definePageMeta({
  layout: 'landing'
})

// Features - Reduced to 6 key features
const features = [
  {
    title: 'Energy-Based Scheduling',
    description: 'Match your most important tasks to your peak energy hours for maximum productivity.',
    icon: Sun
  },
  {
    title: 'Proven Study Techniques',
    description: 'Access 10+ science-backed learning methods tailored to different subjects and goals.',
    icon: Brain
  },
  {
    title: 'AI Learning Coach',
    description: 'Get personalized insights and suggestions to improve your study habits and performance.',
    icon: Bot
  },
  {
    title: 'Focus Timer Modes',
    description: 'Choose from 5 different timing strategies optimized for different types of work.',
    icon: Timer
  },
  {
    title: 'Progress Tracking',
    description: 'Monitor your learning journey with detailed analytics and honest feedback.',
    icon: Target
  },
  {
    title: 'Habit Building',
    description: 'Build lasting study habits through consistent practice and intelligent reminders.',
    icon: Calendar
  }
]

// Workflow steps - Simplified
const workflowSteps = [
  {
    title: 'Create Your Task',
    description: 'Add what you want to learn or accomplish with clear, specific goals.'
  },
  {
    title: 'Choose Your Technique',
    description: 'Select the best study method for your subject and learning style.'
  },
  {
    title: 'Schedule Smart',
    description: 'Place tasks in your optimal time slots based on energy and focus patterns.'
  },
  {
    title: 'Focus & Execute',
    description: 'Use our timer modes to maintain concentration and track your progress.'
  },
  {
    title: 'Reflect & Improve',
    description: 'Get AI insights on your performance and suggestions for improvement.'
  }
]

// Time blocks - Simplified
const timeBlocks = [
  { time: '7:00-9:00', phase: 'Deep Focus', bestFor: 'Complex problems, new concepts', icon: Brain },
  { time: '9:00-12:00', phase: 'Peak Cognition', bestFor: 'Exams, projects, writing', icon: Target },
  { time: '13:00-15:00', phase: 'Technical Review', bestFor: 'Practice, coding, review', icon: FileText },
  { time: '15:00-17:00', phase: 'Creative Work', bestFor: 'Brainstorming, group work', icon: Lightbulb },
  { time: '17:00-19:00', phase: 'Reflection', bestFor: 'Planning, rest, preparation', icon: Moon }
]

// Study techniques - Show only 6 most important
const studyTechniques = [
  { name: 'Active Recall', type: 'Learning', use: 'Recall without hints', subjects: 'All subjects', icon: Brain },
  { name: 'Spaced Repetition', type: 'Learning', use: 'Long-term memory', subjects: 'Languages, Medicine, Law', icon: Clock },
  { name: 'Feynman Technique', type: 'Learning', use: 'Understand by explaining', subjects: 'Physics, Programming, Theory', icon: FileText },
  { name: 'Memory Palace', type: 'Cognitive', use: 'Visualize and connect concepts', subjects: 'History, Medicine, Dates', icon: Castle },
  { name: 'Mind Maps', type: 'Cognitive', use: 'Connect ideas visually', subjects: 'Philosophy, Literature, Psychology', icon: Map },
  { name: 'Shadowing', type: 'Linguistic', use: 'Listening & speaking fluency', subjects: 'Languages', icon: Mic }
]

// Timer modes
const timerModes = [
  { id: 'pomodoro', name: 'Pomodoro', description: '25 min focus + 5 min break', duration: '25+5 min', color: 'border-red-500', icon: Timer },
  { id: 'pomodoro-xl', name: 'Pomodoro XL', description: '50 min deep work + 10 min break', duration: '50+10 min', color: 'border-blue-500', icon: Target },
  { id: '52-17', name: '52/17', description: '52 min work + 17 min rest', duration: '52+17 min', color: 'border-green-500', icon: Clock },
  { id: 'flow', name: 'Flow Sprint', description: '90–120 min immersion', duration: '90–120 min', color: 'border-purple-500', icon: Zap },
  { id: 'blocking', name: 'Time Blocking', description: '1–3h per task', duration: '1–3h', color: 'border-orange-500', icon: Calendar }
]

// AI benefits - Simplified
const aiBenefits = [
  'Analyzes your study patterns and suggests optimal techniques',
  'Provides honest feedback on your progress and areas for improvement',
  'Recommends the best time slots based on your energy patterns',
  'Helps you build consistent study habits through intelligent reminders'
]
</script>

<style scoped>
/* Custom animations and styles */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.ai-ritmo-svg {
  animation: float 3s ease-in-out infinite;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom gradient text */
.gradient-text {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style> 