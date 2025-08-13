<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Header with concept/mission statement -->
    <PageHeader
      title="Focus Mode"
      subtitle="Work session mode – Maximize your productivity with focused intervals and smart breaks."
      :actions="true"
    >
      <template #actions>
        <BaseButton
          variant="outline"
          @click="showSettings = !showSettings"
          class="flex items-center space-x-2"
        >
          <Settings :size="16" />
          <span>Settings</span>
        </BaseButton>
        <BaseButton
          variant="primary"
          @click="startFocusSession"
          :disabled="isSessionActive"
          class="flex items-center space-x-2"
        >
          <Play :size="16" />
          <span>Start Session</span>
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Mission/Concept Statement -->
    <div class="mb-8 text-center">
      <p class="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
        Ritmo helps you achieve deep work by structuring your time into focused work sessions and restorative breaks. Track your progress, manage your tasks, and unlock your productivity rhythm.
      </p>
    </div>

    <!-- Main Focus Panel -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Timer -->
      <div class="lg:col-span-2">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
          <div class="text-center">
            <!-- Circular Timer -->
            <div class="relative mx-auto w-64 h-64 mb-8">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <!-- Background Circle -->
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="8"
                  class="text-gray-200 dark:text-gray-700"
                />
                <!-- Progress Circle -->
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="8"
                  stroke-linecap="round"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="strokeDashoffset"
                  class="text-primary-600 dark:text-primary-400 transition-all duration-1000 ease-linear"
                />
              </svg>
              <!-- Time in the center -->
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center">
                  <div class="text-4xl font-bold text-gray-900 dark:text-white font-mono">
                    {{ formatTime(timeLeft) }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {{ currentPhase }}
                  </div>
                </div>
              </div>
            </div>
            <!-- Timer Controls -->
            <div class="flex items-center justify-center space-x-4 mb-6">
              <BaseButton
                v-if="!isSessionActive"
                variant="primary"
                size="lg"
                @click="startFocusSession"
                class="flex items-center space-x-2"
              >
                <Play :size="20" />
                <span>Start</span>
              </BaseButton>
              <BaseButton
                v-if="isSessionActive && !isPaused"
                variant="outline"
                size="lg"
                @click="pauseSession"
                class="flex items-center space-x-2"
              >
                <Pause :size="20" />
                <span>Pause</span>
              </BaseButton>
              <BaseButton
                v-if="isSessionActive && isPaused"
                variant="primary"
                size="lg"
                @click="resumeSession"
                class="flex items-center space-x-2"
              >
                <Play :size="20" />
                <span>Resume</span>
              </BaseButton>
              <BaseButton
                v-if="isSessionActive"
                variant="destructive"
                size="lg"
                @click="stopSession"
                class="flex items-center space-x-2"
              >
                <Square :size="20" />
                <span>Stop</span>
              </BaseButton>
            </div>
            <!-- Current Task -->
            <div v-if="currentTask" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Current Task
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                {{ currentTask.title }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <!-- Sidebar Panel -->
      <div class="space-y-6">
        <!-- Session Settings -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Session Settings
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Focus duration (minutes)
              </label>
              <input
                v-model="focusDuration"
                type="number"
                min="1"
                max="120"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                :disabled="isSessionActive"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Break duration (minutes)
              </label>
              <input
                v-model="breakDuration"
                type="number"
                min="1"
                max="30"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                :disabled="isSessionActive"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Long break every (cycles)
              </label>
              <input
                v-model="longBreakCycles"
                type="number"
                min="1"
                max="10"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                :disabled="isSessionActive"
              />
            </div>
          </div>
        </div>
        <!-- Session Statistics -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Statistics
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Cycles completed</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ completedCycles }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Total time</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ formatTime(totalTime) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Focused time</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ formatTime(focusedTime) }}</span>
            </div>
          </div>
        </div>
        <!-- Next Tasks -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Next Tasks
          </h3>
          <div v-if="nextTasks.length > 0" class="space-y-3">
            <div 
              v-for="task in nextTasks" 
              :key="task.id"
              class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              @click="selectTask(task)"
            >
              <div class="w-3 h-3 bg-primary-500 rounded-full"></div>
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ task.title }}</span>
            </div>
          </div>
          <div v-else class="text-center py-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">No pending tasks</p>
          </div>
        </div>
      </div>
    </div>
    <!-- Notifications -->
    <div 
      v-if="showNotification"
      class="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm"
    >
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
          <Bell class="text-primary-600 dark:text-primary-400" :size="16" />
        </div>
        <div>
          <h4 class="text-sm font-medium text-gray-900 dark:text-white">{{ notificationTitle }}</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ notificationMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Bell
} from 'lucide-vue-next'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import BaseButton from '~/components/atoms/BaseButton.vue'
import PageHeader from '~/components/molecules/PageHeader.vue'

definePageMeta({
  title: 'Focus Mode – Work Session',
  description: 'Maximize your productivity with focused work sessions and smart breaks.'
})

// Session state
const isSessionActive = ref(false)
const isPaused = ref(false)
const timeLeft = ref(25 * 60) // 25 minutes default
const totalTime = ref(0)
const focusedTime = ref(0)
const completedCycles = ref(0)
const currentPhase = ref('Focus')
const showSettings = ref(false)
const showNotification = ref(false)
const notificationTitle = ref('')
const notificationMessage = ref('')

// Settings
const focusDuration = ref(25)
const breakDuration = ref(5)
const longBreakCycles = ref(4)
const longBreakDuration = ref(15)

// Current task
const currentTask = ref({
  id: 1,
  title: 'Study for math exam',
  description: 'Review chapters 5 and 6'
})

// Next tasks
const nextTasks = ref([
  { id: 2, title: 'Check important emails' },
  { id: 3, title: 'Exercise' },
  { id: 4, title: 'Buy groceries' }
])

// Computed properties
const circumference = computed(() => 2 * Math.PI * 45)
const strokeDashoffset = computed(() => {
  const total = focusDuration.value * 60
  const progress = (total - timeLeft.value) / total
  return circumference.value * (1 - progress)
})

// Timer
let timerInterval: NodeJS.Timeout | null = null

// Methods
const startFocusSession = () => {
  isSessionActive.value = true
  isPaused.value = false
  timeLeft.value = focusDuration.value * 60
  currentPhase.value = 'Focus'
  startTimer()
  showNotificationMessage('Session started', 'Your focus time begins now!')
}

const pauseSession = () => {
  isPaused.value = true
  if (timerInterval) clearInterval(timerInterval)
  showNotificationMessage('Session paused', 'Take a short break if needed.')
}

const resumeSession = () => {
  isPaused.value = false
  startTimer()
  showNotificationMessage('Session resumed', 'Continue your focus!')
}

const stopSession = () => {
  isSessionActive.value = false
  isPaused.value = false
  if (timerInterval) clearInterval(timerInterval)
  timeLeft.value = focusDuration.value * 60
  currentPhase.value = 'Focus'
  showNotificationMessage('Session stopped', 'You have ended your work session.')
}

const startTimer = () => {
  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
      totalTime.value++
      if (currentPhase.value === 'Focus') focusedTime.value++
    } else {
      handlePhaseComplete()
    }
  }, 1000)
}

const handlePhaseComplete = () => {
  if (currentPhase.value === 'Focus') {
    completedCycles.value++
    if (completedCycles.value % longBreakCycles.value === 0) {
      timeLeft.value = longBreakDuration.value * 60
      currentPhase.value = 'Long Break'
      showNotificationMessage('Long break!', 'Take a 15-minute break.')
    } else {
      timeLeft.value = breakDuration.value * 60
      currentPhase.value = 'Break'
      showNotificationMessage('Break!', 'Take a 5-minute break.')
    }
  } else {
    timeLeft.value = focusDuration.value * 60
    currentPhase.value = 'Focus'
    showNotificationMessage('New cycle!', 'Start your next focus session.')
  }
}

const selectTask = (task: any) => {
  currentTask.value = task
  showNotificationMessage('Task selected', `Now working on: ${task.title}`)
}

const showNotificationMessage = (title: string, message: string) => {
  notificationTitle.value = title
  notificationMessage.value = message
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<style scoped>
.transition-all {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style> 