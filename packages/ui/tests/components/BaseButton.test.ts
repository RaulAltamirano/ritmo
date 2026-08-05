import { mount } from '@vue/test-utils'
import { Heart } from 'lucide-vue-next'
import { describe, expect, it } from 'vitest'
import BaseButton from '../../src/components/atoms/BaseButton.vue'

describe('BaseButton', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      const wrapper = mount(BaseButton, {
        slots: {
          default: 'Click me',
        },
      })

      expect(wrapper.text()).toBe('Click me')
      expect(wrapper.classes()).toContain('inline-flex')
      expect(wrapper.classes()).toContain('items-center')
      expect(wrapper.classes()).toContain('justify-center')
    })

    it('renders with primary variant', () => {
      const wrapper = mount(BaseButton, {
        props: { variant: 'primary' },
        slots: { default: 'Primary Button' },
      })

      expect(wrapper.classes()).toContain('bg-blue-600')
      expect(wrapper.classes()).toContain('text-white')
    })

    it('renders with secondary variant', () => {
      const wrapper = mount(BaseButton, {
        props: { variant: 'secondary' },
        slots: { default: 'Secondary Button' },
      })

      expect(wrapper.classes()).toContain('bg-gray-100')
      expect(wrapper.classes()).toContain('text-gray-900')
    })

    it('renders with success variant', () => {
      const wrapper = mount(BaseButton, {
        props: { variant: 'success' },
        slots: { default: 'Success Button' },
      })

      expect(wrapper.classes()).toContain('bg-green-600')
      expect(wrapper.classes()).toContain('text-white')
    })

    it('renders with warning variant', () => {
      const wrapper = mount(BaseButton, {
        props: { variant: 'warning' },
        slots: { default: 'Warning Button' },
      })

      expect(wrapper.classes()).toContain('bg-yellow-600')
      expect(wrapper.classes()).toContain('text-white')
    })

    it('renders with error variant', () => {
      const wrapper = mount(BaseButton, {
        props: { variant: 'error' },
        slots: { default: 'Error Button' },
      })

      expect(wrapper.classes()).toContain('bg-red-600')
      expect(wrapper.classes()).toContain('text-white')
    })

    it('renders with ghost variant', () => {
      const wrapper = mount(BaseButton, {
        props: { variant: 'ghost' },
        slots: { default: 'Ghost Button' },
      })

      expect(wrapper.classes()).toContain('bg-transparent')
      expect(wrapper.classes()).toContain('text-gray-700')
    })

    it('renders with outline variant', () => {
      const wrapper = mount(BaseButton, {
        props: { variant: 'outline' },
        slots: { default: 'Outline Button' },
      })

      expect(wrapper.classes()).toContain('bg-transparent')
      expect(wrapper.classes()).toContain('border')
      expect(wrapper.classes()).toContain('border-gray-300')
    })
  })

  describe('Sizes', () => {
    it('renders with xs size', () => {
      const wrapper = mount(BaseButton, {
        props: { size: 'xs' },
        slots: { default: 'XS Button' },
      })

      expect(wrapper.classes()).toContain('px-2')
      expect(wrapper.classes()).toContain('py-1')
      expect(wrapper.classes()).toContain('text-xs')
    })

    it('renders with sm size', () => {
      const wrapper = mount(BaseButton, {
        props: { size: 'sm' },
        slots: { default: 'SM Button' },
      })

      expect(wrapper.classes()).toContain('px-3')
      expect(wrapper.classes()).toContain('py-1.5')
      expect(wrapper.classes()).toContain('text-sm')
    })

    it('renders with md size (default)', () => {
      const wrapper = mount(BaseButton, {
        slots: { default: 'MD Button' },
      })

      expect(wrapper.classes()).toContain('px-4')
      expect(wrapper.classes()).toContain('py-2')
      expect(wrapper.classes()).toContain('text-sm')
    })

    it('renders with lg size', () => {
      const wrapper = mount(BaseButton, {
        props: { size: 'lg' },
        slots: { default: 'LG Button' },
      })

      expect(wrapper.classes()).toContain('px-6')
      expect(wrapper.classes()).toContain('py-3')
      expect(wrapper.classes()).toContain('text-base')
    })

    it('renders with xl size', () => {
      const wrapper = mount(BaseButton, {
        props: { size: 'xl' },
        slots: { default: 'XL Button' },
      })

      expect(wrapper.classes()).toContain('px-8')
      expect(wrapper.classes()).toContain('py-4')
      expect(wrapper.classes()).toContain('text-lg')
    })
  })

  describe('States', () => {
    it('renders disabled state', () => {
      const wrapper = mount(BaseButton, {
        props: { disabled: true },
        slots: { default: 'Disabled Button' },
      })

      expect(wrapper.attributes('disabled')).toBeDefined()
      expect(wrapper.classes()).toContain('disabled:opacity-50')
      expect(wrapper.classes()).toContain('cursor-not-allowed')
    })

    it('renders loading state', () => {
      const wrapper = mount(BaseButton, {
        props: { loading: true },
        slots: { default: 'Loading Button' },
      })

      expect(wrapper.classes()).toContain('cursor-wait')
      expect(wrapper.find('[data-testid="base-spinner"]').exists()).toBe(true)
    })

    it('keeps loading label visible next to the spinner', () => {
      const wrapper = mount(BaseButton, {
        props: { loading: true },
        slots: { default: 'Signing in...' },
      })

      expect(wrapper.text()).toContain('Signing in...')
      expect(wrapper.find('.spinner-ring').exists()).toBe(true)
      expect(wrapper.find('[data-testid="base-spinner"]').attributes('style') ?? '').not.toMatch(
        /opacity:\s*0/,
      )
    })

    it('uses currentColor spinner so contrast follows the button text', () => {
      const wrapper = mount(BaseButton, {
        props: { loading: true, variant: 'secondary' },
        slots: { default: 'Try Again' },
      })

      expect(wrapper.find('.spinner-ring').attributes('style')).toMatch(
        /--spinner-color:\s*currentColor/,
      )
    })

    it('mounts when matchMedia is unavailable', () => {
      const original = window.matchMedia
      // @ts-expect-error jsdom often has no matchMedia
      delete window.matchMedia

      expect(() =>
        mount(BaseButton, { slots: { default: 'Safe Button' } }),
      ).not.toThrow()

      window.matchMedia = original
    })

    it('renders pressed state', () => {
      const wrapper = mount(BaseButton, {
        props: { pressed: true },
        slots: { default: 'Pressed Button' },
      })

      expect(wrapper.attributes('aria-pressed')).toBe('true')
    })

    it('renders full width', () => {
      const wrapper = mount(BaseButton, {
        props: { fullWidth: true },
        slots: { default: 'Full Width Button' },
      })

      expect(wrapper.classes()).toContain('w-full')
    })
  })

  describe('Icons', () => {
    it('renders with left icon spaced via flex gap', () => {
      const wrapper = mount(BaseButton, {
        props: { icon: Heart },
        slots: { default: 'Icon Button' },
      })

      const icon = wrapper.find('[data-testid="base-icon"]')
      expect(icon.exists()).toBe(true)
      expect(wrapper.find('.gap-2').exists()).toBe(true)
    })

    it('renders with right icon spaced via flex gap', () => {
      const wrapper = mount(BaseButton, {
        props: { icon: Heart, iconRight: true },
        slots: { default: 'Icon Button' },
      })

      const icon = wrapper.find('[data-testid="base-icon"]')
      expect(icon.exists()).toBe(true)
      expect(wrapper.find('.gap-2').exists()).toBe(true)
    })

    it('keeps slot icon and label on one row', () => {
      const wrapper = mount(BaseButton, {
        slots: {
          default: '<svg data-testid="slot-icon"></svg><span>Filters</span>',
        },
      })

      expect(wrapper.classes()).toContain('whitespace-nowrap')
      expect(wrapper.classes()).toContain('shrink-0')
      const content = wrapper.find('[data-content="true"]')
      expect(content.classes()).toContain('inline-flex')
      expect(content.classes()).toContain('items-center')
      expect(content.classes()).toContain('gap-2')
    })

    it('hides text when only icon is provided', () => {
      const wrapper = mount(BaseButton, {
        props: { icon: Heart },
      })

      const content = wrapper.find('[data-content="false"]')
      expect(content.exists()).toBe(true)
      expect(content.classes()).toContain('sr-only')
    })
  })

  describe('Events', () => {
    it('emits click event', async () => {
      const wrapper = mount(BaseButton, {
        slots: { default: 'Clickable Button' },
      })

      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
    })

    it('does not emit click when disabled', async () => {
      const wrapper = mount(BaseButton, {
        props: { disabled: true },
        slots: { default: 'Disabled Button' },
      })

      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('does not emit click when loading', async () => {
      const wrapper = mount(BaseButton, {
        props: { loading: true },
        slots: { default: 'Loading Button' },
      })

      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('emits keyboard events', async () => {
      const wrapper = mount(BaseButton, {
        props: { clickable: true },
        slots: { default: 'Keyboard Button' },
      })

      await wrapper.trigger('keydown', { key: 'Enter' })
      expect(wrapper.emitted('click')).toBeTruthy()

      await wrapper.trigger('keydown', { key: ' ' })
      expect(wrapper.emitted('click')).toBeTruthy()
    })

    it('emits arrow key events', async () => {
      const wrapper = mount(BaseButton, {
        props: { clickable: true },
        slots: { default: 'Arrow Button' },
      })

      await wrapper.trigger('keydown', { key: 'ArrowRight' })
      expect(wrapper.emitted('arrowRight')).toBeTruthy()

      await wrapper.trigger('keydown', { key: 'ArrowLeft' })
      expect(wrapper.emitted('arrowLeft')).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const wrapper = mount(BaseButton, {
        props: {
          'aria-label': 'Test button',
          'aria-describedby': 'description',
          'aria-controls': 'controlled-element',
          'aria-haspopup': 'menu',
          pressed: true,
          expanded: true,
        },
        slots: { default: 'Accessible Button' },
      })

      expect(wrapper.attributes('aria-label')).toBe('Test button')
      expect(wrapper.attributes('aria-describedby')).toBe('description')
      expect(wrapper.attributes('aria-controls')).toBe('controlled-element')
      expect(wrapper.attributes('aria-haspopup')).toBe('menu')
      expect(wrapper.attributes('aria-pressed')).toBe('true')
      expect(wrapper.attributes('aria-expanded')).toBe('true')
    })

    it('renders a native button element', () => {
      const wrapper = mount(BaseButton, {
        slots: { default: 'Role Button' },
      })

      expect(wrapper.element.tagName).toBe('BUTTON')
    })

    it('has proper tabindex when clickable', () => {
      const wrapper = mount(BaseButton, {
        props: { clickable: true },
        slots: { default: 'Clickable Button' },
      })

      expect(wrapper.attributes('tabindex')).toBe('0')
    })

    it('has no tabindex when not clickable', () => {
      const wrapper = mount(BaseButton, {
        props: { clickable: false },
        slots: { default: 'Non-clickable Button' },
      })

      expect(wrapper.attributes('tabindex')).toBeUndefined()
    })

    it('has proper focus styles', () => {
      const wrapper = mount(BaseButton, {
        slots: { default: 'Focus Button' },
      })

      expect(wrapper.classes()).toContain('focus:outline-none')
      expect(wrapper.classes()).toContain('focus:ring-2')
      expect(wrapper.classes()).toContain('focus:ring-offset-2')
    })
  })

  describe('Dark Mode', () => {
    it('has dark mode classes for primary variant', () => {
      const wrapper = mount(BaseButton, {
        props: { variant: 'primary' },
        slots: { default: 'Dark Primary' },
      })

      expect(wrapper.classes()).toContain('dark:bg-blue-500')
      expect(wrapper.classes()).toContain('dark:hover:bg-blue-600')
    })

    it('has dark mode classes for secondary variant', () => {
      const wrapper = mount(BaseButton, {
        props: { variant: 'secondary' },
        slots: { default: 'Dark Secondary' },
      })

      expect(wrapper.classes()).toContain('dark:bg-gray-700')
      expect(wrapper.classes()).toContain('dark:text-gray-200')
      expect(wrapper.classes()).toContain('dark:hover:bg-gray-600')
    })

    it('has dark mode classes for ghost variant', () => {
      const wrapper = mount(BaseButton, {
        props: { variant: 'ghost' },
        slots: { default: 'Dark Ghost' },
      })

      expect(wrapper.classes()).toContain('dark:text-gray-300')
      expect(wrapper.classes()).toContain('dark:hover:bg-gray-800')
    })

    it('has dark mode classes for outline variant', () => {
      const wrapper = mount(BaseButton, {
        props: { variant: 'outline' },
        slots: { default: 'Dark Outline' },
      })

      expect(wrapper.classes()).toContain('dark:border-gray-600')
      expect(wrapper.classes()).toContain('dark:text-gray-300')
      expect(wrapper.classes()).toContain('dark:hover:bg-gray-800')
    })
  })

  describe('Performance', () => {
    it('uses computed properties efficiently', () => {
      const wrapper = mount(BaseButton, {
        props: { variant: 'primary', size: 'md' },
        slots: { default: 'Performance Button' },
      })

      // Verificar que las clases se aplican correctamente
      expect(wrapper.classes()).toContain('bg-blue-600')
      expect(wrapper.classes()).toContain('px-4')
      expect(wrapper.classes()).toContain('py-2')
    })

    it('handles prop changes efficiently', async () => {
      const wrapper = mount(BaseButton, {
        props: { variant: 'primary' },
        slots: { default: 'Changeable Button' },
      })

      // Cambiar variant
      await wrapper.setProps({ variant: 'secondary' })
      expect(wrapper.classes()).toContain('bg-gray-100')
      expect(wrapper.classes()).not.toContain('bg-blue-600')

      // Cambiar size
      await wrapper.setProps({ size: 'lg' })
      expect(wrapper.classes()).toContain('px-6')
      expect(wrapper.classes()).toContain('py-3')
    })
  })
})
