/**
 * 🔥 UNIFIED DEVICE FINGERPRINTING - FRONTEND IMPLEMENTATION
 *
 * This module provides browser-specific device fingerprinting using the shared package
 * to ensure consistency with backend implementation.
 *
 * Key Features:
 * - Uses shared package for consistent device ID generation
 * - Browser-specific component collection
 * - Enhanced security checks
 * - Type-safe implementation
 */

import {
  detectBrowser,
  detectDeviceType,
  detectOS,
  generateDeviceFingerprint,
  generateDeviceId,
  generateDeviceName,
  normalizeDeviceComponents,
  type DeviceFingerprintComponents,
  type DeviceFingerprintResult,
  type ExtendedDeviceInfo,
} from '@ritmo/shared'

// ========================================
// BROWSER-SPECIFIC UTILITIES
// ========================================

/**
 * Collect device components from browser APIs
 *
 * @returns Device fingerprint components
 */
function collectDeviceComponents(): DeviceFingerprintComponents {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return {
      deviceType: 'desktop',
      os: 'Unknown',
      browser: 'Unknown',
      screenResolution: '1920x1080',
      hardwareConcurrency: 1,
      timezone: 'UTC',
      language: 'en',
      userAgent: 'Server',
    }
  }

  const { userAgent } = navigator
  const browser = detectBrowser(userAgent)
  const os = detectOS(userAgent)
  const deviceType = detectDeviceType(userAgent)

  return {
    deviceType,
    os: os.name,
    browser: browser.name,
    screenResolution: `${screen.width}x${screen.height}`,
    hardwareConcurrency: navigator.hardwareConcurrency ?? 1,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    userAgent,
  }
}

/**
 * Collect extended device information from browser APIs
 *
 * @returns Extended device information
 */
function collectExtendedDeviceInfo(): Partial<ExtendedDeviceInfo> {
  if (typeof window === 'undefined') {
    return {
      deviceName: 'Server',
      browserVersion: 'Unknown',
      osVersion: 'Unknown',
      colorDepth: 24,
      pixelRatio: 1,
      language: 'en',
      userAgent: 'Server',
      deviceMemory: undefined,
      isBot: false,
      isVM: false,
      entropyScore: 0,
      timestamp: Date.now(),
      version: '2025.1',
    }
  }

  const { userAgent } = navigator
  const browser = detectBrowser(userAgent)
  const os = detectOS(userAgent)
  const deviceType = detectDeviceType(userAgent)

  return {
    deviceName: generateDeviceName({
      os: os.name,
      browser: browser.name,
      deviceType,
      screenResolution: `${screen.width}x${screen.height}`,
      hardwareConcurrency: navigator.hardwareConcurrency ?? 1,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      userAgent,
    }),
    browserVersion: browser.version,
    osVersion: os.version,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    language: navigator.language,
    userAgent: navigator.userAgent,
    deviceMemory: (navigator as any).deviceMemory,
    isBot: false, // Will be calculated by security checks
    isVM: false, // Will be calculated by security checks
    entropyScore: 0, // Will be calculated by security checks
    timestamp: Date.now(),
    version: '2025.1',
  }
}

/**
 * Perform browser-specific security checks
 *
 * @returns Security analysis results
 */
function performBrowserSecurityChecks(): {
  isBot: boolean
  isVM: boolean
  entropyScore: number
} {
  if (typeof window === 'undefined') {
    return { isBot: false, isVM: false, entropyScore: 0 }
  }

  let isBot = false
  let isVM = false
  let entropyScore = 0

  // Bot detection
  if (navigator.webdriver) isBot = true
  if ((window as any).phantom) isBot = true
  if ((window as any).callPhantom) isBot = true
  if ((window as any).selenium) isBot = true
  if ((window as any).webdriver) isBot = true

  // VM detection
  if (navigator.hardwareConcurrency < 2) isVM = true
  if (screen.width < 1024 && screen.height < 768) isVM = true
  if (screen.width === 1024 && screen.height === 768) isVM = true // Common VM resolution

  // Entropy calculation
  entropyScore = screen.width * screen.height * screen.colorDepth
  entropyScore += navigator.hardwareConcurrency * 1000
  if ((navigator as any).deviceMemory) {
    entropyScore += (navigator as any).deviceMemory * 100
  }
  entropyScore += navigator.language.length * 10
  entropyScore += navigator.plugins.length * 50
  entropyScore += navigator.mimeTypes.length * 25

  return {
    isBot,
    isVM,
    entropyScore: Math.min(entropyScore, 1000000),
  }
}

// ========================================
// MAIN EXPORT FUNCTIONS
// ========================================

/**
 * Generate device fingerprint using shared package
 *
 * This is the main function that should be used by the frontend
 * to ensure consistent device identification with the backend.
 *
 * @returns Complete device fingerprint result
 */
export function getCurrentDeviceFingerprint(): Promise<DeviceFingerprintResult> {
  try {
    // Collect device components
    const components = collectDeviceComponents()

    // Collect extended device info
    const extendedInfo = collectExtendedDeviceInfo()

    // Perform security checks
    const securityChecks = performBrowserSecurityChecks()

    // Merge security checks into extended info
    const finalExtendedInfo = {
      ...extendedInfo,
      ...securityChecks,
      // Ensure all required fields are present
      deviceType: components.deviceType,
      os: components.os,
      browser: components.browser,
      screenResolution: components.screenResolution,
      hardwareConcurrency: components.hardwareConcurrency,
      timezone: components.timezone,
      language: components.language,
      userAgent: components.userAgent,
      // Ensure all optional fields are defined
      deviceName: extendedInfo.deviceName ?? 'Unknown Device',
      browserVersion: extendedInfo.browserVersion ?? 'Unknown',
      osVersion: extendedInfo.osVersion ?? 'Unknown',
      colorDepth: extendedInfo.colorDepth ?? 24,
      pixelRatio: extendedInfo.pixelRatio ?? 1,
      deviceMemory: extendedInfo.deviceMemory,
      isBot: extendedInfo.isBot ?? false,
      isVM: extendedInfo.isVM ?? false,
      entropyScore: extendedInfo.entropyScore ?? 0,
      timestamp: extendedInfo.timestamp ?? Date.now(),
      version: extendedInfo.version ?? '2025.1',
    }

    // Generate device fingerprint using shared package
    const result = generateDeviceFingerprint(components, finalExtendedInfo)

    return Promise.resolve(result)
  } catch (error) {
    console.error('Error generating device fingerprint:', error)

    // Fallback to basic fingerprint
    const fallbackComponents = normalizeDeviceComponents({
      deviceType: 'desktop',
      os: 'Unknown',
      browser: 'Unknown',
      screenResolution: '1920x1080',
      hardwareConcurrency: 1,
      timezone: 'UTC',
      language: 'en',
      userAgent: 'Unknown',
    })

    return Promise.resolve(
      generateDeviceFingerprint(fallbackComponents, {
        deviceName: 'Unknown Device',
        browserVersion: 'Unknown',
        osVersion: 'Unknown',
        colorDepth: 24,
        pixelRatio: 1,
        language: 'en',
        userAgent: 'Unknown',
        isBot: false,
        isVM: false,
        entropyScore: 0,
        timestamp: Date.now(),
        version: '2025.1',
        // Ensure all required fields are present
        deviceType: 'desktop',
        os: 'Unknown',
        browser: 'Unknown',
        screenResolution: '1920x1080',
        hardwareConcurrency: 1,
        timezone: 'UTC',
      }),
    )
  }
}

/**
 * Generate device ID only (lightweight version)
 *
 * @returns Device ID string
 */
export function generateStableDeviceId(): string {
  try {
    const components = collectDeviceComponents()
    return generateDeviceId(components)
  } catch (error) {
    console.error('Error generating device ID:', error)

    // Fallback
    const fallbackComponents = normalizeDeviceComponents({
      deviceType: 'desktop',
      os: 'Unknown',
      browser: 'Unknown',
      screenResolution: '1920x1080',
      hardwareConcurrency: 1,
      timezone: 'UTC',
      language: 'en',
      userAgent: 'Unknown',
    })

    return generateDeviceId(fallbackComponents)
  }
}

/**
 * Validate device fingerprint format
 *
 * @param deviceId - Device ID to validate
 * @returns true if valid, false otherwise
 */
export function validateDeviceFingerprint(deviceId: string): boolean {
  if (!deviceId || typeof deviceId !== 'string') {
    return false
  }

  // Must be exactly 32 characters
  if (deviceId.length !== 32) {
    return false
  }

  // Must be hexadecimal
  if (!/^[a-f0-9]+$/i.test(deviceId)) {
    return false
  }

  return true
}

// ========================================
// LEGACY COMPATIBILITY
// ========================================

/**
 * Legacy interface for backward compatibility
 * @deprecated Use getCurrentDeviceFingerprint() instead
 */
interface DeviceFingerprint {
  deviceId: string
  deviceName: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browser: string
  browserVersion: string
  os: string
  osVersion: string
  screenResolution: string
  colorDepth: number
  pixelRatio: number
  timezone: string
  language: string
  userAgent: string
  hardwareConcurrency: number
  deviceMemory?: number
  isBot: boolean
  isVM: boolean
  entropyScore: number
  timestamp: number
  version: string
}

// ========================================
// EXPORTS
// ========================================

export type { DeviceFingerprintComponents, DeviceFingerprintResult, ExtendedDeviceInfo }

export type { DeviceFingerprint }

export {
  detectBrowser,
  detectDeviceType,
  detectOS,
  generateDeviceId,
  generateDeviceName,
  normalizeDeviceComponents,
}
