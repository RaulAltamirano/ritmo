/**
 * 🔧 PRISMA TEST CONFIGURATION - RITMO API 2025
 *
 * Configuración optimizada de Prisma para tests
 * Implementando pool de conexiones, reconexión automática y optimizaciones
 */

import { PrismaClient } from '@prisma/client'

// Configuración optimizada para tests
const createTestPrismaClient = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url:
          process.env.TEST_DATABASE_URL ??
          'postgresql://test:test@localhost:5434/ritmo_test',
      },
    },
    // Configuración optimizada para tests
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

// Cliente Prisma optimizado para tests
export const testPrisma = createTestPrismaClient()

// Función para reconexión automática
export const reconnectPrisma = async () => {
  try {
    await testPrisma.$disconnect()
  } catch {
    // Ignorar errores de desconexión
  }

  try {
    await testPrisma.$connect()
    console.log('✅ Prisma reconnected successfully')
  } catch (error) {
    console.error('❌ Failed to reconnect Prisma:', error)
    throw error
  }
}

// Función para limpiar base de datos con reconexión automática
export const clearTestDatabaseWithRetry = async (maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🧹 Clearing test database (attempt ${attempt}/${maxRetries})...`)

      // Usar operaciones individuales para evitar timeouts
      await testPrisma.securityLog.deleteMany()
      await testPrisma.refreshToken.deleteMany()
      await testPrisma.passwordResetToken.deleteMany()
      await testPrisma.userSession.deleteMany()
      await testPrisma.workSession.deleteMany()
      await testPrisma.circadianPhaseSession.deleteMany()
      await testPrisma.task.deleteMany()
      await testPrisma.circadianPhasePreference.deleteMany()
      await testPrisma.circadianPhase.deleteMany()
      await testPrisma.category.deleteMany()
      await testPrisma.user.deleteMany()

      console.log('✅ Test database cleared successfully')
      return
    } catch (error) {
      console.error(`❌ Failed to clear database (attempt ${attempt}):`, error)

      if (attempt === maxRetries) {
        console.log('🔄 Attempting forced cleanup...')
        await forceClearDatabase()
        return
      }

      // Intentar reconectar antes del siguiente intento
      await reconnectPrisma()
      await new Promise(resolve => setTimeout(resolve, 1000)) // Esperar 1 segundo
    }
  }
}

// Función de limpieza forzada con SQL directo
export const forceClearDatabase = async () => {
  try {
    console.log('🔄 Attempting forced database cleanup...')

    // Usar SQL directo para limpieza completa
    await testPrisma.$executeRaw`TRUNCATE TABLE security_logs, refresh_tokens, password_reset_tokens, user_sessions, work_sessions, circadian_phase_sessions, tasks, circadian_phase_preferences, circadian_phases, categories, users CASCADE`

    console.log('✅ Forced database cleanup completed')
  } catch (error) {
    console.error('❌ Forced cleanup also failed:', error)
    // No lanzar error para no romper los tests
  }
}

// Función para verificar conexión
export const checkPrismaConnection = async () => {
  try {
    await testPrisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('❌ Prisma connection check failed:', error)
    return false
  }
}

// Función para setup de base de datos con verificación
export const setupTestDatabase = async () => {
  try {
    console.log('🔧 Setting up test database...')

    // Verificar conexión
    const isConnected = await checkPrismaConnection()
    if (!isConnected) {
      console.log('🔄 Attempting to reconnect...')
      await reconnectPrisma()
    }

    console.log('✅ Database connection established')

    // Ejecutar migraciones
    console.log('🔄 Running migrations...')
    const { execSync } = await import('child_process')
    execSync('npx prisma migrate deploy', {
      env: {
        ...process.env,
        DATABASE_URL:
          process.env.TEST_DATABASE_URL ??
          'postgresql://test:test@localhost:5434/ritmo_test',
      },
      stdio: 'inherit',
    })

    // Limpiar base de datos inicial
    await clearTestDatabaseWithRetry()

    console.log('✅ Test database setup complete')
  } catch (error) {
    console.error('❌ Failed to setup test database:', error)
    throw error
  }
}

// Función para cleanup de base de datos
export const cleanupTestDatabase = async () => {
  try {
    console.log('🗑️ Cleaning up test database...')
    await testPrisma.$disconnect()
  } catch (error) {
    console.error('❌ Failed to cleanup test database:', error)
  }
}

// Middleware para manejar errores de Prisma
export const handlePrismaError = async (error: any, operation: string) => {
  if (
    error.code === 'P2028' ||
    error.message?.includes('Engine is not yet connected')
  ) {
    console.log(
      `🔄 Prisma connection lost during ${operation}, attempting reconnect...`,
    )
    await reconnectPrisma()
    return true // Indicar que se debe reintentar
  }
  return false // No reintentar
}

// Función wrapper para operaciones de Prisma con retry
export const withPrismaRetry = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries = 3,
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      console.error(
        `❌ ${operationName} failed (attempt ${attempt}/${maxRetries}):`,
        error,
      )

      if (attempt === maxRetries) {
        throw error
      }

      // Verificar si es un error de conexión
      const shouldRetry = await handlePrismaError(error, operationName)
      if (!shouldRetry) {
        throw error
      }

      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }

  throw new Error(`Failed to execute ${operationName} after ${maxRetries} attempts`)
}

// Exportar configuración
export default {
  testPrisma,
  reconnectPrisma,
  clearTestDatabaseWithRetry,
  forceClearDatabase,
  checkPrismaConnection,
  setupTestDatabase,
  cleanupTestDatabase,
  handlePrismaError,
  withPrismaRetry,
}
