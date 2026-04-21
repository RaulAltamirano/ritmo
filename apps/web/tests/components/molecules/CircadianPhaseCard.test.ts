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
    expect(wrapper.find('svg').exists()).toBe(true)
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
