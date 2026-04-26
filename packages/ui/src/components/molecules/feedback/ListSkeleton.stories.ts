import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ListSkeleton from './ListSkeleton.vue'

const meta: Meta<typeof ListSkeleton> = {
  title: 'Components/Molecules/ListSkeleton',
  component: ListSkeleton,
  parameters: {
    docs: {
      description: {
        component:
          'Flexible skeleton component for loading list items. Configurable to match different list layouts with optional icons, subtitles, details, and action buttons. Perfect for creating consistent loading states across the application.',
      },
    },
  },
  argTypes: {
    count: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Number of skeleton items to display',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'minimal'],
      description: 'Visual variant of the skeleton',
    },
    showIcon: {
      control: { type: 'boolean' },
      description: 'Show icon skeleton',
    },
    showStatus: {
      control: { type: 'boolean' },
      description: 'Show status dot skeleton',
    },
    showSubtitle: {
      control: { type: 'boolean' },
      description: 'Show subtitle skeleton',
    },
    showDetails: {
      control: { type: 'boolean' },
      description: 'Show details grid skeleton',
    },
    showAction: {
      control: { type: 'boolean' },
      description: 'Show action button skeleton',
    },
    detailsColumns: {
      control: { type: 'select' },
      options: [1, 2, 3],
      description: 'Number of detail columns',
    },
  },
  args: {
    count: 3,
    variant: 'default',
    showIcon: true,
    showStatus: false,
    showSubtitle: true,
    showDetails: false,
    showAction: true,
    detailsColumns: 3,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    count: 3,
  },
}

export const Minimal: Story = {
  args: {
    count: 3,
    variant: 'minimal',
  },
}

export const WithDetails: Story = {
  args: {
    count: 3,
    showDetails: true,
    detailsColumns: 3,
  },
}

export const WithStatus: Story = {
  args: {
    count: 3,
    showStatus: true,
  },
}

export const NoIcon: Story = {
  args: {
    count: 3,
    showIcon: false,
  },
}

export const NoAction: Story = {
  args: {
    count: 3,
    showAction: false,
  },
}

export const SimpleList: Story = {
  args: {
    count: 5,
    showIcon: false,
    showSubtitle: false,
    showDetails: false,
    showAction: false,
    variant: 'minimal',
  },
}
