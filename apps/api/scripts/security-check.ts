#!/usr/bin/env tsx

/**
 * 🔐 SECURITY INTEGRITY CHECK SCRIPT
 *
 * This script runs the security integrity check to ensure all security
 * implementations are working correctly
 */

import { PrismaClient } from '@prisma/client'
import {
  generateSecurityReport,
  runSecurityIntegrityCheck,
} from '../src/utils/security-integrity-check.js'

async function main() {
  // Starting Security Integrity Check

  try {
    // Initialize Prisma
    const prisma = new PrismaClient()

    // Test database connection
    await prisma.$connect()
    // Database connection successful

    // Run security check
    // Running security integrity check
    const report = await runSecurityIntegrityCheck(prisma)

    // Display results
    // SECURITY CHECK RESULTS
    // Overall Score and Compliance Status
    // Timestamp

    // DETAILED CHECKS
    // Check status and details

    if (report.recommendations.length > 0) {
      // RECOMMENDATIONS
      // Recommendation items
    }

    // Generate full report
    // Generating full security report
    await generateSecurityReport(prisma)
    // Full report generated

    // Close database connection
    await prisma.$disconnect()

    // Exit with appropriate code
    if (report.isCompliant) {
      // Security check completed successfully! System is compliant.
      process.exit(0)
    } else {
      // Security check completed with issues. Review recommendations above.
      process.exit(1)
    }
  } catch (error) {
    console.error('\n❌ Security check failed with error:', error)
    process.exit(1)
  }
}

// Run the script
main().catch(console.error)
