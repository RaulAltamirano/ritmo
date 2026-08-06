import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AiChatThread from '@/components/molecules/AiChatThread.vue'

describe('AiChatThread', () => {
  it('renders assistant and user messages', () => {
    const wrapper = mount(AiChatThread, {
      props: {
        messages: [
          {
            id: '1',
            role: 'assistant',
            content: 'What is your level?',
            createdAt: '2026-08-06T00:00:00.000Z',
          },
          {
            id: '2',
            role: 'user',
            content: 'Intermediate',
            createdAt: '2026-08-06T00:00:01.000Z',
          },
        ],
      },
    })
    expect(wrapper.text()).toContain('What is your level?')
    expect(wrapper.text()).toContain('Intermediate')
  })
})
