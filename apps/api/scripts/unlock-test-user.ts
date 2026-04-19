#!/usr/bin/env tsx

/**
 * 🔓 UNLOCK TEST USER SCRIPT
 * Unlocks the test user account
 */

import prisma from '../src/core/database/prisma.js'

async function unlockTestUser() {
  try {
    console.log('🔓 Unlocking test user...')

    const user = await prisma.user.update({
      where: { email: 'test@example.com' },
      data: {
        lockedUntil: null,
        failedLoginAttempts: 0,
      },
    })

    console.log('✅ Test user unlocked successfully:', user.email)

    return user
  } catch (error) {
    console.error('❌ Error unlocking test user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
unlockTestUser()
  .then(() => {
    console.log('🎉 Test user unlock completed')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Test user unlock failed:', error)
    process.exit(1)
  })
