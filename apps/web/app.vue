<template>
  <div id="app">
    <div
      v-if="isInitialLoading"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-canvas transition-colors duration-300"
    >
      <div class="flex flex-col items-center justify-center gap-5 text-center">
        <svg
          class="text-brand transition-colors duration-300"
          width="48"
          height="48"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="10"
            y="22"
            width="3"
            height="8"
            rx="1.5"
            fill="currentColor"
            class="bar bar-1"
          />
          <rect
            x="17"
            y="16"
            width="3"
            height="14"
            rx="1.5"
            fill="currentColor"
            class="bar bar-2"
          />
          <rect
            x="24"
            y="20"
            width="3"
            height="10"
            rx="1.5"
            fill="currentColor"
            class="bar bar-3"
          />
          <rect
            x="31"
            y="12"
            width="3"
            height="18"
            rx="1.5"
            fill="currentColor"
            class="bar bar-4"
          />
        </svg>

        <p
          class="m-0 max-w-[350px] animate-[fadeInOut_1.5s_ease-in-out] text-sm font-medium leading-snug tracking-wide text-content-secondary opacity-90"
        >
          {{ currentQuote }}
        </p>
      </div>
    </div>

    <div
      :class="isInitialLoading ? 'opacity-0' : 'opacity-100'"
      class="transition-opacity duration-300"
    >
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>

    <AppNotifications />
  </div>
</template>

<script setup lang="ts">
  import { nextTick, onMounted, ref } from 'vue'

  import AppNotifications from '@/components/organisms/AppNotifications.vue'

  const isInitialLoading = ref(true)

  const motivationalQuotes = [
    'Every great achievement begins with a single step',
    'Focus on progress, not perfection',
    'Your time is your most valuable asset',
    'Small consistent actions lead to big results',
    'Success is the sum of small efforts repeated daily',
    'The future belongs to those who prepare for it today',
    'Productivity is not about doing more, but doing what matters',
    'Time management is life management',
    "Excellence is not a destination, it's a journey",
    'Your potential is limitless when you take action',
    'Great things never come from comfort zones',
    'The secret to getting ahead is getting started',
    "Don't watch the clock; do what it does. Keep going",
    'Success is walking from failure to failure with no loss of enthusiasm',
    'The way to get started is to quit talking and begin doing',
    "It always seems impossible until it's done",
    'Done is better than perfect',
    'The harder you work, the luckier you get',
    'Discipline is choosing between what you want now and what you want most',
    "You don't have to be great to start, but you have to start to be great",
    'One day or day one — you decide',
    'Motivation gets you started, habit keeps you going',
    'Dream big, start small, act now',
    'Action is the foundational key to all success',
    'The only way to do great work is to love what you do',
  ]

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const copy = [...arr]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }

  let shuffledQueue: string[] = []

  const pickQuote = (): string => {
    if (shuffledQueue.length === 0) {
      shuffledQueue = shuffleArray(motivationalQuotes)
    }
    return shuffledQueue.pop()!
  }

  const currentQuote = ref('')

  onMounted(async () => {
    currentQuote.value = pickQuote()
    await nextTick()
    isInitialLoading.value = false
  })
</script>

<style>
  html,
  body {
    margin: 0;
    padding: 0;
    height: 100%;
  }

  #app {
    height: 100vh;
    font-family:
      'Inter',
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      sans-serif;
  }

  /* FOUC prevention — uses design system token so dark mode is automatic */
  html {
    background-color: var(--color-canvas);
  }

  .bar {
    fill: currentColor;
    transform-origin: bottom;
    animation: barPulse 1.5s ease-in-out infinite;
  }

  .bar-1 {
    animation-delay: 0s;
  }
  .bar-2 {
    animation-delay: 0.15s;
  }
  .bar-3 {
    animation-delay: 0.3s;
  }
  .bar-4 {
    animation-delay: 0.45s;
  }

  @keyframes barPulse {
    0%,
    100% {
      opacity: 0.4;
      transform: scaleY(0.8);
    }
    50% {
      opacity: 1;
      transform: scaleY(1.3);
    }
  }

  @keyframes fadeInOut {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }
    20% {
      opacity: 1;
      transform: translateY(0);
    }
    80% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateY(-10px);
    }
  }

  body,
  #app {
    transition:
      background-color 0.3s ease,
      color 0.3s ease;
  }
</style>
