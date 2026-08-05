<template>
  <svg
    viewBox="0 0 240 150"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="break-rest-ill"
    :class="{ 'break-rest-ill--paused': paused }"
    aria-hidden="true"
  >
    <g class="break-rest-ill__body">
      <path
        d="M37 126C44 103 57 91 77 91h70c26 0 45 11 56 35"
        class="fill-primary-500/10"
      />
      <path
        d="M37 126C44 103 57 91 77 91h70c26 0 45 11 56 35"
        stroke="currentColor"
        stroke-width="5"
        stroke-linecap="round"
      />
      <path
        d="M74 91V70c0-20 16-36 36-36s36 16 36 36v21"
        class="fill-canvas"
        stroke="currentColor"
        stroke-width="5"
        stroke-linecap="round"
      />
      <circle cx="110" cy="68" r="24" class="fill-primary-500/15" />
      <path
        d="M96 69c7 7 20 7 28 0"
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
      />
      <path
        d="M85 109c14 10 35 14 55 4"
        stroke="currentColor"
        stroke-width="5"
        stroke-linecap="round"
      />
      <circle cx="61" cy="42" r="5" class="fill-primary-300" />
      <circle cx="178" cy="94" r="4" class="fill-primary-300" />
    </g>
    <g class="break-rest-ill__zzz break-rest-ill__zzz--a">
      <path
        d="M168 40h15l-15 18h15"
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
    <g class="break-rest-ill__zzz break-rest-ill__zzz--b">
      <path
        d="M190 19h12l-12 14h12"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      paused?: boolean
    }>(),
    { paused: false },
  )
</script>

<style scoped>
  .break-rest-ill__body {
    transform-origin: 120px 90px;
    animation: break-rest-breath 4.8s ease-in-out infinite;
  }

  .break-rest-ill__zzz {
    transform-origin: center;
    animation: break-rest-zzz 4.2s ease-in-out infinite;
  }

  .break-rest-ill__zzz--b {
    animation-delay: 1.4s;
    opacity: 0.65;
  }

  .break-rest-ill--paused {
    opacity: 0.72;
    transition: opacity 0.25s ease;
  }

  .break-rest-ill--paused .break-rest-ill__body,
  .break-rest-ill--paused .break-rest-ill__zzz {
    animation-play-state: paused;
  }

  @keyframes break-rest-breath {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.018);
    }
  }

  @keyframes break-rest-zzz {
    0%,
    100% {
      transform: translateY(0);
      opacity: 0.45;
    }
    50% {
      transform: translateY(-6px);
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .break-rest-ill__body,
    .break-rest-ill__zzz {
      animation: none;
    }

    .break-rest-ill--paused {
      transition: none;
    }
  }
</style>
