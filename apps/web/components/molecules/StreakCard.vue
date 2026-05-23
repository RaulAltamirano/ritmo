<template>
  <div class="space-y-6">
    <!-- Streak Section - Redesigned -->
    <div class="relative overflow-hidden">
      <!-- Background with subtle gradient -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 dark:from-blue-950/20 dark:via-gray-900 dark:to-blue-950/10 rounded-2xl"
      ></div>

      <!-- Main content -->
      <div
        class="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-blue-100/50 dark:border-blue-900/30 p-6 sm:p-8"
      >
        <!-- Progress visualization - Horizontal Layout -->
        <div class="mb-6">
          <!-- Desktop Layout -->
          <div class="hidden sm:flex gap-6">
            <!-- Days in a row - Left side (30%) -->
            <div class="w-[30%]">
              <div class="text-center">
                <div class="relative inline-block">
                  <!-- Integrated Flame with Number -->
                  <div class="flame-number-container">
                    <!-- Flame background -->
                    <div class="flame-background">
                      <Flame class="flame-icon-integrated" :size="120" />
                    </div>
                    <!-- Number inside flame -->
                    <div
                      class="streak-number-integrated text-6xl font-black text-white mb-2"
                    >
                      {{ streak }}
                    </div>
                    <!-- Floating particles effect -->
                    <div class="particles-container">
                      <div class="particle particle-1"></div>
                      <div class="particle particle-2"></div>
                      <div class="particle particle-3"></div>
                      <div class="particle particle-4"></div>
                      <div class="particle particle-5"></div>
                      <div class="particle particle-6"></div>
                    </div>
                    <!-- Glow effect -->
                    <div class="streak-glow-enhanced"></div>
                  </div>
                </div>
                <p class="text-lg text-gray-700 dark:text-gray-300 font-medium">
                  {{ streak === 1 ? 'day' : 'days' }} in a row
                </p>
              </div>
            </div>

            <!-- Weekly Progress - Right side (70%) -->
            <div class="w-[70%]">
              <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400"
                  >Weekly Progress</span
                >
                <span class="text-sm font-bold text-blue-600 dark:text-blue-400"
                  >{{ streak }} / 7</span
                >
              </div>

              <!-- Enhanced progress bar container -->
              <div
                class="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-6"
              >
                <div
                  class="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 rounded-full transition-all duration-2000 ease-out progress-fill"
                  :style="{ width: `${(streak / 7) * 100}%` }"
                >
                  <!-- Animated glow effect -->
                  <div
                    class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-progress-shimmer"
                  ></div>
                  <!-- Pulsing border effect -->
                  <div
                    class="absolute inset-0 rounded-full border-2 border-white/20 animate-progress-pulse"
                  ></div>
                </div>
                <!-- Progress bar glow -->
                <div
                  class="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-full blur-sm transition-all duration-2000 ease-out"
                  :style="{ width: `${(streak / 7) * 100}%` }"
                ></div>
              </div>

              <!-- Enhanced days indicators -->
              <div class="flex justify-between">
                <div
                  v-for="(dayName, index) in weekDays"
                  :key="index"
                  class="flex flex-col items-center space-y-2"
                >
                  <div
                    class="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-700 ease-out day-indicator"
                    :class="[
                      index + 1 <= streak
                        ? 'bg-blue-500 border-blue-500 shadow-lg shadow-blue-500/30 scale-110'
                        : 'bg-surface-overlay border-outline-strong hover:scale-105',
                    ]"
                  >
                    <Check
                      v-if="index + 1 <= streak"
                      class="text-white w-4 h-4 animate-check-appear"
                    />
                    <span
                      v-else
                      class="text-gray-400 dark:text-gray-500 text-xs font-medium"
                      >{{ index + 1 }}</span
                    >
                  </div>
                  <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">{{
                    dayName
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile Layout -->
          <div class="sm:hidden space-y-4">
            <!-- Days in a row - Mobile -->
            <div class="text-center">
              <div class="relative inline-block">
                <!-- Integrated Flame with Number -->
                <div class="flame-number-container">
                  <!-- Flame background -->
                  <div class="flame-background">
                    <Flame class="flame-icon-integrated" :size="100" />
                  </div>
                  <!-- Number inside flame -->
                  <div
                    class="streak-number-integrated text-5xl font-black text-white mb-1"
                  >
                    {{ streak }}
                  </div>
                  <!-- Floating particles effect -->
                  <div class="particles-container">
                    <div class="particle particle-1"></div>
                    <div class="particle particle-2"></div>
                    <div class="particle particle-3"></div>
                    <div class="particle particle-4"></div>
                    <div class="particle particle-5"></div>
                    <div class="particle particle-6"></div>
                  </div>
                  <!-- Glow effect -->
                  <div class="streak-glow-enhanced"></div>
                </div>
              </div>
              <p class="text-base text-gray-700 dark:text-gray-300 font-medium">
                {{ streak === 1 ? 'day' : 'days' }} in a row
              </p>
            </div>

            <!-- Weekly Progress - Mobile -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400"
                  >Weekly Progress</span
                >
                <span class="text-sm font-bold text-blue-600 dark:text-blue-400"
                  >{{ streak }} / 7</span
                >
              </div>
              <div
                class="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4"
              >
                <div
                  class="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 rounded-full transition-all duration-2000 ease-out progress-fill"
                  :style="{ width: `${(streak / 7) * 100}%` }"
                >
                  <div
                    class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-progress-shimmer"
                  ></div>
                </div>
              </div>

              <!-- Days indicators - Mobile -->
              <div class="flex justify-between">
                <div
                  v-for="(dayName, index) in weekDays"
                  :key="index"
                  class="flex flex-col items-center space-y-1"
                >
                  <div
                    class="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-700 ease-out day-indicator"
                    :class="[
                      index + 1 <= streak
                        ? 'bg-blue-500 border-blue-500 shadow-lg shadow-blue-500/30 scale-110'
                        : 'bg-surface-overlay border-outline-strong',
                    ]"
                  >
                    <Check
                      v-if="index + 1 <= streak"
                      class="text-white w-4 h-4 animate-check-appear"
                    />
                    <span
                      v-else
                      class="text-gray-400 dark:text-gray-500 text-xs font-medium"
                      >{{ index + 1 }}</span
                    >
                  </div>
                  <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">{{
                    dayName
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Check, Flame } from 'lucide-vue-next'

  interface Task {
    id: string
    name: string
    createdAt: Date
    category?: string
  }

  interface StreakCardProps {
    streak: number
    sessionsThisWeek: number
    totalTime: string
    weeklyProgress: number
    tasks: Task[]
  }

  const props = defineProps<StreakCardProps>()

  // Days of the week in English
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
</script>

<style scoped>
  /* Professional Flame Animations */
  .flame-container {
    position: relative;
    display: inline-block;
  }

  .flame-icon {
    position: relative;
    z-index: 2;
    animation: flame-flicker 2s ease-in-out infinite alternate;
    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.3));
  }

  .flame-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
    border-radius: 50%;
    animation: flame-pulse 3s ease-in-out infinite;
    z-index: 1;
  }

  @keyframes flame-flicker {
    0% {
      transform: scale(1) rotate(-2deg);
      filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.3));
    }

    25% {
      transform: scale(1.05) rotate(1deg);
      filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.4));
    }

    50% {
      transform: scale(1.02) rotate(-1deg);
      filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.35));
    }

    75% {
      transform: scale(1.08) rotate(2deg);
      filter: drop-shadow(0 0 14px rgba(59, 130, 246, 0.45));
    }

    100% {
      transform: scale(1) rotate(-2deg);
      filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.3));
    }
  }

  @keyframes flame-pulse {
    0%,
    100% {
      opacity: 0.3;
      transform: translate(-50%, -50%) scale(1);
    }

    50% {
      opacity: 0.6;
      transform: translate(-50%, -50%) scale(1.2);
    }
  }

  /* Streak Number Animations */
  .streak-number {
    position: relative;
    z-index: 2;
    animation: number-glow 4s ease-in-out infinite;
  }

  .streak-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    animation: number-pulse 6s ease-in-out infinite;
    z-index: 1;
  }

  @keyframes number-glow {
    0%,
    100% {
      text-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
    }

    50% {
      text-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
    }
  }

  @keyframes number-pulse {
    0%,
    100% {
      opacity: 0.2;
      transform: translate(-50%, -50%) scale(1);
    }

    50% {
      opacity: 0.4;
      transform: translate(-50%, -50%) scale(1.1);
    }
  }

  /* Integrated Flame with Number - Professional Design */
  .flame-number-container {
    position: relative;
    display: inline-block;
    width: 140px;
    height: 140px;
    margin: 0 auto;
  }

  .flame-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .flame-icon-integrated {
    color: #3b82f6;
    filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.6));
  }

  /* Dark mode adjustments for flame */
  .dark .flame-icon-integrated {
    color: #60a5fa;
    filter: drop-shadow(0 0 25px rgba(96, 165, 250, 0.8));
    animation: flame-flicker-integrated-dark 3s ease-in-out infinite;
  }

  .streak-number-integrated {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
    text-shadow:
      0 0 10px rgba(0, 0, 0, 0.8),
      0 0 20px rgba(0, 0, 0, 0.6),
      0 0 30px rgba(0, 0, 0, 0.4);
    animation:
      number-breathe 6s ease-in-out infinite,
      number-glow-white 8s ease-in-out infinite;
    filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.3));
  }

  /* Dark mode adjustments for number */
  .dark .streak-number-integrated {
    text-shadow:
      0 0 15px rgba(0, 0, 0, 0.9),
      0 0 25px rgba(0, 0, 0, 0.7),
      0 0 35px rgba(0, 0, 0, 0.5);
    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.5));
    animation:
      number-breathe 6s ease-in-out infinite,
      number-glow-white-dark 8s ease-in-out infinite;
  }

  /* Mobile adjustments */
  @media (max-width: 640px) {
    .flame-number-container {
      width: 120px;
      height: 120px;
    }
  }

  .streak-glow-enhanced {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 160px;
    height: 160px;
    background:
      radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 70% 70%, rgba(96, 165, 250, 0.06) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(147, 197, 253, 0.04) 0%, transparent 70%);
    border-radius: 50%;
    animation:
      glow-orbit 20s linear infinite,
      glow-pulse-subtle 6s ease-in-out infinite;
    z-index: 1;
    filter: blur(2px);
    opacity: 0.6;
  }

  /* Dark mode adjustments for glow */
  .dark .streak-glow-enhanced {
    background:
      radial-gradient(circle at 30% 30%, rgba(96, 165, 250, 0.12) 0%, transparent 50%),
      radial-gradient(circle at 70% 70%, rgba(147, 197, 253, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(191, 219, 254, 0.06) 0%, transparent 70%);
    opacity: 0.8;
  }

  /* Advanced Particle System */
  .particles-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 2;
    overflow: hidden;
  }

  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.4) 0%,
      rgba(96, 165, 250, 0.3) 50%,
      rgba(147, 197, 253, 0.2) 100%
    );
    border-radius: 50%;
    opacity: 0;
    animation:
      particle-orbit-subtle 8s cubic-bezier(0.4, 0, 0.2, 1) infinite,
      particle-twinkle-subtle 4s ease-in-out infinite;
    box-shadow:
      0 0 6px rgba(59, 130, 246, 0.3),
      0 0 12px rgba(96, 165, 250, 0.15);
  }

  /* Dark mode adjustments for particles */
  .dark .particle {
    background: linear-gradient(
      135deg,
      rgba(96, 165, 250, 0.6) 0%,
      rgba(147, 197, 253, 0.4) 50%,
      rgba(191, 219, 254, 0.3) 100%
    );
    box-shadow:
      0 0 8px rgba(96, 165, 250, 0.4),
      0 0 16px rgba(147, 197, 253, 0.3);
  }

  .particle-1 {
    top: 15%;
    left: 20%;
    animation-delay: 0s;
    animation-duration: 6s, 3s, 4s;
  }

  .particle-2 {
    top: 25%;
    right: 15%;
    animation-delay: 1.2s;
    animation-duration: 6.5s, 3.2s, 4.3s;
  }

  .particle-3 {
    bottom: 20%;
    left: 30%;
    animation-delay: 2.4s;
    animation-duration: 7s, 3.4s, 4.6s;
  }

  .particle-4 {
    bottom: 30%;
    right: 25%;
    animation-delay: 3.6s;
    animation-duration: 6.8s, 3.1s, 4.2s;
  }

  .particle-5 {
    top: 45%;
    left: 10%;
    animation-delay: 4.8s;
    animation-duration: 6.3s, 3.3s, 4.4s;
  }

  .particle-6 {
    top: 55%;
    right: 10%;
    animation-delay: 1.8s;
    animation-duration: 6.7s, 3.5s, 4.5s;
  }

  /* Advanced Keyframe Animations */
  @keyframes number-aurora {
    0%,
    100% {
      text-shadow:
        0 0 30px rgba(59, 130, 246, 0.6),
        0 0 60px rgba(96, 165, 250, 0.4),
        0 0 90px rgba(147, 197, 253, 0.2),
        0 0 120px rgba(191, 219, 254, 0.1);
      filter: drop-shadow(0 0 30px rgba(59, 130, 246, 0.4))
        drop-shadow(0 0 60px rgba(96, 165, 250, 0.2))
        drop-shadow(0 0 90px rgba(147, 197, 253, 0.1));
    }

    25% {
      text-shadow:
        0 0 35px rgba(96, 165, 250, 0.7),
        0 0 70px rgba(147, 197, 253, 0.5),
        0 0 105px rgba(191, 219, 254, 0.3),
        0 0 140px rgba(219, 234, 254, 0.15);
      filter: drop-shadow(0 0 35px rgba(96, 165, 250, 0.5))
        drop-shadow(0 0 70px rgba(147, 197, 253, 0.3))
        drop-shadow(0 0 105px rgba(191, 219, 254, 0.15));
    }

    50% {
      text-shadow:
        0 0 40px rgba(147, 197, 253, 0.8),
        0 0 80px rgba(191, 219, 254, 0.6),
        0 0 120px rgba(219, 234, 254, 0.4),
        0 0 160px rgba(239, 246, 255, 0.2);
      filter: drop-shadow(0 0 40px rgba(147, 197, 253, 0.6))
        drop-shadow(0 0 80px rgba(191, 219, 254, 0.4))
        drop-shadow(0 0 120px rgba(219, 234, 254, 0.2));
    }

    75% {
      text-shadow:
        0 0 35px rgba(96, 165, 250, 0.7),
        0 0 70px rgba(147, 197, 253, 0.5),
        0 0 105px rgba(191, 219, 254, 0.3),
        0 0 140px rgba(219, 234, 254, 0.15);
      filter: drop-shadow(0 0 35px rgba(96, 165, 250, 0.5))
        drop-shadow(0 0 70px rgba(147, 197, 253, 0.3))
        drop-shadow(0 0 105px rgba(191, 219, 254, 0.15));
    }
  }

  @keyframes number-breathe {
    0%,
    100% {
      transform: scale(1);
    }

    50% {
      transform: scale(1.02);
    }
  }

  @keyframes number-glow-subtle {
    0%,
    100% {
      text-shadow:
        0 0 10px rgba(59, 130, 246, 0.4),
        0 0 20px rgba(96, 165, 250, 0.2);
      filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.3))
        drop-shadow(0 0 30px rgba(96, 165, 250, 0.15));
    }

    50% {
      text-shadow:
        0 0 15px rgba(96, 165, 250, 0.5),
        0 0 30px rgba(147, 197, 253, 0.3);
      filter: drop-shadow(0 0 20px rgba(96, 165, 250, 0.4))
        drop-shadow(0 0 40px rgba(147, 197, 253, 0.2));
    }
  }

  @keyframes glow-pulse-subtle {
    0%,
    100% {
      opacity: 0.4;
      transform: translate(-50%, -50%) scale(1);
    }

    50% {
      opacity: 0.7;
      transform: translate(-50%, -50%) scale(1.05);
    }
  }

  @keyframes particle-orbit-subtle {
    0% {
      transform: translate(0, 0) rotate(0deg);
      opacity: 0;
    }

    15% {
      opacity: 0.3;
    }

    50% {
      transform: translate(-15px, -20px) rotate(180deg);
      opacity: 0.6;
    }

    85% {
      opacity: 0.2;
    }

    100% {
      transform: translate(0, 0) rotate(360deg);
      opacity: 0;
    }
  }

  @keyframes particle-twinkle-subtle {
    0%,
    100% {
      opacity: 0.2;
      transform: scale(0.8);
    }

    50% {
      opacity: 0.5;
      transform: scale(1.1);
    }
  }

  /* Integrated Flame Animations */
  @keyframes flame-flicker-integrated {
    0%,
    100% {
      transform: scale(1) rotate(-1deg);
      filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.6));
    }

    25% {
      transform: scale(1.05) rotate(1deg);
      filter: drop-shadow(0 0 25px rgba(96, 165, 250, 0.7));
    }

    50% {
      transform: scale(1.02) rotate(-0.5deg);
      filter: drop-shadow(0 0 22px rgba(59, 130, 246, 0.65));
    }

    75% {
      transform: scale(1.08) rotate(1.5deg);
      filter: drop-shadow(0 0 28px rgba(147, 197, 253, 0.8));
    }
  }

  @keyframes number-glow-white {
    0%,
    100% {
      text-shadow:
        0 0 10px rgba(0, 0, 0, 0.8),
        0 0 20px rgba(0, 0, 0, 0.6),
        0 0 30px rgba(0, 0, 0, 0.4);
      filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.3));
    }

    50% {
      text-shadow:
        0 0 15px rgba(0, 0, 0, 0.9),
        0 0 25px rgba(0, 0, 0, 0.7),
        0 0 35px rgba(0, 0, 0, 0.5);
      filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.4));
    }
  }

  /* Dark mode specific animations */
  @keyframes flame-flicker-integrated-dark {
    0%,
    100% {
      transform: scale(1) rotate(-1deg);
      filter: drop-shadow(0 0 25px rgba(96, 165, 250, 0.8));
    }

    25% {
      transform: scale(1.05) rotate(1deg);
      filter: drop-shadow(0 0 30px rgba(147, 197, 253, 0.9));
    }

    50% {
      transform: scale(1.02) rotate(-0.5deg);
      filter: drop-shadow(0 0 27px rgba(96, 165, 250, 0.85));
    }

    75% {
      transform: scale(1.08) rotate(1.5deg);
      filter: drop-shadow(0 0 35px rgba(191, 219, 254, 1));
    }
  }

  @keyframes number-glow-white-dark {
    0%,
    100% {
      text-shadow:
        0 0 15px rgba(0, 0, 0, 0.9),
        0 0 25px rgba(0, 0, 0, 0.7),
        0 0 35px rgba(0, 0, 0, 0.5);
      filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.5));
    }

    50% {
      text-shadow:
        0 0 20px rgba(0, 0, 0, 1),
        0 0 30px rgba(0, 0, 0, 0.8),
        0 0 40px rgba(0, 0, 0, 0.6);
      filter: drop-shadow(0 0 25px rgba(255, 255, 255, 0.6));
    }
  }

  @keyframes number-morph {
    0%,
    100% {
      filter: drop-shadow(0 0 30px rgba(59, 130, 246, 0.4))
        drop-shadow(0 0 60px rgba(96, 165, 250, 0.2))
        drop-shadow(0 0 90px rgba(147, 197, 253, 0.1)) hue-rotate(0deg);
    }

    33% {
      filter: drop-shadow(0 0 35px rgba(96, 165, 250, 0.5))
        drop-shadow(0 0 70px rgba(147, 197, 253, 0.3))
        drop-shadow(0 0 105px rgba(191, 219, 254, 0.15)) hue-rotate(10deg);
    }

    66% {
      filter: drop-shadow(0 0 40px rgba(147, 197, 253, 0.6))
        drop-shadow(0 0 80px rgba(191, 219, 254, 0.4))
        drop-shadow(0 0 120px rgba(219, 234, 254, 0.2)) hue-rotate(-5deg);
    }
  }

  @keyframes gradient-shift {
    0%,
    100% {
      background-position: 0% 50%;
    }

    50% {
      background-position: 100% 50%;
    }
  }

  @keyframes glow-orbit {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }

    100% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  @keyframes glow-pulse {
    0%,
    100% {
      opacity: 0.1;
      transform: translate(-50%, -50%) scale(1);
    }

    50% {
      opacity: 0.4;
      transform: translate(-50%, -50%) scale(1.2);
    }
  }

  @keyframes glow-morph {
    0%,
    100% {
      border-radius: 50%;
      transform: translate(-50%, -50%) scale(1);
    }

    25% {
      border-radius: 40% 60% 70% 30%;
      transform: translate(-50%, -50%) scale(1.05);
    }

    50% {
      border-radius: 60% 40% 30% 70%;
      transform: translate(-50%, -50%) scale(1.1);
    }

    75% {
      border-radius: 30% 70% 40% 60%;
      transform: translate(-50%, -50%) scale(1.05);
    }
  }

  @keyframes particle-orbit {
    0% {
      transform: translate(0, 0) rotate(0deg);
      opacity: 0;
    }

    10% {
      opacity: 0.8;
    }

    50% {
      transform: translate(-20px, -30px) rotate(180deg);
      opacity: 1;
    }

    90% {
      opacity: 0.6;
    }

    100% {
      transform: translate(0, 0) rotate(360deg);
      opacity: 0;
    }
  }

  @keyframes particle-twinkle {
    0%,
    100% {
      opacity: 0.3;
      transform: scale(0.8);
    }

    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }

  @keyframes particle-scale {
    0%,
    100% {
      transform: scale(1);
    }

    25% {
      transform: scale(1.3);
    }

    50% {
      transform: scale(0.7);
    }

    75% {
      transform: scale(1.1);
    }
  }

  /* Enhanced Progress Bar Animations */
  @keyframes progress-shimmer {
    0% {
      transform: translateX(-100%);
      opacity: 0;
    }

    50% {
      opacity: 1;
    }

    100% {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  @keyframes progress-pulse {
    0%,
    100% {
      opacity: 0.2;
      transform: scale(1);
    }

    50% {
      opacity: 0.4;
      transform: scale(1.02);
    }
  }

  @keyframes check-appear {
    0% {
      opacity: 0;
      transform: scale(0.5) rotate(-180deg);
    }

    50% {
      opacity: 0.8;
      transform: scale(1.1) rotate(-90deg);
    }

    100% {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }
  }

  .animate-progress-shimmer {
    animation: progress-shimmer 3s ease-in-out infinite;
  }

  .animate-progress-pulse {
    animation: progress-pulse 2s ease-in-out infinite;
  }

  .animate-check-appear {
    animation: check-appear 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  /* Progress Fill Animation */
  .progress-fill {
    position: relative;
    overflow: hidden;
  }

  .progress-fill::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    animation: progress-sweep 2s ease-in-out infinite;
  }

  @keyframes progress-sweep {
    0% {
      left: -100%;
    }

    100% {
      left: 100%;
    }
  }

  /* Day Indicator Animations */
  .day-indicator {
    position: relative;
    overflow: hidden;
  }

  .day-indicator::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .day-indicator:hover::before {
    opacity: 1;
  }

  /* Staggered Animation for Day Indicators */
  .day-indicator:nth-child(1) {
    animation-delay: 0.1s;
  }

  .day-indicator:nth-child(2) {
    animation-delay: 0.2s;
  }

  .day-indicator:nth-child(3) {
    animation-delay: 0.3s;
  }

  .day-indicator:nth-child(4) {
    animation-delay: 0.4s;
  }

  .day-indicator:nth-child(5) {
    animation-delay: 0.5s;
  }

  .day-indicator:nth-child(6) {
    animation-delay: 0.6s;
  }

  .day-indicator:nth-child(7) {
    animation-delay: 0.7s;
  }

  /* Smooth Transitions */
  .transition-all {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Hover Effects */
  .flame-container:hover .flame-icon {
    animation-duration: 1s;
    filter: drop-shadow(0 0 16px rgba(59, 130, 246, 0.5));
  }

  .flame-container:hover .flame-glow {
    animation-duration: 2s;
  }

  /* Mobile Optimizations */
  @media (max-width: 640px) {
    .flame-icon {
      animation-duration: 2.5s;
    }

    .flame-glow {
      animation-duration: 3.5s;
    }

    .streak-number {
      animation-duration: 5s;
    }

    .streak-glow {
      animation-duration: 7s;
    }
  }

  /* Dark Mode Adjustments */
  @media (prefers-color-scheme: dark) {
    .flame-icon {
      filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.4));
    }

    .flame-glow {
      background: radial-gradient(circle, rgba(96, 165, 250, 0.2) 0%, transparent 70%);
    }

    .streak-glow {
      background: radial-gradient(circle, rgba(96, 165, 250, 0.1) 0%, transparent 70%);
    }
  }

  /* Reduced Motion Support */
  @media (prefers-reduced-motion: reduce) {
    .flame-icon,
    .flame-glow,
    .streak-number,
    .streak-glow,
    .streak-number-enhanced,
    .streak-glow-enhanced,
    .particle,
    .animate-progress-shimmer,
    .animate-progress-pulse,
    .animate-check-appear,
    .progress-fill::before {
      animation: none;
    }

    .flame-icon {
      filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.3));
    }

    .streak-number-enhanced {
      filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.3));
    }

    .day-indicator {
      transform: none !important;
    }
  }
</style>
