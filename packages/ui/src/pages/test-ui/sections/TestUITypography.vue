<template>
  <section id="typography" class="mb-16">
    <div class="mb-8 border-b border-gray-200 pb-4 dark:border-gray-700">
      <h2
        class="m-0 text-3xl font-bold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
      >
        Typography System
      </h2>
      <p class="mt-2 font-sans leading-relaxed text-gray-600 dark:text-gray-400">
        Optimized for productivity with Inter and JetBrains Mono
      </p>
    </div>

    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <!-- Heading hierarchy -->
      <div
        class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <h3
          class="mb-4 text-xl font-semibold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
        >
          Heading Hierarchy
        </h3>
        <div class="space-y-3">
          <h1
            class="text-3xl font-bold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
          >
            Heading 1 - Inter Display
          </h1>
          <h2
            class="text-2xl font-bold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
          >
            Heading 2 - Inter Display
          </h2>
          <h3
            class="text-xl font-semibold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
          >
            Heading 3 - Inter Display
          </h3>
          <h4
            class="text-lg font-medium leading-normal tracking-normal text-gray-900 font-sans dark:text-white"
          >
            Heading 4 - Inter Sans
          </h4>
        </div>
      </div>

      <!-- Typography classes -->
      <div
        class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <h3
          class="mb-4 text-xl font-semibold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
        >
          Typography Classes
        </h3>
        <div class="space-y-4">
          <p class="text-productivity text-gray-700 dark:text-gray-300">
            <strong>.text-productivity</strong> - Inter optimized for productivity with
            line-height 1.625
          </p>
          <p class="text-code text-gray-700 dark:text-gray-300">
            <strong>.text-code</strong> - JetBrains Mono for code and data
          </p>
          <p class="text-display text-gray-700 dark:text-gray-300">
            <strong>.text-display</strong> - Inter for headings with line-height 1.2
          </p>
        </div>
      </div>
    </div>

    <!-- Optimal reading widths -->
    <div
      class="mt-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <h3
        class="mb-4 text-xl font-semibold leading-tight tracking-tight text-gray-900 font-display dark:text-white"
      >
        Optimal Reading Widths
      </h3>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div class="border-l-4 border-blue-500 pl-4 max-w-narrow">
          <h4 class="mb-2 font-medium text-gray-700 dark:text-gray-300">
            Narrow (40ch)
          </h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Perfect for short content and labels
          </p>
        </div>
        <div class="border-l-4 border-green-500 pl-4 max-w-reading">
          <h4 class="mb-2 font-medium text-gray-700 dark:text-gray-300">
            Reading (65ch)
          </h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Optimal width for long-form reading
          </p>
        </div>
        <div class="border-l-4 border-purple-500 pl-4 max-w-content">
          <h4 class="mb-2 font-medium text-gray-700 dark:text-gray-300">
            Content (80ch)
          </h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Wide area for complex layouts
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
