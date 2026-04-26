import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SessionSkeleton from './SessionSkeleton.vue'

const meta: Meta<typeof SessionSkeleton> = {
  title: 'Components/Molecules/SessionSkeleton',
  component: SessionSkeleton,
  parameters: {
    docs: {
      description: {
        component:
          'Skeleton component for loading session lists. Provides a realistic loading state that matches the actual session card layout. Includes device icon, name, browser info, location, time, status badge, and action button skeletons.',
      },
    },
  },
  argTypes: {
    count: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Number of session skeleton items to display',
    },
  },
  args: {
    count: 3,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    count: 3,
  },
}

export const SingleSession: Story = {
  args: {
    count: 1,
  },
}

export const MultipleSessions: Story = {
  args: {
    count: 5,
  },
}

export const ManySessions: Story = {
  args: {
    count: 8,
  },
}
