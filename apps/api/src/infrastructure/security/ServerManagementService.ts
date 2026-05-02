/**
 * RITMO SERVER MANAGEMENT SERVICE
 *
 * Handles server startup, shutdown, and lifecycle management
 */

import { config, secretManager } from '@ritmo/config'
import { Application } from 'express'
import prisma from '../../core/database/prisma.js'
import { serverLogger } from '../../core/utils/ServerLogger.js'

export class ServerManagementService {
  private readonly app: Application
  private server: any
  private readonly logger = serverLogger

  constructor(app: Application) {
    this.app = app
  }

  // ===========================================================================
  // SERVER STARTUP
  // ===========================================================================

  async startServer(): Promise<void> {
    try {
      this.logger.serverStartup()

      // Connect to database
      await this.connectDatabase()

      // Start HTTP server
      await this.startHTTPServer()
    } catch (error) {
      this.logger.startupFailed(error)
      throw error
    }
  }

  private async connectDatabase(): Promise<void> {
    this.logger.databaseConnecting()
    await prisma.$connect()
    this.logger.databaseConnected()
  }

  private async startHTTPServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      const PORT = config.server.port

      this.server = this.app.listen(PORT, () => {
        this.logger.serverReady(PORT)
        resolve()
      })

      this.server.on('error', (error: any) => {
        reject(error instanceof Error ? error : new Error(String(error)))
      })
    })
  }

  // ===========================================================================
  // SERVER SHUTDOWN
  // ===========================================================================

  async shutdownServer(signal: string): Promise<void> {
    this.logger.shutdownInitiated(signal)

    try {
      // Close HTTP server
      if (this.server) {
        await this.closeHTTPServer()
      }

      // Disconnect database
      await this.disconnectDatabase()

      this.logger.shutdownComplete()
    } catch (error) {
      console.error('Error during shutdown:', error)
      throw error
    }
  }

  private async closeHTTPServer(): Promise<void> {
    return new Promise(resolve => {
      if (this.server) {
        this.server.close(() => {
          resolve()
        })
      } else {
        resolve()
      }
    })
  }

  private async disconnectDatabase(): Promise<void> {
    await prisma.$disconnect()
  }

  // ===========================================================================
  // CONFIGURATION DISPLAY
  // ===========================================================================

  displayConfiguration(): void {
    // Display security configuration
    const secrets = {
      JWT_SECRET: secretManager.getJWTSecret(),
      JWT_REFRESH_SECRET: secretManager.getJWTRefreshSecret(),
      SESSION_SECRET: secretManager.getSessionSecret(),
      DEVICE_HMAC_SECRET: secretManager.getDeviceSecret(),
      API_SECRET: secretManager.getAPISecret(),
    }

    this.logger.displaySecurityConfig(secrets)

    // Display server configuration
    this.logger.displayServerConfig(config)

    // Display database configuration
    this.logger.displayDatabaseConfig(config)

    // Display API configuration
    this.logger.displayAPIConfig(config)

    // Separator line
  }

  // ===========================================================================
  // GETTERS
  // ===========================================================================

  getServer(): any {
    return this.server
  }

  getApp(): Application {
    return this.app
  }
}

// Export the class for instantiation
