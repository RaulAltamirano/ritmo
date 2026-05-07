/**
 * 🧪 LOGGER DEMONSTRATION SCRIPT
 *
 * This script demonstrates all the features of the RitmoLogger
 * Run with: npm run logger:demo
 */

import { createPerformanceMonitor, ritmoLogger } from '../src/core/utils/logger.js'

async function demonstrateLogger() {
  console.log('🚀 RITMO LOGGER DEMONSTRATION')
  console.log('='.repeat(50))

  // =============================================================================
  // BASIC LOGGING
  // =============================================================================

  console.log('\n📝 Basic Logging Examples:')

  ritmoLogger.info('Application started successfully')
  ritmoLogger.warn('This is a warning message')
  ritmoLogger.error('This is an error message')
  ritmoLogger.debug('This is a debug message')

  // =============================================================================
  // CONTEXTUAL LOGGING
  // =============================================================================

  console.log('\n🔗 Contextual Logging Examples:')

  const userContext = {
    userId: 'user-123',
    sessionId: 'session-456',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  }

  ritmoLogger
    .setContext(userContext)
    .info('User logged in successfully')
    .security('Login attempt', 'low')
    .auth('User authentication', true)

  // =============================================================================
  // PERFORMANCE MONITORING
  // =============================================================================

  console.log('\n⚡ Performance Monitoring Examples:')

  const performanceMonitor = createPerformanceMonitor(ritmoLogger)

  // Simulate a database operation
  const dbOperation = performanceMonitor('Database Query')
  await new Promise(resolve => setTimeout(resolve, 150)) // Simulate 150ms delay
  dbOperation.end({ table: 'users', query: 'SELECT * FROM users WHERE id = ?' })

  // Simulate a slow operation
  const slowOperation = performanceMonitor('Slow API Call')
  await new Promise(resolve => setTimeout(resolve, 1200)) // Simulate 1.2s delay
  slowOperation.end({ endpoint: '/api/analytics', reason: 'Complex aggregation' })

  // =============================================================================
  // SECURITY LOGGING
  // =============================================================================

  console.log('\n🔐 Security Logging Examples:')

  ritmoLogger.security('Failed login attempt', 'medium', {
    ip: '192.168.1.100',
    username: 'test@example.com',
    reason: 'Invalid password',
  })

  ritmoLogger.security('Suspicious activity detected', 'high', {
    userId: 'user-123',
    activity: 'Multiple failed login attempts',
    ip: '192.168.1.100',
  })

  ritmoLogger.security('Admin action performed', 'low', {
    adminId: 'admin-456',
    action: 'User account suspension',
    targetUserId: 'user-789',
  })

  // =============================================================================
  // BUSINESS LOGGING
  // =============================================================================

  console.log('\n💼 Business Logging Examples:')

  ritmoLogger.business('User registration completed', {
    userId: 'user-123',
    email: 'user@example.com',
    plan: 'premium',
  })

  ritmoLogger.business('Payment processed', {
    userId: 'user-123',
    amount: 29.99,
    currency: 'USD',
    paymentMethod: 'credit_card',
  })

  // =============================================================================
  // ERROR LOGGING WITH STACK TRACES
  // =============================================================================

  console.log('\n❌ Error Logging Examples:')

  try {
    throw new Error('This is a simulated error for demonstration')
  } catch (error) {
    ritmoLogger.error('An error occurred during processing', error as Error, {
      operation: 'data_processing',
      userId: 'user-123',
    })
  }

  // =============================================================================
  // CHILD LOGGERS
  // =============================================================================

  console.log('\n👶 Child Logger Examples:')

  const authLogger = ritmoLogger.child({
    module: 'authentication',
    version: '2.0',
  })

  authLogger.info('Authentication module initialized')
  authLogger.auth('Token validation', true, { tokenType: 'access' })

  const dbLogger = ritmoLogger.child({
    module: 'database',
    connection: 'primary',
  })

  dbLogger.database('User query', 45, { table: 'users', operation: 'SELECT' })

  // =============================================================================
  // HTTP LOGGING
  // =============================================================================

  console.log('\n🌐 HTTP Logging Examples:')

  ritmoLogger.http('GET /api/users/123', {
    statusCode: 200,
    duration: 45,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })

  ritmoLogger.http('POST /api/auth/login', {
    statusCode: 401,
    duration: 120,
    userAgent: 'PostmanRuntime/7.32.3',
  })

  // =============================================================================
  // VERBOSE LOGGING
  // =============================================================================

  console.log('\n🔍 Verbose Logging Examples:')

  ritmoLogger.verbose('Detailed operation information', {
    step: 'data_validation',
    field: 'email',
    value: 'user@example.com',
    validation: 'passed',
  })

  // =============================================================================
  // COMPLETION
  // =============================================================================

  console.log('\n✅ Logger demonstration completed!')
  console.log('📁 Check the logs directory for generated log files')
  console.log('🎨 In development, you should see colored console output')
  console.log('📊 In production, logs will be written to files with rotation')

  console.log('\n📋 Log files created:')
  console.log('  - logs/combined/combined-YYYY-MM-DD.log')
  console.log('  - logs/error/error-YYYY-MM-DD.log')
  console.log('  - logs/access/access-YYYY-MM-DD.log')
  console.log('  - logs/security/security-YYYY-MM-DD.log')
  console.log('  - logs/performance/performance-YYYY-MM-DD.log')
}

// Run the demonstration
demonstrateLogger().catch(error => {
  console.error('❌ Error during logger demonstration:', error)
  process.exit(1)
})
