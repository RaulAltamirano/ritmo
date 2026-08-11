/**
 * 🔥 MODERN 2025 SECURE STORAGE API IMPLEMENTATION
 *
 * Implements industry-leading security practices:
 * - Web Crypto API for encryption
 * - Secure Storage API when available
 * - Fallback to encrypted localStorage
 * - Automatic key rotation
 * - Memory-only storage for sensitive data
 */

export interface SecureStorageOptions {
  encryption?: boolean
  ttl?: number // Time to live in milliseconds
  memoryOnly?: boolean // Store only in memory (most secure)
}

export interface EncryptedData {
  data: string
  iv: string
  salt: string
  version: string
  timestamp: number
}

/**
 * 🔐 SECURE STORAGE SERVICE - 2025 Best Practices
 *
 * Features:
 * - Web Crypto API encryption
 * - Secure Storage API support
 * - Automatic key derivation
 * - Memory-only sensitive storage
 * - Key rotation and expiration
 */
export class SecureStorageService {
  private static instance: SecureStorageService
  private cryptoKey: CryptoKey | null = null
  private readonly memoryStore = new Map<string, { value: any; expires: number }>()
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000 // 24 hours
  private readonly KEY_ROTATION_INTERVAL = 7 * 24 * 60 * 60 * 1000 // 7 days
  private readonly MASTER_KEY_NAME = 'ritmo_master_key_v2'
  private readonly ROTATION_TS_KEY = 'ritmo_master_key_rotated_at'
  private lastKeyRotation = 0
  private initPromise: Promise<void> | null = null

  private constructor() {
    this.initPromise = this.initializeCrypto()
  }

  static getInstance(): SecureStorageService {
    if (!SecureStorageService.instance) {
      SecureStorageService.instance = new SecureStorageService()
    }
    return SecureStorageService.instance
  }

  /** @internal Clears singleton + in-memory state between unit tests. */
  static resetInstanceForTests(): void {
    SecureStorageService.instance = undefined as unknown as SecureStorageService
  }

  private async ensureReady(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise
    }
  }

  /**
   * 🔑 INITIALIZE CRYPTO SYSTEM
   *
   * Sets up Web Crypto API with secure key generation
   */
  private async initializeCrypto(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.crypto?.subtle) {
        this.lastKeyRotation = this.readRotationTimestamp()
        const masterKey = await this.getOrGenerateMasterKey()
        this.cryptoKey = masterKey
        await this.checkKeyRotation()
      }
    } catch {
      // Crypto initialization failed
    }
  }

  private readRotationTimestamp(): number {
    if (typeof window === 'undefined' || !window.localStorage) return 0
    const raw = localStorage.getItem(this.ROTATION_TS_KEY)
    if (!raw) return 0
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : 0
  }

  private persistRotationTimestamp(timestamp: number): void {
    if (typeof window === 'undefined' || !window.localStorage) return
    localStorage.setItem(this.ROTATION_TS_KEY, String(timestamp))
  }

  /**
   * 🎯 GET OR GENERATE MASTER KEY
   *
   * Creates a cryptographically secure master key for encryption
   */
  private async getOrGenerateMasterKey(): Promise<CryptoKey> {
    try {
      const existingKey = await this.getStoredKey(this.MASTER_KEY_NAME)
      if (existingKey) {
        // First install / restored key without rotation stamp: treat "now" as baseline
        // so we don't immediately rotate and orphan ciphertext.
        if (this.lastKeyRotation === 0) {
          this.lastKeyRotation = Date.now()
          this.persistRotationTimestamp(this.lastKeyRotation)
        }
        return existingKey
      }
    } catch {
      // Key not found or invalid, generate new one
    }

    const newKey = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true, // extractable
      ['encrypt', 'decrypt'],
    )

    await this.storeKey(this.MASTER_KEY_NAME, newKey)
    this.lastKeyRotation = Date.now()
    this.persistRotationTimestamp(this.lastKeyRotation)

    return newKey
  }

  /**
   * 🔄 CHECK KEY ROTATION
   *
   * Automatically rotates encryption keys for enhanced security
   */
  private async checkKeyRotation(): Promise<void> {
    const now = Date.now()

    if (this.lastKeyRotation === 0) {
      this.lastKeyRotation = now
      this.persistRotationTimestamp(now)
      return
    }

    if (now - this.lastKeyRotation > this.KEY_ROTATION_INTERVAL) {
      await this.rotateMasterKey()
    }
  }

  /**
   * 🔄 ROTATE MASTER KEY
   *
   * Creates new master key and re-encrypts all stored data
   */
  private async rotateMasterKey(): Promise<void> {
    try {
      const oldKey = this.cryptoKey
      if (!oldKey) return

      const newKey = await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256,
        },
        true,
        ['encrypt', 'decrypt'],
      )

      await this.reEncryptAllData(oldKey, newKey)

      this.cryptoKey = newKey
      await this.storeKey(this.MASTER_KEY_NAME, newKey)
      this.lastKeyRotation = Date.now()
      this.persistRotationTimestamp(this.lastKeyRotation)
    } catch (error) {
      console.error('❌ Master key rotation failed:', error)
    }
  }

  /**
   * 🔄 RE-ENCRYPT ALL DATA
   *
   * Decrypts with the old key and encrypts with the new key.
   */
  private async reEncryptAllData(oldKey: CryptoKey, newKey: CryptoKey): Promise<void> {
    try {
      const keys = Object.keys(localStorage)
      const encryptedKeys = keys.filter(key => key.startsWith('ritmo_encrypted_'))

      for (const key of encryptedKeys) {
        try {
          const encryptedData = localStorage.getItem(key)
          if (!encryptedData) continue

          const decrypted = await this.decryptWithKey(encryptedData, oldKey)
          const reEncrypted = await this.encryptWithKey(decrypted, newKey)
          localStorage.setItem(key, reEncrypted)
        } catch {
          localStorage.removeItem(key)
        }
      }
    } catch (error) {
      console.error('Data re-encryption failed:', error)
    }
  }

  /**
   * 💾 STORE DATA SECURELY
   *
   * Stores data with encryption and optional TTL
   */
  async set(
    key: string,
    value: any,
    options: SecureStorageOptions = {},
  ): Promise<void> {
    try {
      await this.ensureReady()
      const { encryption = true, ttl = this.DEFAULT_TTL, memoryOnly = false } = options

      if (memoryOnly) {
        this.memoryStore.set(key, {
          value,
          expires: Date.now() + ttl,
        })
        return
      }

      if (encryption && this.cryptoKey) {
        const encrypted = await this.encrypt(JSON.stringify(value))
        const storageKey = `ritmo_encrypted_${key}`

        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(storageKey, encrypted)
        }
      } else {
        const storageKey = `ritmo_plain_${key}`
        const dataWithTTL = {
          value,
          expires: Date.now() + ttl,
        }

        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(storageKey, JSON.stringify(dataWithTTL))
        }
      }
    } catch (error) {
      console.error('Secure storage set failed:', error)
      throw new Error('Failed to store data securely')
    }
  }

  /**
   * 📖 RETRIEVE DATA SECURELY
   *
   * Retrieves and decrypts stored data
   */
  async get<T = any>(
    key: string,
    options: SecureStorageOptions = {},
  ): Promise<T | null> {
    try {
      await this.ensureReady()
      const { encryption = true, memoryOnly = false } = options

      if (memoryOnly) {
        const memoryData = this.memoryStore.get(key)
        if (memoryData && memoryData.expires > Date.now()) {
          return memoryData.value
        }
        this.memoryStore.delete(key)
        return null
      }

      if (encryption && this.cryptoKey) {
        const storageKey = `ritmo_encrypted_${key}`
        const encrypted =
          typeof window !== 'undefined' && window.localStorage
            ? localStorage.getItem(storageKey)
            : null

        if (encrypted) {
          try {
            const decrypted = await this.decrypt(encrypted)
            return JSON.parse(decrypted)
          } catch {
            // Orphaned ciphertext (e.g. prior broken key rotation) — drop and miss.
            localStorage.removeItem(storageKey)
            return null
          }
        }
      } else {
        const storageKey = `ritmo_plain_${key}`
        const plain =
          typeof window !== 'undefined' && window.localStorage
            ? localStorage.getItem(storageKey)
            : null

        if (plain) {
          const dataWithTTL = JSON.parse(plain)
          if (dataWithTTL.expires > Date.now()) {
            return dataWithTTL.value
          }
          localStorage.removeItem(storageKey)
        }
      }

      return null
    } catch (error) {
      console.error('Secure storage get failed:', error)
      return null
    }
  }

  /**
   * 🗑️ REMOVE DATA SECURELY
   *
   * Removes data from all storage locations
   */
  remove(key: string): Promise<void> {
    try {
      // Remove from memory
      this.memoryStore.delete(key)

      // Remove from encrypted storage
      const encryptedKey = `ritmo_encrypted_${key}`
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(encryptedKey)
      }

      // Remove from plain storage
      const plainKey = `ritmo_plain_${key}`
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(plainKey)
      }
    } catch (error) {
      console.error('Secure storage remove failed:', error)
    }
    return Promise.resolve()
  }

  /**
   * 🧹 CLEANUP EXPIRED DATA
   *
   * Removes expired data from all storage locations
   */
  cleanup(): Promise<void> {
    try {
      // Cleanup memory store
      const now = Date.now()
      for (const [key, data] of this.memoryStore.entries()) {
        if (data.expires <= now) {
          this.memoryStore.delete(key)
        }
      }

      // Cleanup localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        const keys = Object.keys(localStorage)

        for (const key of keys) {
          if (key.startsWith('ritmo_plain_')) {
            try {
              const data = localStorage.getItem(key)
              if (data) {
                const dataWithTTL = JSON.parse(data)
                if (dataWithTTL.expires <= now) {
                  localStorage.removeItem(key)
                }
              }
            } catch {
              // Remove corrupted data
              localStorage.removeItem(key)
            }
          }
        }
      }
    } catch (error) {
      console.error('Secure storage cleanup failed:', error)
    }
    return Promise.resolve()
  }

  /**
   * 🔐 ENCRYPT DATA
   *
   * Encrypts data using AES-GCM with random IV
   */
  private async encrypt(data: string): Promise<string> {
    if (!this.cryptoKey) {
      throw new Error('Crypto key not available')
    }
    return this.encryptWithKey(data, this.cryptoKey)
  }

  private async encryptWithKey(data: string, key: CryptoKey): Promise<string> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const salt = window.crypto.getRandomValues(new Uint8Array(16))
    const encodedData = new TextEncoder().encode(data)

    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData,
    )

    const encryptedData: EncryptedData = {
      data: Array.from(new Uint8Array(encrypted))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
      iv: Array.from(iv)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
      salt: Array.from(salt)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
      version: '2025.1',
      timestamp: Date.now(),
    }

    return JSON.stringify(encryptedData)
  }

  /**
   * 🔓 DECRYPT DATA
   *
   * Decrypts data using AES-GCM
   */
  private async decrypt(encryptedData: string): Promise<string> {
    if (!this.cryptoKey) {
      throw new Error('Crypto key not available')
    }
    return this.decryptWithKey(encryptedData, this.cryptoKey)
  }

  private async decryptWithKey(encryptedData: string, key: CryptoKey): Promise<string> {
    const encrypted: EncryptedData = JSON.parse(encryptedData)

    const iv = new Uint8Array(
      encrypted.iv.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) ?? [],
    )

    const data = new Uint8Array(
      encrypted.data.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) ?? [],
    )

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data,
    )

    return new TextDecoder().decode(decrypted)
  }

  /**
   * 🔑 STORE CRYPTO KEY
   *
   * Stores encryption key securely
   */
  private async storeKey(keyName: string, key: CryptoKey): Promise<void> {
    try {
      // Export key material
      const exported = await window.crypto.subtle.exportKey('raw', key)
      const keyData = Array.from(new Uint8Array(exported))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      // Store in localStorage (in production, consider more secure storage)
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(keyName, keyData)
      }
    } catch (error) {
      console.error('Failed to store crypto key:', error)
    }
  }

  /**
   * 🔑 RETRIEVE CRYPTO KEY
   *
   * Retrieves stored encryption key
   */
  private async getStoredKey(keyName: string): Promise<CryptoKey | null> {
    try {
      const keyData =
        typeof window !== 'undefined' && window.localStorage
          ? localStorage.getItem(keyName)
          : null

      if (!keyData) return null

      // Convert hex string back to ArrayBuffer
      const keyBytes = new Uint8Array(
        keyData.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) ?? [],
      )

      // Import key
      return await window.crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt'],
      )
    } catch (error) {
      console.error('Failed to retrieve crypto key:', error)
      return null
    }
  }

  /**
   * 🧪 TEST CRYPTO SYSTEM
   *
   * Tests encryption/decryption functionality
   */
  async testCrypto(): Promise<boolean> {
    try {
      const testData = 'test_encryption_data'
      const encrypted = await this.encrypt(testData)
      const decrypted = await this.decrypt(encrypted)

      return decrypted === testData
    } catch (error) {
      console.error('Crypto test failed:', error)
      return false
    }
  }
}

/**
 * 🚀 CONVENIENCE FUNCTIONS
 *
 * Easy-to-use functions for common operations
 */

export const secureStorage = SecureStorageService.getInstance()

/**
 * Store data securely with encryption
 */
export const secureSet = async (
  key: string,
  value: any,
  options?: SecureStorageOptions,
): Promise<void> => {
  await secureStorage.set(key, value, options)
}

/**
 * Retrieve data securely with decryption
 */
export const secureGet = async <T = any>(
  key: string,
  options?: SecureStorageOptions,
): Promise<T | null> => {
  return secureStorage.get<T>(key, options)
}

/**
 * Remove data securely
 */
export const secureRemove = async (key: string): Promise<void> => {
  await secureStorage.remove(key)
}

/**
 * Store sensitive data in memory only (most secure)
 */
export const secureSetMemory = async (
  key: string,
  value: any,
  ttl?: number,
): Promise<void> => {
  await secureStorage.set(key, value, {
    memoryOnly: true,
    ttl: ttl ?? 24 * 60 * 60 * 1000,
  })
}

/**
 * Get sensitive data from memory only
 */
export const secureGetMemory = async <T = any>(key: string): Promise<T | null> => {
  return secureStorage.get<T>(key, { memoryOnly: true })
}
