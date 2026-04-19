/**
 * 🔐 ENVIRONMENT VARIABLE VALIDATOR
 *
 * Ensures all required environment variables are present and valid
 * Runs at application startup to prevent runtime errors
 */

export interface EnvValidationResult {
  isValid: boolean
  missing: string[]
  invalid: string[]
  warnings: string[]
}

export class EnvironmentValidator {
  private static requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'NODE_ENV',
  ]

  private static optionalVars = [
    'SESSION_SECRET',
    'ALLOWED_ORIGINS',
    'RATE_LIMIT_WINDOW_MS',
    'RATE_LIMIT_MAX_REQUESTS',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
  ]

  /**
   * Validate all environment variables
   */
  static validate(): EnvValidationResult {
    const missing: string[] = []
    const invalid: string[] = []
    const warnings: string[] = []

    // Check required variables
    for (const varName of this.requiredVars) {
      if (!process.env[varName]) {
        missing.push(varName)
      }
    }

    // Validate specific variables
    this.validateSpecificVars(invalid, warnings)

    // Check for development warnings
    if (process.env.NODE_ENV === 'development') {
      this.checkDevelopmentWarnings(warnings)
    }

    // Check for production requirements
    if (process.env.NODE_ENV === 'production') {
      this.checkProductionRequirements(invalid, warnings)
    }

    return {
      isValid: missing.length === 0 && invalid.length === 0,
      missing,
      invalid,
      warnings,
    }
  }

  /**
   * Validate specific environment variables
   */
  private static validateSpecificVars(invalid: string[], warnings: string[]): void {
    // Validate DATABASE_URL
    if (process.env.DATABASE_URL) {
      if (!process.env.DATABASE_URL.includes('postgresql://')) {
        invalid.push('DATABASE_URL must be a PostgreSQL connection string')
      }
    }

    // Validate JWT secrets
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      warnings.push('JWT_SECRET should be at least 32 characters long')
    }

    if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
      warnings.push('JWT_REFRESH_SECRET should be at least 32 characters long')
    }

    // Validate rate limiting
    if (process.env.RATE_LIMIT_WINDOW_MS) {
      const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS)
      if (isNaN(windowMs) || windowMs < 60000) {
        invalid.push('RATE_LIMIT_WINDOW_MS must be a number >= 60000 (1 minute)')
      }
    }

    if (process.env.RATE_LIMIT_MAX_REQUESTS) {
      const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS)
      if (isNaN(maxRequests) || maxRequests < 1) {
        invalid.push('RATE_LIMIT_MAX_REQUESTS must be a positive number')
      }
    }
  }

  /**
   * Check development-specific warnings
   */
  private static checkDevelopmentWarnings(warnings: string[]): void {
    if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
      warnings.push('Using default JWT_SECRET in development - change for production')
    }

    if (
      process.env.JWT_REFRESH_SECRET ===
      'your-super-secret-refresh-key-change-in-production'
    ) {
      warnings.push(
        'Using default JWT_REFRESH_SECRET in development - change for production',
      )
    }

    if (!process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS.includes('*')) {
      warnings.push('CORS is configured to allow all origins in development')
    }
  }

  /**
   * Check production-specific requirements
   */
  private static checkProductionRequirements(
    invalid: string[],
    warnings: string[],
  ): void {
    if (!process.env.SESSION_SECRET) {
      invalid.push('SESSION_SECRET is required in production')
    }

    if (!process.env.ALLOWED_ORIGINS) {
      invalid.push('ALLOWED_ORIGINS must be configured in production')
    }

    if (process.env.ALLOWED_ORIGINS && process.env.ALLOWED_ORIGINS.includes('*')) {
      invalid.push('ALLOWED_ORIGINS cannot include wildcard (*) in production')
    }

    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 64) {
      warnings.push('JWT_SECRET should be at least 64 characters long in production')
    }

    if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 64) {
      warnings.push(
        'JWT_REFRESH_SECRET should be at least 64 characters long in production',
      )
    }
  }

  /**
   * Display validation results
   */
  static displayResults(result: EnvValidationResult): void {
    console.log('\n🔐 ENVIRONMENT VALIDATION RESULTS')
    console.log('='.repeat(50))

    if (result.isValid) {
      console.log('✅ All required environment variables are valid')
    } else {
      console.log('❌ Environment validation failed')
    }

    if (result.missing.length > 0) {
      console.log('\n❌ MISSING REQUIRED VARIABLES:')
      result.missing.forEach(varName => {
        console.log(`   - ${varName}`)
      })
    }

    if (result.invalid.length > 0) {
      console.log('\n❌ INVALID VARIABLES:')
      result.invalid.forEach(error => {
        console.log(`   - ${error}`)
      })
    }

    if (result.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:')
      result.warnings.forEach(warning => {
        console.log(`   - ${warning}`)
      })
    }

    console.log('='.repeat(50))
  }

  /**
   * Throw error if validation fails
   */
  static validateAndThrow(): void {
    const result = this.validate()

    if (!result.isValid) {
      this.displayResults(result)
      throw new Error('Environment validation failed. Please check the configuration.')
    }

    if (result.warnings.length > 0) {
      this.displayResults(result)
    }
  }
}
