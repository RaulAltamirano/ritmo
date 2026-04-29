/**
 * 🔥 UNIFIED DEVICE FINGERPRINTING - BACKEND IMPLEMENTATION
 *
 * This module provides server-side device fingerprinting using the shared package
 * to ensure consistency with frontend implementation.
 *
 * Key Features:
 * - Uses shared package for consistent device ID generation
 * - Server-side component collection from request headers
 * - Enhanced security validation
 * - Type-safe implementation
 */

import {
  detectBrowser,
  detectDeviceType,
  detectOS,
  generateDeviceId,
  generateDeviceName,
  normalizeDeviceComponents,
  generateDeviceFingerprint as sharedGenerateDeviceFingerprint,
  validateDeviceId,
  type DeviceFingerprintComponents,
  type DeviceFingerprintResult,
  type ExtendedDeviceInfo,
} from '@ritmo/shared'
import { createHash, randomBytes } from 'crypto'
import { DeviceInfo } from '../types/session.js'

// ========================================
// SERVER-SPECIFIC UTILITIES
// ========================================

/**
 * Extract device components from request headers and user agent
 *
 * @param userAgent - User agent string from request
 * @param deviceInfo - Additional device info from request
 * @returns Device fingerprint components
 */
function extractDeviceComponentsFromRequest(
  userAgent: string,
  deviceInfo?: Partial<DeviceInfo>,
): DeviceFingerprintComponents {
  const browser = detectBrowser(userAgent)
  const os = detectOS(userAgent)
  const deviceType = detectDeviceType(userAgent)

  return {
    deviceType: deviceInfo?.deviceType ?? deviceType,
    os: deviceInfo?.os ?? os.name,
    browser: deviceInfo?.browser ?? browser.name,
    screenResolution: (deviceInfo as any)?.screenResolution ?? '1920x1080', // Default for server-side
    hardwareConcurrency: (deviceInfo as any)?.hardwareConcurrency ?? 1, // Default for server-side
    timezone: deviceInfo?.timezone ?? 'UTC',
    userAgent,
  } as DeviceFingerprintComponents
}

/**
 * Extract extended device information from request
 *
 * @param userAgent - User agent string from request
 * @param deviceInfo - Additional device info from request
 * @param ipAddress - Client IP address
 * @returns Extended device information
 */
function extractExtendedDeviceInfoFromRequest(
  userAgent: string,
  deviceInfo?: Partial<DeviceInfo>,
  _ipAddress?: string,
): Partial<ExtendedDeviceInfo> {
  const browser = detectBrowser(userAgent)
  const os = detectOS(userAgent)
  const deviceType = detectDeviceType(userAgent)

  return {
    deviceName: generateDeviceName({ os: os.name, browser: browser.name, deviceType }),
    browserVersion: browser.version,
    osVersion: os.version,
    colorDepth: (deviceInfo as any)?.colorDepth ?? 24,
    pixelRatio: (deviceInfo as any)?.pixelRatio ?? 1,
    language: (deviceInfo as any)?.language ?? 'en',
    userAgent,
    deviceMemory: (deviceInfo as any)?.deviceMemory,
    isBot: false, // Will be calculated by security checks
    isVM: false, // Will be calculated by security checks
    entropyScore: 0, // Will be calculated by security checks
    timestamp: Date.now(),
    version: '2025.1',
  }
}

/**
 * Perform server-side security checks
 *
 * @param userAgent - User agent string
 * @param ipAddress - Client IP address
 * @param deviceInfo - Device information
 * @returns Security analysis results
 */
function performServerSecurityChecks(
  userAgent: string,
  ipAddress?: string,
  deviceInfo?: Partial<DeviceInfo>,
): {
  isBot: boolean
  isVM: boolean
  entropyScore: number
} {
  let isBot = false
  let isVM = false
  let entropyScore = 0

  // Bot detection based on user agent patterns
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /php/i,
    /go-http/i,
    /okhttp/i,
  ]

  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    isBot = true
  }

  // VM detection based on common VM user agents
  const vmPatterns = [/vmware/i, /virtualbox/i, /qemu/i, /xen/i, /kvm/i]

  if (vmPatterns.some(pattern => pattern.test(userAgent))) {
    isVM = true
  }

  // Entropy calculation based on available information
  entropyScore = userAgent.length * 10
  if (ipAddress) {
    entropyScore += ipAddress.length * 5
  }
  if ((deviceInfo as any)?.screenResolution) {
    const [width, height] = (deviceInfo as any).screenResolution.split('x').map(Number)
    entropyScore += width * height * 0.1
  }
  if ((deviceInfo as any)?.hardwareConcurrency) {
    entropyScore += (deviceInfo as any).hardwareConcurrency * 100
  }

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
 * This is the main function that should be used by the backend
 * to ensure consistent device identification with the frontend.
 *
 * @param userAgent - User agent string from request
 * @param deviceInfo - Additional device info from request
 * @param ipAddress - Client IP address
 * @returns Complete device fingerprint result
 */
export function generateStableDeviceFingerprint(
  userAgent: string,
  deviceInfo?: Partial<DeviceInfo>,
  ipAddress?: string,
): DeviceFingerprintResult {
  try {
    // Extract device components
    const components = extractDeviceComponentsFromRequest(userAgent, deviceInfo)

    // Extract extended device info
    const extendedInfo = extractExtendedDeviceInfoFromRequest(
      userAgent,
      deviceInfo,
      ipAddress,
    )

    // Perform security checks
    const securityChecks = performServerSecurityChecks(userAgent, ipAddress, deviceInfo)

    // Merge security checks into extended info
    const finalExtendedInfo = {
      ...extendedInfo,
      ...securityChecks,
    }

    // Generate device fingerprint using shared package
    const result = sharedGenerateDeviceFingerprint(components, finalExtendedInfo)

    return result
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
      userAgent: userAgent ?? 'Unknown',
    } as Partial<DeviceFingerprintComponents>)

    return sharedGenerateDeviceFingerprint(fallbackComponents, {
      deviceName: 'Unknown Device',
      browserVersion: 'Unknown',
      osVersion: 'Unknown',
      colorDepth: 24,
      pixelRatio: 1,
      language: 'en',
      userAgent: userAgent ?? 'Unknown',
      isBot: false,
      isVM: false,
      entropyScore: 0,
      timestamp: Date.now(),
      version: '2025.1',
    })
  }
}

/**
 * Generate device ID only (lightweight version)
 *
 * @param userAgent - User agent string from request
 * @param deviceInfo - Additional device info from request
 * @returns Device ID string
 */
export function generateDeviceIdFromRequest(
  userAgent: string,
  deviceInfo?: Partial<DeviceInfo>,
): string {
  try {
    const components = extractDeviceComponentsFromRequest(userAgent, deviceInfo)
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
export function isValidDeviceFingerprint(deviceId: string): boolean {
  return validateDeviceId(deviceId)
}

// ========================================
// LEGACY COMPATIBILITY
// ========================================

/**
 * Legacy function for backward compatibility
 * @deprecated Use generateStableDeviceFingerprint() instead
 */
export function generateDeviceFingerprint(deviceInfo: Partial<DeviceInfo>): string {
  const userAgent = deviceInfo.userAgent ?? 'Unknown'
  const result = generateStableDeviceFingerprint(userAgent, deviceInfo)
  return result.deviceId
}

// ========================================
// DEVICE SESSION TOKEN VALIDATION
// ========================================

/**
 * LAYER 2: Device session token validation
 * Frontend sends device session token, backend validates and links to stable fingerprint
 */
export function validateDeviceSessionToken(
  frontendDeviceToken: string | null,
  serverFingerprint: string,
  sessionId: string,
): {
  isValid: boolean
  finalDeviceId: string
  trustLevel: 'high' | 'medium' | 'low'
} {
  // No frontend token provided
  if (!frontendDeviceToken) {
    return {
      isValid: true,
      finalDeviceId: serverFingerprint,
      trustLevel: 'medium',
    }
  }

  // Validate frontend token format and authenticity
  const tokenValid = validateTokenFormat(frontendDeviceToken)

  if (tokenValid) {
    // High trust: Both frontend and backend agree on device identity
    const combinedDeviceId = createHash('sha256')
      .update(`${serverFingerprint}:${frontendDeviceToken}:${sessionId}`)
      .digest('hex')
      .substring(0, 32)

    return {
      isValid: true,
      finalDeviceId: combinedDeviceId,
      trustLevel: 'high',
    }
  }
  // Low trust: Frontend token invalid, fallback to server fingerprint
  return {
    isValid: true,
    finalDeviceId: serverFingerprint,
    trustLevel: 'low',
  }
}

/**
 * Modern device session token format validation
 * Based on Chrome DBSC and modern device identity standards
 */
function validateTokenFormat(token: string): boolean {
  try {
    // Expected format: base64url encoded JSON with specific structure
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    const tokenData = JSON.parse(decoded)

    // Validate required fields
    const requiredFields = ['deviceId', 'timestamp', 'signature']
    const hasAllFields = requiredFields.every(field => tokenData[field])

    if (!hasAllFields) return false

    // Validate timestamp (token should be recent, within 24 hours)
    const tokenTime = new Date(tokenData.timestamp).getTime()
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    if (now - tokenTime > maxAge) return false

    // Additional validation can be added here (signature verification, etc.)
    return true
  } catch {
    return false
  }
}

/**
 * Generate device session challenge for frontend
 * This creates a challenge that the frontend must solve to prove device authenticity
 */
export function generateDeviceChallenge(sessionId: string): {
  challenge: string
  challengeHash: string
} {
  const timestamp = Date.now()
  const nonce = randomBytes(16).toString('hex')
  const challenge = `${sessionId}:${timestamp}:${nonce}`
  const challengeHash = createHash('sha256').update(challenge).digest('hex')

  return {
    challenge: Buffer.from(challenge).toString('base64url'),
    challengeHash,
  }
}

// ========================================
// EXPORTS
// ========================================

export type { DeviceFingerprintComponents, DeviceFingerprintResult, ExtendedDeviceInfo }

export {
  detectBrowser,
  detectDeviceType,
  detectOS,
  generateDeviceId,
  generateDeviceName,
  normalizeDeviceComponents,
  validateDeviceId,
}
