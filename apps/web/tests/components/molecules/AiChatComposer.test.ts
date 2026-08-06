import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AiChatComposer from '@/components/molecules/AiChatComposer.vue'

describe('AiChatComposer', () => {
  it('disables send when empty and emits trimmed text', async () => {
    const wrapper = mount(AiChatComposer)
    const send = wrapper.get('button[aria-label="Send message"]')
    expect(send.attributes('disabled')).toBeDefined()

    await wrapper.get('textarea').setValue('  hello  ')
    expect(send.attributes('disabled')).toBeUndefined()
    await send.trigger('click')
    expect(wrapper.emitted('send')).toEqual([['hello']])
    expect((wrapper.get('textarea').element as HTMLTextAreaElement).value).toBe(
      '',
    )
  })
})
