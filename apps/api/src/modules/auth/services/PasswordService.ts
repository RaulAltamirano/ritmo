/**
 * 🔑 PASSWORD SERVICE - RITMO API 2025
 *
 * Servicio para gestión de contraseñas
 * Maneja reset, cambio y verificación de contraseñas
 */

import * as bcrypt from 'bcryptjs'
import * as crypto from 'crypto'
import { AuthValidator } from '../../../api/validators/validation.system.js'
import prisma from '../../../core/database/prisma.js'
import {
  AuthenticationException,
  ValidationException,
} from '../../../shared/exceptions/app.exceptions.js'
import {
  PasswordChangeDTO,
  PasswordResetDTO,
  PasswordResetRequestDTO,
} from '../dto/AuthDTOs.js'

export class PasswordService {
  private readonly SALT_ROUNDS = 15

  async requestPasswordReset(emailData: PasswordResetRequestDTO): Promise<void> {
    // Validate input
    const validatedData = AuthValidator.passwordResetRequestSchema.parse(emailData)

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (!user) {
      // Don't reveal if user exists
      return
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')

    // Store reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    })

    // TODO: Send email with reset token
    console.log(`Password reset token for ${user.email}: ${resetToken}`)
  }

  async resetPassword(resetData: PasswordResetDTO): Promise<void> {
    // Validate input
    const validatedData = AuthValidator.passwordResetSchema.parse(resetData)

    const tokenHash = crypto
      .createHash('sha256')
      .update(validatedData.token)
      .digest('hex')

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!resetToken) {
      throw new ValidationException('Password reset token is invalid or has expired')
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(validatedData.password, this.SALT_ROUNDS)

    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash: newPasswordHash,
        lastPasswordChange: new Date(),
      },
    })

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { isUsed: true },
    })
  }

  async changePassword(userId: string, passwordData: PasswordChangeDTO): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      passwordData.currentPassword,
      user.passwordHash,
    )
    if (!isCurrentPasswordValid) {
      throw new AuthenticationException('Current password is incorrect')
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(
      passwordData.newPassword,
      this.SALT_ROUNDS,
    )

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        lastPasswordChange: new Date(),
      },
    })
  }
}
