#!/usr/bin/env tsx

/**
 * 🔍 TEST REFRESH TOKEN AND SESSIONS
 * Comprehensive test to verify refresh token and session management
 */

import prisma from '../src/core/database/prisma.js'

async function testRefreshTokenAndSessions() {
  try {
    console.log('🔍 Testing Refresh Token and Sessions...\n')

    // 1. Check if test user exists
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    })

    if (!user) {
      console.log('❌ Test user not found. Please run create-test-user.ts first.')
      return
    }

    console.log('✅ Test user found:', user.email)

    // 2. Check active sessions
    const activeSessions = await prisma.userSession.findMany({
      where: {
        userId: user.id,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    })

    console.log(`📊 Active sessions: ${activeSessions.length}`)
    activeSessions.forEach((session, index) => {
      console.log(`  Session ${index + 1}:`)
      console.log(`    - Session ID: ${session.sessionId}`)
      console.log(
        `    - Device: ${session.deviceName ?? 'Unknown'} (${session.deviceType})`,
      )
      console.log(`    - Browser: ${session.browser ?? 'Unknown'}`)
      console.log(`    - IP: ${session.ipAddress ?? 'Unknown'}`)
      console.log(`    - Last Activity: ${session.lastActivity}`)
      console.log(`    - Expires: ${session.expiresAt}`)
      console.log(`    - Trusted: ${session.isTrusted}`)
    })

    // 3. Check refresh tokens
    const refreshTokens = await prisma.refreshToken.findMany({
      where: {
        userId: user.id,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    })

    console.log(`\n🔑 Active refresh tokens: ${refreshTokens.length}`)
    refreshTokens.forEach((token, index) => {
      console.log(`  Token ${index + 1}:`)
      console.log(`    - Family ID: ${token.familyId}`)
      console.log(`    - Session ID: ${token.sessionId ?? 'None'}`)
      console.log(`    - Expires: ${token.expiresAt}`)
      console.log(`    - Created: ${token.createdAt}`)
    })

    // 4. Check for orphaned sessions or tokens
    const orphanedSessions = await prisma.userSession.findMany({
      where: {
        userId: user.id,
        isActive: true,
        expiresAt: { gt: new Date() },
        sessionId: {
          notIn: refreshTokens.map(t => t.sessionId).filter(Boolean),
        },
      },
    })

    const orphanedTokens = await prisma.refreshToken.findMany({
      where: {
        userId: user.id,
        isRevoked: false,
        expiresAt: { gt: new Date() },
        sessionId: {
          notIn: activeSessions.map(s => s.sessionId),
        },
      },
    })

    console.log(`\n⚠️  Orphaned sessions: ${orphanedSessions.length}`)
    console.log(`⚠️  Orphaned tokens: ${orphanedTokens.length}`)

    // 5. Summary
    console.log('\n📋 SUMMARY:')
    console.log(`  - User: ${user.email} (${user.id})`)
    console.log(`  - Active sessions: ${activeSessions.length}`)
    console.log(`  - Active refresh tokens: ${refreshTokens.length}`)
    console.log(`  - Orphaned sessions: ${orphanedSessions.length}`)
    console.log(`  - Orphaned tokens: ${orphanedTokens.length}`)

    // 6. Analysis
    console.log('\n🔍 ANALYSIS:')

    if (activeSessions.length === 0) {
      console.log('❌ No active sessions found. This might indicate:')
      console.log('   - User has not logged in recently')
      console.log('   - Sessions are expiring too quickly')
      console.log('   - Session creation is failing')
    } else {
      console.log('✅ Active sessions found')
    }

    if (refreshTokens.length === 0) {
      console.log('❌ No active refresh tokens found. This might indicate:')
      console.log('   - Refresh tokens are not being created during login')
      console.log('   - Refresh tokens are expiring too quickly')
      console.log('   - Token rotation is not working properly')
    } else {
      console.log('✅ Active refresh tokens found')
    }

    if (orphanedSessions.length > 0) {
      console.log('⚠️  Orphaned sessions found. This might indicate:')
      console.log('   - Sessions without associated refresh tokens')
      console.log('   - Incomplete session cleanup')
    }

    if (orphanedTokens.length > 0) {
      console.log('⚠️  Orphaned tokens found. This might indicate:')
      console.log('   - Refresh tokens without associated sessions')
      console.log('   - Incomplete token cleanup')
    }

    // 7. Recommendations
    console.log('\n💡 RECOMMENDATIONS:')
    if (activeSessions.length > 0 && refreshTokens.length === 0) {
      console.log('   - Check if refresh tokens are being created during login')
      console.log(
        '   - Verify the login endpoint creates both session and refresh token',
      )
    }

    if (activeSessions.length === 0 && refreshTokens.length > 0) {
      console.log('   - Check if sessions are being created during login')
      console.log('   - Verify session expiration settings')
    }

    if (activeSessions.length > 0 && refreshTokens.length > 0) {
      console.log('   - System appears to be working correctly')
      console.log('   - Consider testing the refresh endpoint')
    }
  } catch (error) {
    console.error('❌ Error testing refresh token and sessions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testRefreshTokenAndSessions()
  .then(() => {
    console.log('\n🎉 Test completed')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Test failed:', error)
    process.exit(1)
  })
