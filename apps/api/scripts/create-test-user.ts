#!/usr/bin/env tsx

/**
 * 🧪 CREATE TEST USER SCRIPT
 * Creates a test user for authentication testing
 */

import * as bcrypt from 'bcryptjs'
import prisma from '../src/core/database/prisma.js'

async function createTestUser() {
  try {
    console.log('🔧 Creating test user...')

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    })

    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.email)
      return existingUser
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 12)

    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        timezone: 'UTC',
        language: 'en',
        status: 'active',
        role: 'user',
        isEmailVerified: true,
        isActive: true,
      },
    })

    console.log('✅ Test user created successfully:', user.email)
    console.log('📧 Email:', user.email)
    console.log('🔑 Password: TestPassword123!')

    return user
  } catch (error) {
    console.error('❌ Error creating test user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createTestUser()
  .then(() => {
    console.log('🎉 Test user creation completed')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Test user creation failed:', error)
    process.exit(1)
  })
