import { PrismaClient } from '@prisma/client'

// Global variable to store the Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined
}

/**
 * Prisma Client for local development
 * Uses singleton pattern to prevent multiple client instances
 */
class PrismaService {
  private static instance: PrismaClient
  private static isInitialized = false

  /**
   * Get the singleton Prisma client instance
   */
  public static getInstance(): PrismaClient {
    if (!PrismaService.instance) {
      PrismaService.instance = this.createClient()
    }
    return PrismaService.instance
  }

  /**
   * Create a new Prisma client with proper configuration
   */
  private static createClient(): PrismaClient {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    })

    return client
  }

  /**
   * Initialize the Prisma client (call this once at app startup)
   */
  public static async initialize(): Promise<void> {
    if (PrismaService.isInitialized) {
      return
    }

    try {
      const client = PrismaService.getInstance()
      
      // Test the connection
      await client.$connect()
      
      PrismaService.isInitialized = true
      console.log('✅ Prisma client initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Prisma client:', error)
      throw error
    }
  }

  /**
   * Gracefully disconnect the Prisma client
   */
  public static async disconnect(): Promise<void> {
    if (PrismaService.instance) {
      await PrismaService.instance.$disconnect()
      PrismaService.instance = undefined
      PrismaService.isInitialized = false
      console.log('✅ Prisma client disconnected')
    }
  }

  /**
   * Health check for the database connection
   */
  public static async healthCheck(): Promise<boolean> {
    try {
      const client = PrismaService.getInstance()
      await client.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      console.error('Database health check failed:', error)
      return false
    }
  }
}

// Export the singleton instance
export const prisma = PrismaService.getInstance()

// Export the service class for advanced usage
export { PrismaService }

// Default export for convenience
export default prisma 