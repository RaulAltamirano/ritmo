/**
 * RITMO - Centralized Environment Configuration
 * Modern, scalable, and professional environment management
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'development' | 'staging' | 'production';
      PORT?: string;
      HOST?: string;
      DATABASE_URL?: string;
      DATABASE_SSL?: string;
      DB_POOL_MIN?: string;
      DB_POOL_MAX?: string;
      API_BASE_URL?: string;
      ALLOWED_ORIGINS?: string;
      RATE_LIMIT_WINDOW_MS?: string;
      RATE_LIMIT_MAX_REQUESTS?: string;
      WEB_PORT?: string;
      WEB_URL?: string;
      LANDING_PORT?: string;
      LANDING_URL?: string;
      JWT_SECRET?: string;
      JWT_REFRESH_SECRET?: string;
      JWT_ACCESS_EXPIRY?: string;
      JWT_REFRESH_EXPIRY?: string;
      SESSION_SECRET?: string;
      SESSION_MAX_AGE?: string;
      REDIS_URL?: string;
      REDIS_PASSWORD?: string;
      SMTP_HOST?: string;
      SMTP_PORT?: string;
      SMTP_SECURE?: string;
      SMTP_USER?: string;
      SMTP_PASS?: string;
    }
  }
}

export interface EnvironmentConfig {
  // Server Configuration
  server: {
    port: number;
    host: string;
    environment: 'development' | 'staging' | 'production';
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

  // API Configuration
  api: {
    baseUrl: string;
    cors: {
      origins: string[];
      credentials: boolean;
    };
    rateLimit: {
      windowMs: number;
      maxRequests: number;
    };
  };

  // Frontend Configuration
  frontend: {
    web: {
      port: number;
      url: string;
    };
    landing: {
      port: number;
      url: string;
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
  };

  // External Services
  services: {
    redis: {
      url: string;
      password: string;
    };
    email: {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      password: string;
    };
  };
}

/**
 * Load environment configuration based on NODE_ENV
 */
export function loadEnvironmentConfig(): EnvironmentConfig {
  const env = process.env.NODE_ENV ?? 'development';

  const baseConfig: EnvironmentConfig = {
    server: {
      port: parseInt(process.env.PORT ?? '3001'),
      host: process.env.HOST ?? 'localhost',
      environment: env,
    },

    database: {
      url:
        process.env.DATABASE_URL ??
        'postgresql://postgres:postgres@localhost:5433/ritmo',
      ssl: process.env.DATABASE_SSL === 'true',
      pool: {
        min: parseInt(process.env.DB_POOL_MIN ?? '2'),
        max: parseInt(process.env.DB_POOL_MAX ?? '10'),
      },
    },

    api: {
      baseUrl:
        process.env.API_BASE_URL ??
        `http://localhost:${process.env.PORT ?? '3001'}`,
      cors: {
        origins: process.env.ALLOWED_ORIGINS?.split(',') ?? [
          'http://localhost:3000',
          'http://localhost:3002',
        ],
        credentials: true,
      },
      rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000'), // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '100'),
      },
    },

    frontend: {
      web: {
        port: parseInt(process.env.WEB_PORT ?? '3000'),
        url: process.env.WEB_URL ?? 'http://localhost:3000',
      },
      landing: {
        port: parseInt(process.env.LANDING_PORT ?? '3002'),
        url: process.env.LANDING_URL ?? 'http://localhost:3002',
      },
    },

    security: {
      jwt: {
        secret:
          process.env.JWT_SECRET ?? 'fallback-secret-change-in-production',
        refreshSecret:
          process.env.JWT_REFRESH_SECRET ??
          'fallback-refresh-secret-change-in-production',
        accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY ?? '15m',
        refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY ?? '7d',
      },
      session: {
        secret:
          process.env.SESSION_SECRET ??
          'fallback-session-secret-change-in-production',
        maxAge: parseInt(process.env.SESSION_MAX_AGE ?? '86400000'), // 24 hours
      },
    },

    services: {
      redis: {
        url: process.env.REDIS_URL ?? 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD ?? 'redis123',
      },
      email: {
        host: process.env.SMTP_HOST ?? '',
        port: parseInt(process.env.SMTP_PORT ?? '587'),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER ?? '',
        password: process.env.SMTP_PASS ?? '',
      },
    },
  };

  // Environment-specific overrides
  if (env === 'production') {
    baseConfig.api.cors.origins = process.env.ALLOWED_ORIGINS?.split(',') ?? [
      'https://ritmo.app',
      'https://www.ritmo.app',
    ];
    baseConfig.server.host = '0.0.0.0';
    baseConfig.database.ssl = true;
  }

  if (env === 'staging') {
    baseConfig.api.cors.origins = process.env.ALLOWED_ORIGINS?.split(',') ?? [
      'https://staging.ritmo.app',
    ];
  }

  return baseConfig;
}

/**
 * Get configuration for a specific service
 */
export function getServiceConfig(service: keyof EnvironmentConfig) {
  const config = loadEnvironmentConfig();
  return config[service];
}

/**
 * Get API configuration specifically
 */
export function getApiConfig() {
  return getServiceConfig('api');
}

/**
 * Get frontend configuration specifically
 */
export function getFrontendConfig() {
  return getServiceConfig('frontend');
}

/**
 * Get security configuration specifically
 */
export function getSecurityConfig() {
  return getServiceConfig('security');
}

/**
 * Validate required environment variables
 */
export function validateEnvironment(): string[] {
  const errors: string[] = [];
  const config = loadEnvironmentConfig();

  if (
    !config.security.jwt.secret ||
    config.security.jwt.secret.includes('fallback')
  ) {
    errors.push('JWT_SECRET is required and must not be the fallback value');
  }

  if (
    !config.security.jwt.refreshSecret ||
    config.security.jwt.refreshSecret.includes('fallback')
  ) {
    errors.push(
      'JWT_REFRESH_SECRET is required and must not be the fallback value'
    );
  }

  if (!config.database.url) {
    errors.push('DATABASE_URL is required');
  }

  return errors;
}

/**
 * Export default configuration
 */
export const config = loadEnvironmentConfig();
export default config;
