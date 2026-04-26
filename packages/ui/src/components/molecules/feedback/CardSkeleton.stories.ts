import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CardSkeleton from './CardSkeleton.vue'

const meta: Meta<typeof CardSkeleton> = {
  title: 'Components/Molecules/CardSkeleton',
  component: CardSkeleton,
  parameters: {
    docs: {
      description: {
        component:
          'Flexible skeleton component for loading card layouts. Configurable to match different card structures with optional headers, content areas, and footers. Supports text, grid, and list content types.',
      },
    },
  },
  argTypes: {
    count: {
      control: { type: 'number', min: 1, max: 5 },
      description: 'Number of card skeleton items to display',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'minimal'],
      description: 'Visual variant of the skeleton',
    },
    showHeader: {
      control: { type: 'boolean' },
      description: 'Show card header skeleton',
    },
    showContent: {
      control: { type: 'boolean' },
      description: 'Show card content skeleton',
    },
    contentType: {
      control: { type: 'select' },
      options: ['text', 'grid', 'list'],
      description: 'Type of content skeleton to show',
    },
    gridColumns: {
      control: { type: 'select' },
      options: [1, 2, 3, 4],
      description: 'Number of grid columns (when contentType is grid)',
    },
    showFooter: {
      control: { type: 'boolean' },
      description: 'Show card footer skeleton',
    },
  },
  args: {
    count: 1,
    variant: 'default',
    showHeader: true,
    showContent: true,
    contentType: 'text',
    gridColumns: 4,
    showFooter: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    count: 1,
  },
}

export const TextContent: Story = {
  args: {
    count: 1,
    contentType: 'text',
  },
}

export const GridContent: Story = {
  args: {
    count: 1,
    contentType: 'grid',
    gridColumns: 4,
  },
}

export const ListContent: Story = {
  args: {
    count: 1,
    contentType: 'list',
    listItems: 4,
  },
}

export const WithFooter: Story = {
  args: {
    count: 1,
    showFooter: true,
    showFooterAction: true,
  },
}

export const Minimal: Story = {
  args: {
    count: 1,
    variant: 'minimal',
  },
}

export const MultipleCards: Story = {
  args: {
    count: 3,
  },
}
