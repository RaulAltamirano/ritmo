import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AiModelPicker from '@/components/molecules/AiModelPicker.vue'
import { DEFAULT_STUB_MODEL_ID, STUB_AI_MODELS } from '@/types/generateWeek'

describe('AiModelPicker', () => {
  it('shows selected model and updates on choose', async () => {
    const wrapper = mount(AiModelPicker, {
      props: { modelValue: DEFAULT_STUB_MODEL_ID },
    })
    const selected = STUB_AI_MODELS.find(m => m.id === DEFAULT_STUB_MODEL_ID)!
    expect(wrapper.text()).toContain(selected.name)

    await wrapper.get('button[aria-label="Choose AI model"]').trigger('click')
    expect(wrapper.find('input[placeholder="Search models"]').exists()).toBe(
      true,
    )

    const other = STUB_AI_MODELS.find(m => m.id !== DEFAULT_STUB_MODEL_ID)!
    await wrapper.get(`button[aria-label="Select ${other.name}"]`).trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([other.id])
  })

  it('filters models by search', async () => {
    const wrapper = mount(AiModelPicker, {
      props: { modelValue: DEFAULT_STUB_MODEL_ID },
    })
    await wrapper.get('button[aria-label="Choose AI model"]').trigger('click')
    await wrapper.get('input[placeholder="Search models"]').setValue('Deep')
    expect(wrapper.text()).toContain('Ritmo Deep')
    expect(wrapper.text()).not.toContain('Ritmo Fast')
  })
})
