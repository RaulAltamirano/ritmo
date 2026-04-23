/**
 * RITMO CONFIGURATION CENTER
 *
 * Unified configuration system - single source of truth
 * Consolidated from multiple files into one clean, maintainable solution
 */

// Re-export everything from the unified configuration
export * from './unified-config.js';

// For backward compatibility, also export the types
export type { RitmoConfig, ValidationResult } from './unified-config.js';
