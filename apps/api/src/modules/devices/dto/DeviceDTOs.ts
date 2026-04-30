/**
 * 📱 DEVICE DTOs - RITMO API 2025
 *
 * Data Transfer Objects para el módulo de dispositivos
 * Siguiendo Clean Architecture y Domain Driven Design
 */

// ========================================
// DEVICE DTOs
// ========================================

export interface DeviceDTO {
  id: string
  userId: string
  deviceName: string
  deviceType: string
  browser: string
  os: string
  ipAddress: string
  userAgent: string
  isTrusted: boolean
  lastSeenAt: Date
  createdAt: Date
}

export interface DeviceStatsDTO {
  totalDevices: number
  trustedDevices: number
  untrustedDevices: number
  byType: {
    [deviceType: string]: number
  }
}

// ========================================
// REQUEST DTOs
// ========================================

export interface DeauthorizeDeviceRequestDTO {
  deviceId: string
}

// ========================================
// RESPONSE DTOs
// ========================================

export interface DevicesResponseDTO {
  devices: DeviceDTO[]
}

export interface DeviceStatsResponseDTO {
  stats: DeviceStatsDTO
}

export interface DeauthorizeDeviceResponseDTO {
  success: boolean
  message: string
}
