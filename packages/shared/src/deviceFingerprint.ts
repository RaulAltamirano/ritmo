/**
 * 🔥 UNIFIED DEVICE FINGERPRINTING SYSTEM - 2025 BEST PRACTICES
 *
 * This module provides consistent device identification across frontend and backend
 * using the same cryptographic algorithm and component collection.
 *
 * Key Features:
 * - Consistent SHA-256 hashing using crypto-js (browser + Node.js compatible)
 * - Standardized component collection and ordering
 * - Unified output format (32-character hex)
 * - Type-safe interfaces with Zod validation
 * - Security enhancements (bot detection, VM detection)
 *
 * Based on 2025 industry standards:
 * - Chrome Device Bound Session Credentials (DBSC)
 * - OWASP Device Fingerprinting Guidelines
 * - Modern privacy-preserving techniques
 */

import CryptoJS from 'crypto-js'
import { z } from 'zod'

// ========================================
// TYPE DEFINITIONS
// ========================================

/**
 * Core device fingerprint components used for ID generation
 * These components are stable and don't change frequently
 */
export interface DeviceFingerprintComponents {
  /** Device type classification */
  deviceType: 'desktop' | 'mobile' | 'tablet'
  /** Operating system name and version */
  os: string
  /** Browser name and version */
  browser: string
  /** Screen resolution in 'widthxheight' format */
  screenResolution: string
  /** Number of CPU cores */
  hardwareConcurrency: number
  /** IANA timezone identifier */
  timezone: string
}

/**
 * Extended device information for comprehensive fingerprinting
 */
export interface ExtendedDeviceInfo extends DeviceFingerprintComponents {
  /** Device name for display purposes */
  deviceName: string
  /** Browser version string */
  browserVersion: string
  /** OS version string */
  osVersion: string
  /** Color depth in bits */
  colorDepth: number
  /** Device pixel ratio */
  pixelRatio: number
  /** Language preference */
  language: string
  /** Full user agent string */
  userAgent: string
  /** Device memory in GB (if available) */
  deviceMemory?: number
  /** Security flags */
  isBot: boolean
  /** Virtual machine detection */
  isVM: boolean
  /** Entropy score for uniqueness */
  entropyScore: number
  /** Generation timestamp */
  timestamp: number
  /** System version */
  version: string
}

/**
 * Device fingerprinting result
 */
export interface DeviceFingerprintResult {
  /** Stable device ID (32-character hex) */
  deviceId: string
  /** Extended device information */
  deviceInfo: ExtendedDeviceInfo
  /** Trust level based on validation */
  trustLevel: 'high' | 'medium' | 'low'
  /** Validation status */
  isValid: boolean
}

// ========================================
// VALIDATION SCHEMAS
// ========================================

/**
 * Zod schema for device fingerprint components validation
 */
export const deviceFingerprintComponentsSchema = z.object({
  deviceType: z.enum(['desktop', 'mobile', 'tablet']),
  os: z.string().min(1, 'OS is required'),
  browser: z.string().min(1, 'Browser is required'),
  screenResolution: z.string().regex(/^\d+x\d+$/, 'Invalid screen resolution format'),
  hardwareConcurrency: z
    .number()
    .int()
    .min(1, 'Hardware concurrency must be at least 1'),
  timezone: z.string().min(1, 'Timezone is required'),
})

/**
 * Zod schema for extended device info validation
 */
export const extendedDeviceInfoSchema = z.object({
  deviceType: z.enum(['desktop', 'mobile', 'tablet']),
  os: z.string().min(1),
  browser: z.string().min(1),
  screenResolution: z.string().regex(/^\d+x\d+$/),
  hardwareConcurrency: z.number().int().min(1),
  timezone: z.string().min(1),
  deviceName: z.string().min(1),
  browserVersion: z.string().min(1),
  osVersion: z.string().min(1),
  colorDepth: z.number().int().min(1),
  pixelRatio: z.number().min(0.1),
  language: z.string().min(2),
  userAgent: z.string().min(1),
  deviceMemory: z.number().optional(),
  isBot: z.boolean(),
  isVM: z.boolean(),
  entropyScore: z.number().min(0),
  timestamp: z.number(),
  version: z.string(),
})

// ========================================
// CORE FUNCTIONS
// ========================================

/**
 * Generate stable device ID using consistent cryptographic hashing
 *
 * This function ensures the same device generates identical IDs across
 * frontend and backend by using:
 * - Same cryptographic algorithm (SHA-256 via crypto-js)
 * - Same component ordering and normalization
 * - Same output format (32-character hex)
 *
 * @param components - Device fingerprint components
 * @returns 32-character hexadecimal device ID
 */
export function generateDeviceId(components: DeviceFingerprintComponents): string {
  // Validate input components
  const validatedComponents = deviceFingerprintComponentsSchema.parse(components)

  // Create fingerprint string with consistent ordering
  const fingerprint = [
    validatedComponents.deviceType,
    validatedComponents.os,
    validatedComponents.browser,
    validatedComponents.screenResolution,
    validatedComponents.hardwareConcurrency.toString(),
    validatedComponents.timezone,
  ].join('-')

  // Generate SHA-256 hash using crypto-js (consistent across platforms)
  const hash = CryptoJS.SHA256(fingerprint)

  // Return first 32 characters of hex representation
  return hash.toString(CryptoJS.enc.Hex).substring(0, 32)
}

/**
 * Validate device ID format and structure
 *
 * @param deviceId - Device ID to validate
 * @returns true if valid, false otherwise
 */
export function validateDeviceId(deviceId: string): boolean {
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

/**
 * Normalize device components for consistent fingerprinting
 *
 * @param components - Raw device components
 * @returns Normalized components
 */
export function normalizeDeviceComponents(
  components: Partial<DeviceFingerprintComponents>,
): DeviceFingerprintComponents {
  return {
    deviceType: components.deviceType || 'desktop',
    os: (components.os || 'Unknown').trim(),
    browser: (components.browser || 'Unknown').trim(),
    screenResolution: components.screenResolution || '1920x1080',
    hardwareConcurrency: components.hardwareConcurrency || 1,
    timezone: components.timezone || 'UTC',
  }
}

// ========================================
// DEVICE DETECTION UTILITIES
// ========================================

/**
 * Detect device type from user agent string
 *
 * @param userAgent - User agent string
 * @returns Device type classification
 */
export function detectDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
  const ua = userAgent.toLowerCase()

  // Tablet detection (check before mobile)
  if (ua.includes('ipad') || (ua.includes('android') && !ua.includes('mobile'))) {
    return 'tablet'
  }

  // Mobile detection
  if (
    ua.includes('mobile') ||
    ua.includes('iphone') ||
    ua.includes('android') ||
    ua.includes('blackberry') ||
    ua.includes('opera mini') ||
    ua.includes('iemobile')
  ) {
    return 'mobile'
  }

  // Default to desktop
  return 'desktop'
}

/**
 * Extract browser information from user agent
 *
 * @param userAgent - User agent string
 * @returns Browser name and version
 */
export function detectBrowser(userAgent: string): { name: string; version: string } {
  const ua = userAgent

  // Chrome (check before Safari)
  const chromeMatch = ua.match(/Chrome\/(\d+)/)
  if (chromeMatch && !ua.includes('Edg')) {
    return { name: 'Chrome', version: chromeMatch[1] }
  }

  // Edge
  const edgeMatch = ua.match(/Edg\/(\d+)/)
  if (edgeMatch) {
    return { name: 'Edge', version: edgeMatch[1] }
  }

  // Firefox
  const firefoxMatch = ua.match(/Firefox\/(\d+)/)
  if (firefoxMatch) {
    return { name: 'Firefox', version: firefoxMatch[1] }
  }

  // Safari (check after Chrome)
  const safariMatch = ua.match(/Version\/(\d+).*Safari/)
  if (safariMatch && !ua.includes('Chrome')) {
    return { name: 'Safari', version: safariMatch[1] }
  }

  return { name: 'Unknown', version: 'Unknown' }
}

/**
 * Extract operating system information from user agent
 *
 * @param userAgent - User agent string
 * @returns OS name and version
 */
export function detectOS(userAgent: string): { name: string; version: string } {
  const ua = userAgent

  // Windows
  const windowsMatch = ua.match(/Windows NT (\d+\.\d+)/)
  if (windowsMatch) {
    return { name: 'Windows', version: windowsMatch[1] }
  }

  // macOS
  const macMatch = ua.match(/Mac OS X (\d+[._]\d+)/)
  if (macMatch) {
    return { name: 'macOS', version: macMatch[1].replace('_', '.') }
  }

  // Linux
  if (ua.includes('Linux')) {
    return { name: 'Linux', version: 'Unknown' }
  }

  // Android
  const androidMatch = ua.match(/Android (\d+\.\d+)/)
  if (androidMatch) {
    return { name: 'Android', version: androidMatch[1] }
  }

  // iOS
  const iosMatch = ua.match(/OS (\d+[._]\d+)/)
  if (iosMatch) {
    return { name: 'iOS', version: iosMatch[1].replace('_', '.') }
  }

  return { name: 'Unknown', version: 'Unknown' }
}

/**
 * Generate descriptive device name
 *
 * @param deviceInfo - Device information
 * @returns Human-readable device name
 */
export function generateDeviceName(deviceInfo: {
  os: string
  browser: string
  deviceType: string
}): string {
  const parts = []

  if (deviceInfo.os && deviceInfo.os !== 'Unknown') {
    parts.push(deviceInfo.os)
  }

  if (deviceInfo.browser && deviceInfo.browser !== 'Unknown') {
    parts.push(deviceInfo.browser)
  }

  if (deviceInfo.deviceType) {
    parts.push(deviceInfo.deviceType)
  }

  return parts.length > 0 ? parts.join(' ') : 'Unknown Device'
}

// ========================================
// SECURITY UTILITIES
// ========================================

/**
 * Perform security checks for bot and VM detection
 *
 * @param deviceInfo - Extended device information
 * @returns Security analysis results
 */
export function performSecurityChecks(deviceInfo: ExtendedDeviceInfo): {
  isBot: boolean
  isVM: boolean
  entropyScore: number
  trustLevel: 'high' | 'medium' | 'low'
} {
  let isBot = false
  let isVM = false
  let entropyScore = 0

  // Bot detection indicators
  if (
    deviceInfo.userAgent.includes('bot') ||
    deviceInfo.userAgent.includes('crawler') ||
    deviceInfo.userAgent.includes('spider')
  ) {
    isBot = true
  }

  // VM detection indicators
  if (deviceInfo.hardwareConcurrency < 2) {
    isVM = true
  }

  if (
    deviceInfo.screenResolution === '1024x768' ||
    deviceInfo.screenResolution === '800x600'
  ) {
    isVM = true
  }

  // Calculate entropy score
  const [width, height] = deviceInfo.screenResolution.split('x').map(Number)
  entropyScore = width * height * deviceInfo.colorDepth
  entropyScore += deviceInfo.hardwareConcurrency * 1000
  if (deviceInfo.deviceMemory) {
    entropyScore += deviceInfo.deviceMemory * 100
  }
  entropyScore += deviceInfo.language.length * 10

  // Determine trust level
  let trustLevel: 'high' | 'medium' | 'low' = 'medium'

  if (isBot || isVM) {
    trustLevel = 'low'
  } else if (entropyScore > 100000 && deviceInfo.hardwareConcurrency >= 4) {
    trustLevel = 'high'
  }

  return { isBot, isVM, entropyScore: Math.min(entropyScore, 1000000), trustLevel }
}

// ========================================
// MAIN EXPORT FUNCTION
// ========================================

/**
 * Generate complete device fingerprint with validation
 *
 * This is the main function that should be used by both frontend and backend
 * to ensure consistent device identification.
 *
 * @param components - Device fingerprint components
 * @param extendedInfo - Optional extended device information
 * @returns Complete device fingerprint result
 */
export function generateDeviceFingerprint(
  components: DeviceFingerprintComponents,
  extendedInfo?: Partial<ExtendedDeviceInfo>,
): DeviceFingerprintResult {
  // Generate stable device ID
  const deviceId = generateDeviceId(components)

  // Create extended device info
  const deviceInfo: ExtendedDeviceInfo = {
    ...components,
    deviceName: extendedInfo?.deviceName || generateDeviceName(components),
    browserVersion: extendedInfo?.browserVersion || 'Unknown',
    osVersion: extendedInfo?.osVersion || 'Unknown',
    colorDepth: extendedInfo?.colorDepth || 24,
    pixelRatio: extendedInfo?.pixelRatio || 1,
    language: extendedInfo?.language || 'en',
    userAgent: extendedInfo?.userAgent || 'Unknown',
    deviceMemory: extendedInfo?.deviceMemory,
    isBot: extendedInfo?.isBot || false,
    isVM: extendedInfo?.isVM || false,
    entropyScore: extendedInfo?.entropyScore || 0,
    timestamp: Date.now(),
    version: '2025.1',
  }

  // Perform security checks
  const securityChecks = performSecurityChecks(deviceInfo)

  return {
    deviceId,
    deviceInfo: {
      ...deviceInfo,
      ...securityChecks,
    },
    trustLevel: securityChecks.trustLevel,
    isValid: validateDeviceId(deviceId),
  }
}

// ========================================
// EXPORTS
// ========================================

// Types are already exported above with their definitions
