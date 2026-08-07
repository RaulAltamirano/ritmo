/**
 * UNIFIED CONFIGURATION SYSTEM
 *
 * Single file with all configuration logic - simplified and consolidated
 * Replaces the complex multi-file architecture with a clean, maintainable solution
 */

import { config as dotenvConfig } from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from root .env ONLY
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '../../..');
const envPath = resolve(projectRoot, '.env');
// Loading .env from project root
dotenvConfig({ path: envPath });

// =============================================================================
// CONFIGURATION INTERFACE
// =============================================================================

export interface RitmoConfig {
  // Server Configuration
  server: {
    port: number;
    host: string;
    environment: string;
    cors: {
      origins: string[];
      credentials: boolean;
    };
  };

  // Database Configuration
  database: {
    url: string;
    ssl: boolean;
    pool: {
      min: number;
      max: number;
    };
  };

  // Security Configuration
  security: {
    jwt: {
      secret: string;
      refreshSecret: string;
      accessTokenExpiry: string;
      refreshTokenExpiry: string;
    };
    session: {
      secret: string;
      maxAge: number;
    };
    rateLimit: {
      windowMs: number;
      maxRequests: number;
    };
    device: {
      hmacSecret: string;
    };
    api: {
      secret: string;
    };
  };

  // API Configuration
  api: {
    baseUrl: string;
    version: string;
    allowedOrigins: string[];
  };

  // Frontend Configuration
  frontend: {
    webPort: number;
    webUrl: string;
    landingPort: number;
    landingUrl: string;
    appName: string;
    appVersion: string;
  };

  // External Services
  redis: {
    url: string;
    password: string;
  };

  email: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
  };
}

// =============================================================================
// VALIDATION RESULTS
// =============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  secretsValidated: boolean;
  databaseValidated: boolean;
}

// =============================================================================
// UNIFIED CONFIGURATION CLASS
// =============================================================================

export class UnifiedConfig {
  private static instance: UnifiedConfig;
  private config: RitmoConfig;
  private readonly secrets: Map<string, string> = new Map();

  private constructor() {
    this.loadSecrets();
    this.config = this.loadConfiguration();
    this.validateConfiguration();
  }

  static getInstance(): UnifiedConfig {
    if (!UnifiedConfig.instance) {
      UnifiedConfig.instance = new UnifiedConfig();
    }
    return UnifiedConfig.instance;
  }

  // ===========================================================================
  // SECRET MANAGEMENT
  // ===========================================================================

  private loadSecrets(): void {
    // Load all secrets into memory
    const secretKeys = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'SESSION_SECRET',
      'DEVICE_HMAC_SECRET',
      'API_SECRET',
      'DATABASE_URL',
      'REDIS_URL',
      'REDIS_PASSWORD',
      'SMTP_HOST',
      'SMTP_PORT',
      'SMTP_SECURE',
      'SMTP_USER',
      'SMTP_PASS',
      'SMTP_FROM',
    ];

    secretKeys.forEach(key => {
      this.secrets.set(key, process.env[key] ?? '');
    });
  }

  private validateSecrets(): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      secretsValidated: false,
      databaseValidated: false,
    };

    // Get critical secrets
    const jwtSecret = this.secrets.get('JWT_SECRET')!;
    const jwtRefreshSecret = this.secrets.get('JWT_REFRESH_SECRET')!;
    const sessionSecret = this.secrets.get('SESSION_SECRET')!;
    const deviceSecret = this.secrets.get('DEVICE_HMAC_SECRET')!;
    const apiSecret = this.secrets.get('API_SECRET')!;

    // Check required secrets exist
    const requiredSecrets = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'SESSION_SECRET',
      'DATABASE_URL',
    ];
    requiredSecrets.forEach(secretKey => {
      const secret = this.secrets.get(secretKey);
      if (!secret) {
        result.errors.push(`Missing required secret: ${secretKey}`);
        result.isValid = false;
      }
    });

    // CRITICAL: Check all secrets are unique
    const allSecrets = [
      jwtSecret,
      jwtRefreshSecret,
      sessionSecret,
      deviceSecret,
      apiSecret,
    ].filter(Boolean);
    const uniqueSecrets = new Set(allSecrets);

    if (allSecrets.length !== uniqueSecrets.size) {
      result.errors.push(
        'CRITICAL: All secrets must be unique - some secrets are being reused!'
      );
      result.isValid = false;
    }

    // Check minimum lengths
    if (jwtSecret && jwtSecret.length < 64) {
      result.errors.push(
        `JWT_SECRET must be at least 64 characters (current: ${jwtSecret.length})`
      );
      result.isValid = false;
    }

    if (jwtRefreshSecret && jwtRefreshSecret.length < 64) {
      result.errors.push(
        `JWT_REFRESH_SECRET must be at least 64 characters (current: ${jwtRefreshSecret.length})`
      );
      result.isValid = false;
    }

    if (sessionSecret && sessionSecret.length < 32) {
      result.errors.push(
        `SESSION_SECRET must be at least 32 characters (current: ${sessionSecret.length})`
      );
      result.isValid = false;
    }

    if (deviceSecret && deviceSecret.length < 32) {
      result.errors.push(
        `DEVICE_HMAC_SECRET must be at least 32 characters (current: ${deviceSecret.length})`
      );
      result.isValid = false;
    }

    if (apiSecret && apiSecret.length < 32) {
      result.errors.push(
        `API_SECRET must be at least 32 characters (current: ${apiSecret.length})`
      );
      result.isValid = false;
    }

    // Check for fallback values
    allSecrets.forEach((secret, index) => {
      const secretNames = [
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'SESSION_SECRET',
        'DEVICE_HMAC_SECRET',
        'API_SECRET',
      ];
      if (
        secret &&
        (secret.includes('fallback') ||
          secret.includes('change-this') ||
          secret.includes('change-in-production'))
      ) {
        result.errors.push(
          `${secretNames[index]} contains fallback values - configure real secret`
        );
        result.isValid = false;
      }
    });

    if (result.isValid) {
      result.secretsValidated = true;
      // All secrets validated successfully
      // All secrets are unique (security requirement met)
    }

    return result;
  }

  // ===========================================================================
  // CONFIGURATION LOADING
  // ===========================================================================

  private loadConfiguration(): RitmoConfig {
    return {
      server: {
        port: parseInt(process.env.PORT ?? '3001'),
        host: process.env.HOST ?? 'localhost',
        environment: process.env.NODE_ENV ?? 'development',
        cors: {
          origins: process.env.ALLOWED_ORIGINS?.split(',').map(o =>
            o.trim()
          ) ?? [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
          ],
          credentials: true,
        },
      },

      database: {
        url:
          process.env.DATABASE_URL ??
          `postgresql://${process.env.DB_USER ?? 'postgres'}:${process.env.DB_PASSWORD ?? 'postgres'}@${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? '5433'}/${process.env.DB_NAME ?? 'ritmo'}`,
        ssl: process.env.DB_SSL === 'true',
        pool: {
          min: parseInt(process.env.DB_POOL_MIN ?? '2'),
          max: parseInt(process.env.DB_POOL_MAX ?? '10'),
        },
      },

      security: {
        jwt: {
          secret: this.secrets.get('JWT_SECRET')!,
          refreshSecret: this.secrets.get('JWT_REFRESH_SECRET')!,
          accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY ?? '15m',
          refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY ?? '7d',
        },
        session: {
          secret: this.secrets.get('SESSION_SECRET')!,
          maxAge: parseInt(process.env.SESSION_MAX_AGE ?? '86400000'),
        },
        rateLimit: {
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000'),
          maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '100'),
        },
        device: {
          hmacSecret: this.secrets.get('DEVICE_HMAC_SECRET') ?? '',
        },
        api: {
          secret: this.secrets.get('API_SECRET') ?? '',
        },
      },

      api: {
        baseUrl: process.env.API_BASE_URL ?? 'http://localhost:3001/api',
        version: process.env.API_VERSION ?? '1.0.0',
        allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',').map(o =>
          o.trim()
        ) ?? ['http://localhost:3000', 'http://localhost:3001'],
      },

      frontend: {
        webPort: parseInt(process.env.WEB_PORT ?? '3000'),
        webUrl: process.env.WEB_URL ?? 'http://localhost:3000',
        landingPort: parseInt(process.env.LANDING_PORT ?? '3002'),
        landingUrl: process.env.LANDING_URL ?? 'http://localhost:3002',
        appName: process.env.NUXT_PUBLIC_APP_NAME ?? 'Ritmo',
        appVersion: process.env.NUXT_PUBLIC_APP_VERSION ?? '2.0.0',
      },

      redis: {
        url: process.env.REDIS_URL ?? 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD ?? 'redis123',
      },

      email: {
        host: process.env.SMTP_HOST ?? '',
        port: parseInt(process.env.SMTP_PORT ?? '587'),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER ?? '',
        pass: process.env.SMTP_PASS ?? '',
        from: process.env.SMTP_FROM ?? 'noreply@ritmo.app',
      },
    };
  }

  // ===========================================================================
  // VALIDATION & HEALTH CHECKS
  // ===========================================================================

  private validateConfiguration(): void {
    const result = this.validateSecrets();

    // Validate NODE_ENV
    const validEnvironments = ['development', 'production', 'test'];
    if (!validEnvironments.includes(this.config.server.environment)) {
      result.warnings.push(
        `NODE_ENV should be development, production, or test (current: ${this.config.server.environment})`
      );
    }

    // Validate DATABASE_URL format
    if (
      this.config.database.url &&
      !this.config.database.url.startsWith('postgresql://')
    ) {
      result.warnings.push('DATABASE_URL should start with postgresql://');
    }

    // Display results
    if (result.isValid) {
      // Environment validation passed
      if (result.warnings.length > 0) {
        // Warnings found
      }
    } else {
      console.error('[ERROR] Environment validation failed:');
      result.errors.forEach(error => console.error(`   - ${error}`));

      if (result.warnings.length > 0) {
        // Warnings found
      }

      // Help solutions
      // Check your .env file in the root directory
      // Ensure all required variables are set
      // Generate new unique secrets using: openssl rand -base64 32

      process.exit(1);
    }
  }

  // ===========================================================================
  // PUBLIC API
  // ===========================================================================

  /**
   * Get the complete configuration
   */
  getConfig(): RitmoConfig {
    return this.config;
  }

  /**
   * Get JWT secret
   */
  getJWTSecret(): string {
    const secret = this.secrets.get('JWT_SECRET')!;
    if (!secret || secret.length < 64) {
      throw new Error('JWT_SECRET not properly configured');
    }
    return secret;
  }

  /**
   * Get JWT refresh secret
   */
  getJWTRefreshSecret(): string {
    const secret = this.secrets.get('JWT_REFRESH_SECRET')!;
    if (!secret || secret.length < 64) {
      throw new Error('JWT_REFRESH_SECRET not properly configured');
    }
    return secret;
  }

  /**
   * Get session secret
   */
  getSessionSecret(): string {
    const secret = this.secrets.get('SESSION_SECRET')!;
    if (!secret || secret.length < 32) {
      throw new Error('SESSION_SECRET not properly configured');
    }
    return secret;
  }

  /**
   * Get device HMAC secret
   */
  getDeviceSecret(): string {
    const secret = this.secrets.get('DEVICE_HMAC_SECRET')!;
    if (!secret || secret.length < 32) {
      throw new Error('DEVICE_HMAC_SECRET not properly configured');
    }
    return secret;
  }

  /**
   * Get API secret
   */
  getAPISecret(): string {
    const secret = this.secrets.get('API_SECRET')!;
    if (!secret || secret.length < 32) {
      throw new Error('API_SECRET not properly configured');
    }
    return secret;
  }

  /**
   * Get database URL
   */
  getDatabaseURL(): string {
    return this.config.database.url;
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return this.config.server.environment === 'production';
  }

  /**
   * Check if running in development
   */
  isDevelopment(): boolean {
    return this.config.server.environment === 'development';
  }

  /**
   * Check if running in test
   */
  isTest(): boolean {
    return this.config.server.environment === 'test';
  }

  /**
   * Refresh configuration (useful for testing)
   */
  refresh(): void {
    this.loadSecrets();
    this.config = this.loadConfiguration();
    this.validateConfiguration();
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

// Create singleton instance
const unifiedConfig = UnifiedConfig.getInstance();

// Export the configuration and utilities
export const config = unifiedConfig.getConfig();
export const secretManager = unifiedConfig;
export const validateEnvironment = () => unifiedConfig.refresh();

// Export helper functions
export const isProduction = () => unifiedConfig.isProduction();
export const isDevelopment = () => unifiedConfig.isDevelopment();
export const isTest = () => unifiedConfig.isTest();

// Export the main class for advanced usage
// Note: UnifiedConfig is already exported above, no need to re-export
