# Circadian Phase Inline Strip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `CircadianPhaseCard.vue` as a borderless inline strip showing only phase emoji, name, description, and a thin progress bar.

**Architecture:** Single-file rewrite of the molecule component. The composable API and all parent components (`TodayHeader`, `TodayLayout`) remain unchanged. The new component renders nothing when there is no data and is not loading.

**Tech Stack:** Vue 3 SFC, Tailwind CSS, `@vue/test-utils` + Vitest (jsdom)

---

### Task 1: Write the failing tests

**Files:**

- Create: `apps/web/tests/components/molecules/CircadianPhaseCard.test.ts`

- [ ] **Step 1: Create the test file**

```typescript
// apps/web/tests/components/molecules/CircadianPhaseCard.test.ts
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import CircadianPhaseCard from '@/components/molecules/CircadianPhaseCard.vue'

const mockFetch = vi.fn()

const mockUseCircadian = vi.fn()

vi.mock('@/composables/useCircadian', () => ({
  useCircadian: () => mockUseCircadian(),
}))

const phaseData = {
  id: 'phase-1',
  type: 'cognitive_peak',
  category: 'work',
  priority: 'high',
  startHour: 10,
  endHour: 13,
  duration: 180,
  name: 'Pico Cognitivo',
  description: 'Momento ideal para trabajo analítico profundo.',
  idealFor: 'Programación, decisiones complejas',
  color: '#6366f1',
  icon: 'activity',
  emoji: '⚡',
  isPremium: false,
  isIntuitive: true,
}

describe('CircadianPhaseCard', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('renders phase name, emoji, description and progress when data is available', () => {
    mockUseCircadian.mockReturnValue({
      currentPhase: phaseData,
      isLoading: false,
      error: null,
      phaseProgress: 0.6,
      fetchCurrentPhase: mockFetch,
    })

    const wrapper = mount(CircadianPhaseCard)

    expect(wrapper.text()).toContain('Pico Cognitivo')
    expect(wrapper.text()).toContain('⚡')
    expect(wrapper.text()).toContain('Momento ideal para trabajo analítico profundo.')
    expect(wrapper.text()).toContain('60%')
  })

  it('renders loading skeleton and no phase text when isLoading is true', () => {
    mockUseCircadian.mockReturnValue({
      currentPhase: null,
      isLoading: true,
      error: null,
      phaseProgress: 0,
      fetchCurrentPhase: mockFetch,
    })

    const wrapper = mount(CircadianPhaseCard)

    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Pico Cognitivo')
  })

  it('renders error message and retry button when error is set', async () => {
    mockUseCircadian.mockReturnValue({
      currentPhase: null,
      isLoading: false,
      error: 'Network error',
      phaseProgress: 0,
      fetchCurrentPhase: mockFetch,
    })

    const wrapper = mount(CircadianPhaseCard)

    expect(wrapper.text()).toContain('No se pudo cargar la fase')
    const retryBtn = wrapper.find('button')
    expect(retryBtn.exists()).toBe(true)
    await retryBtn.trigger('click')
    expect(mockFetch).toHaveBeenCalledOnce()
  })

  it('renders nothing when currentPhase is null and not loading and no error', () => {
    mockUseCircadian.mockReturnValue({
      currentPhase: null,
      isLoading: false,
      error: null,
      phaseProgress: 0,
      fetchCurrentPhase: mockFetch,
    })

    const wrapper = mount(CircadianPhaseCard)

    expect(wrapper.html()).toBe('<!--v-if-->')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
cd apps/web && pnpm vitest run tests/components/molecules/CircadianPhaseCard.test.ts
```

Expected: 4 FAIL — the current component doesn't match the new expectations (card markup, stats, "Ideal para" still present).

---

### Task 2: Rewrite `CircadianPhaseCard.vue`

**Files:**

- Modify: `apps/web/components/molecules/CircadianPhaseCard.vue`

- [ ] **Step 1: Replace the entire file content**

```vue
<template>
  <div v-if="currentPhase || isLoading || error">
    <!-- Loading skeleton -->
    <div
      v-if="isLoading"
      class="space-y-2 animate-pulse"
      aria-busy="true"
      aria-label="Cargando fase circadiana"
    >
      <div class="flex items-center justify-between">
        <div class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/5" />
        <div class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-8" />
      </div>
      <div class="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
      <div class="h-0.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-3" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex items-center gap-2.5">
      <p class="text-sm text-gray-400 dark:text-gray-500">No se pudo cargar la fase</p>
      <button
        class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-150 cursor-pointer"
        @click="fetchCurrentPhase"
      >
        Reintentar
      </button>
    </div>

    <!-- Phase strip -->
    <div v-else-if="currentPhase">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-base leading-none" aria-hidden="true">{{
            currentPhase.emoji
          }}</span>
          <span class="text-sm font-medium text-gray-900 dark:text-white">
            {{ currentPhase.name }}
          </span>
        </div>
        <span class="text-xs tabular-nums text-gray-400 dark:text-gray-500">
          {{ Math.round(phaseProgress * 100) }}%
        </span>
      </div>
      <p
        class="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 leading-relaxed"
      >
        {{ currentPhase.description }}
      </p>
      <div
        class="w-full h-0.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-3 overflow-hidden"
      >
        <div
          class="h-full rounded-full transition-all duration-500 ease-out"
          :style="{
            width: `${phaseProgress * 100}%`,
            backgroundColor: currentPhase.color,
          }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useCircadian } from '@/composables/useCircadian'

  const { currentPhase, isLoading, error, phaseProgress, fetchCurrentPhase } =
    useCircadian({
      autoRefresh: true,
      refreshInterval: 60000,
    })
</script>
```

- [ ] **Step 2: Run the tests to verify they pass**

```bash
cd apps/web && pnpm vitest run tests/components/molecules/CircadianPhaseCard.test.ts
```

Expected: 4 PASS.

- [ ] **Step 3: Run the full web test suite to check for regressions**

```bash
cd apps/web && pnpm vitest run
```

Expected: all existing tests pass.

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/molecules/CircadianPhaseCard.vue \
        apps/web/tests/components/molecules/CircadianPhaseCard.test.ts \
        docs/superpowers/specs/2026-04-20-circadian-phase-inline-strip-design.md \
        docs/superpowers/plans/2026-04-20-circadian-phase-inline-strip.md
git commit -m "feat: redesign CircadianPhaseCard as minimalist inline strip"
```
