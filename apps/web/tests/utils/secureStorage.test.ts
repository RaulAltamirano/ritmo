import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SecureStorageService } from '@/utils/secureStorage'

describe('SecureStorageService', () => {
  beforeEach(() => {
    localStorage.clear()
    SecureStorageService.resetInstanceForTests()
  })

  afterEach(() => {
    localStorage.clear()
    SecureStorageService.resetInstanceForTests()
  })

  it('round-trips encrypted values', async () => {
    const storage = SecureStorageService.getInstance()
    await storage.set('day-summary-2026-08-06', { totalStudyTime: 42 })

    const loaded = await storage.get<{ totalStudyTime: number }>('day-summary-2026-08-06')
    expect(loaded).toEqual({ totalStudyTime: 42 })
  })

  it('does not rotate on every new instance when rotation stamp exists', async () => {
    const first = SecureStorageService.getInstance()
    await first.set('timer-preferences', { focus: 25 })
    const masterBefore = localStorage.getItem('ritmo_master_key_v2')
    const stampBefore = localStorage.getItem('ritmo_master_key_rotated_at')
    expect(masterBefore).toBeTruthy()
    expect(stampBefore).toBeTruthy()

    SecureStorageService.resetInstanceForTests()
    const second = SecureStorageService.getInstance()
    const loaded = await second.get<{ focus: number }>('timer-preferences')

    expect(loaded).toEqual({ focus: 25 })
    expect(localStorage.getItem('ritmo_master_key_v2')).toBe(masterBefore)
  })

  it('re-encrypts with the new key when rotation is due', async () => {
    const storage = SecureStorageService.getInstance()
    await storage.set('day-summary-old', { ok: true })

    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000
    localStorage.setItem('ritmo_master_key_rotated_at', String(eightDaysAgo))

    SecureStorageService.resetInstanceForTests()
    const rotated = SecureStorageService.getInstance()
    const loaded = await rotated.get<{ ok: boolean }>('day-summary-old')

    expect(loaded).toEqual({ ok: true })
  })

  it('drops orphaned ciphertext instead of logging OperationError repeatedly', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const storage = SecureStorageService.getInstance()
    await storage.set('day-summary-orphan', { ok: true })

    // Simulate prior broken rotation: ciphertext remains, master key replaced.
    const orphanKey = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt'],
    )
    const exported = await window.crypto.subtle.exportKey('raw', orphanKey)
    const hex = Array.from(new Uint8Array(exported))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    localStorage.setItem('ritmo_master_key_v2', hex)

    SecureStorageService.resetInstanceForTests()
    const next = SecureStorageService.getInstance()
    const loaded = await next.get('day-summary-orphan')

    expect(loaded).toBeNull()
    expect(localStorage.getItem('ritmo_encrypted_day-summary-orphan')).toBeNull()
    expect(errorSpy).not.toHaveBeenCalledWith(
      'Secure storage get failed:',
      expect.anything(),
    )
    errorSpy.mockRestore()
  })
})
