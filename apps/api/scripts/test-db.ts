#!/usr/bin/env tsx

/**
 * 🧪 TEST DATABASE SETUP SCRIPT
 *
 * Script para configurar y limpiar la base de datos de tests
 * Asegura que siempre esté en un estado limpio y consistente
 */

import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5434/ritmo_test'

const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: TEST_DATABASE_URL,
    },
  },
})

async function setupTestDatabase() {
  try {
    console.log('🔧 Setting up test database...')

    // Conectar a la base de datos
    await testPrisma.$connect()
    console.log('✅ Database connection established')

    // Ejecutar migraciones
    console.log('🔄 Running migrations...')
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
      stdio: 'inherit',
    })

    // Limpiar completamente la base de datos
    console.log('🧹 Cleaning database...')
    await clearDatabase()

    console.log('✅ Test database setup complete')
  } catch (error) {
    console.error('❌ Failed to setup test database:', error)
    process.exit(1)
  } finally {
    await testPrisma.$disconnect()
  }
}

async function clearDatabase() {
  try {
    // Usar transacción para limpieza atómica
    await testPrisma.$transaction(async tx => {
      // 1. Limpiar tablas de seguridad y tokens
      await tx.securityLog.deleteMany()
      await tx.refreshToken.deleteMany()
      await tx.passwordResetToken.deleteMany()

      // 2. Limpiar sesiones
      await tx.userSession.deleteMany()
      await tx.workSession.deleteMany()
      await tx.circadianPhaseSession.deleteMany()

      // 3. Limpiar datos de negocio
      await tx.task.deleteMany()
      await tx.activity.deleteMany()
      await tx.circadianPhasePreference.deleteMany()
      await tx.circadianPhase.deleteMany()
      await tx.category.deleteMany()

      // 4. Limpiar usuarios
      await tx.user.deleteMany()
    })

    console.log('✅ Database cleared successfully')
  } catch (error) {
    console.error('❌ Failed to clear database:', error)

    // Fallback: usar SQL directo
    try {
      console.log('🔄 Attempting forced cleanup...')
      await testPrisma.$executeRaw`TRUNCATE TABLE security_logs, refresh_tokens, password_reset_tokens, user_sessions, work_sessions, circadian_phase_sessions, tasks, activities, circadian_phase_preferences, circadian_phases, categories, users CASCADE`
      console.log('✅ Forced cleanup completed')
    } catch (fallbackError) {
      console.error('❌ Forced cleanup also failed:', fallbackError)
      throw fallbackError
    }
  }
}

async function resetDatabase() {
  try {
    console.log('🔄 Resetting test database...')
    await clearDatabase()
    console.log('✅ Database reset complete')
  } catch (error) {
    console.error('❌ Failed to reset database:', error)
    process.exit(1)
  } finally {
    await testPrisma.$disconnect()
  }
}

// Manejar argumentos de línea de comandos
const command = process.argv[2]

switch (command) {
  case 'setup':
    await setupTestDatabase()
    break
  case 'reset':
    await resetDatabase()
    break
  case 'clear':
    await clearDatabase()
    break
  default:
    console.log('Usage: tsx scripts/test-db.ts [setup|reset|clear]')
    console.log('  setup: Setup database with migrations and clear data')
    console.log('  reset: Clear all data from database')
    console.log('  clear: Clear all data from database')
    process.exit(1)
}
