import { describe, expect, it } from 'vitest'
import { useGenerateWeekChat } from '@/composables/useGenerateWeekChat'

describe('useGenerateWeekChat', () => {
  it('starts with an assistant question and not ready', () => {
    const chat = useGenerateWeekChat({
      planName: 'Japanese B2',
      weekStart: '2026-08-03',
    })
    expect(chat.messages.value[0]?.role).toBe('assistant')
    expect(chat.readyToPreview.value).toBe(false)
    expect(chat.phase.value).toBe('chatting')
  })

  it('fills core slots across turns and becomes ready', () => {
    const chat = useGenerateWeekChat({
      planName: 'Japanese B2',
      weekStart: '2026-08-03',
    })
    chat.sendUserMessage('I am intermediate')
    chat.sendUserMessage('Speaking is hardest')
    chat.sendUserMessage('I dislike grammar drills')
    expect(chat.slots.value.level).toBeTruthy()
    expect(chat.slots.value.friction).toBeTruthy()
    expect(chat.slots.value.avoid).toBeTruthy()
    expect(chat.readyToPreview.value).toBe(true)
    expect(chat.phase.value).toBe('readyToPreview')
  })

  it('force-ready on keyword generate', () => {
    const chat = useGenerateWeekChat({
      planName: 'Japanese B2',
      weekStart: '2026-08-03',
    })
    chat.sendUserMessage('generate')
    expect(chat.readyToPreview.value).toBe(true)
  })

  it('generatePreview builds a draft and moves to preview', async () => {
    const chat = useGenerateWeekChat({
      planName: 'Japanese B2',
      weekStart: '2026-08-03',
      daysPerWeek: 4,
      minutesPerSession: 45,
    })
    chat.sendUserMessage('intermediate')
    chat.sendUserMessage('speaking')
    chat.sendUserMessage('no grammar drills')
    await chat.generatePreview()
    expect(chat.phase.value).toBe('preview')
    expect(chat.draft.value?.sessions.length).toBe(4)
    expect(chat.draft.value?.weekStart).toBe('2026-08-03')
  })
})
