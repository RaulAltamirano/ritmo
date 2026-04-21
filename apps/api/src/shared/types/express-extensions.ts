/**
 * 📝 EXTENDED EXPRESS TYPES - RITMO API 2025
 *
 * Extensiones de tipos para Express Request y Response
 */

import { Request, Response } from 'express'

// ========================================
// EXTENDED REQUEST INTERFACE
// ========================================

export interface ExtendedRequest extends Request {
  requestId?: string
  requestTimestamp?: string
  pathInfo?: {
    path: string
    method: string
    originalUrl: string
  }
  user?: {
    id: string
    email: string
    username: string
    firstName?: string
    lastName?: string
    avatar?: string
    timezone: string
    language: string
    isActive: boolean
    isEmailVerified: boolean
    role: string
  }
  sessionId?: string
  params: {
    action?: string
    [key: string]: any
  }
}

// ========================================
// EXTENDED RESPONSE INTERFACE
// ========================================

export interface ExtendedResponse extends Response {
  // Extendemos la respuesta si es necesario
}

// ========================================
// REQUEST CONTEXT
// ========================================

export interface RequestContext {
  requestId: string
  timestamp: string
  path: string
  method: string
  user?: {
    id: string
    email: string
  }
}

// ========================================
// VALIDATION CONTEXT
// ========================================

export interface ValidationContext {
  field: string
  message: string
  value?: any
  code?: string
}

// ========================================
// API METADATA
// ========================================

export interface ApiMetadata {
  timestamp: string
  path: string
  method: string
  requestId?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ========================================
// ERROR CONTEXT
// ========================================

export interface ErrorContext {
  code: string
  message: string
  details?: any[]
  stack?: string
  timestamp: string
  requestId?: string
}
