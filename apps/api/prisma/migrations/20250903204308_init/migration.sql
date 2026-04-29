-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('active', 'inactive', 'suspended', 'banned', 'pending_verification');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('user', 'premium', 'admin', 'moderator');

-- CreateEnum
CREATE TYPE "public"."Theme" AS ENUM ('light', 'dark', 'system');

-- CreateEnum
CREATE TYPE "public"."DeviceType" AS ENUM ('desktop', 'mobile', 'tablet', 'tv', 'wearable', 'other');

-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('work', 'study', 'exercise', 'social', 'personal', 'health', 'learning', 'creative', 'other');

-- CreateEnum
CREATE TYPE "public"."ActivityStatus" AS ENUM ('planned', 'active', 'paused', 'completed', 'cancelled', 'archived');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('todo', 'in_progress', 'review', 'completed', 'cancelled', 'archived');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('low', 'medium', 'high', 'urgent', 'critical');

-- CreateEnum
CREATE TYPE "public"."SecurityEventType" AS ENUM ('login_success', 'login_failed', 'logout', 'register', 'password_change', 'password_reset_request', 'password_reset_complete', 'two_factor_enabled', 'two_factor_disabled', 'two_factor_verification', 'backup_code_used', 'session_created', 'session_expired', 'session_revoked', 'session_suspicious', 'token_refreshed', 'token_revoked', 'token_expired', 'token_not_found', 'token_reuse_attack', 'suspicious_activity', 'session_info', 'session_limit_enforced', 'brute_force_attempt', 'account_locked', 'account_unlocked', 'email_verified', 'phone_verified', 'device_validation_attempt', 'device_validation_success', 'device_validation_failed', 'device_challenge_generated', 'device_anomaly_detected', 'profile_updated', 'security_settings_changed', 'privacy_settings_changed', 'admin_action', 'system_event');

-- CreateEnum
CREATE TYPE "public"."SecuritySeverity" AS ENUM ('info', 'low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "public"."CircadianPhaseType" AS ENUM ('slow_activation', 'morning_focus_peak', 'cognitive_peak', 'second_productivity', 'creative_window', 'transition', 'introspective', 'sleep_preparation');

-- CreateEnum
CREATE TYPE "public"."CircadianPhaseCategory" AS ENUM ('activation', 'performance', 'creative', 'reflection', 'rest');

-- CreateEnum
CREATE TYPE "public"."CircadianPhasePriority" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "public"."CircadianPhaseStatus" AS ENUM ('active', 'upcoming', 'completed', 'inactive');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    "displayName" VARCHAR(150),
    "avatar" TEXT,
    "bio" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "phone" VARCHAR(20),
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "isTwoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" VARCHAR(255),
    "backupCodes" TEXT[],
    "status" "public"."UserStatus" NOT NULL DEFAULT 'active',
    "role" "public"."UserRole" NOT NULL DEFAULT 'user',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'UTC',
    "language" VARCHAR(10) NOT NULL DEFAULT 'es',
    "locale" VARCHAR(10) NOT NULL DEFAULT 'es-ES',
    "theme" "public"."Theme" NOT NULL DEFAULT 'system',
    "lastLoginAt" TIMESTAMP(3),
    "lastPasswordChange" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationSettings" JSONB,
    "privacySettings" JSONB,
    "accessibilitySettings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_notification_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "marketing" BOOLEAN NOT NULL DEFAULT false,
    "security" BOOLEAN NOT NULL DEFAULT true,
    "updates" BOOLEAN NOT NULL DEFAULT true,
    "weeklyDigest" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."password_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_verification_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."phone_verification_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phone_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" VARCHAR(255) NOT NULL,
    "deviceId" VARCHAR(255),
    "deviceName" VARCHAR(255),
    "deviceType" "public"."DeviceType" NOT NULL,
    "browser" VARCHAR(100),
    "browserVersion" VARCHAR(50),
    "os" VARCHAR(100),
    "osVersion" VARCHAR(50),
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "country" VARCHAR(100),
    "region" VARCHAR(100),
    "city" VARCHAR(100),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "timezone" VARCHAR(50),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTrusted" BOOLEAN NOT NULL DEFAULT false,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" VARCHAR(255) NOT NULL,
    "sessionId" VARCHAR(255),
    "familyId" VARCHAR(255) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."security_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" VARCHAR(255),
    "eventType" "public"."SecurityEventType" NOT NULL,
    "eventDescription" TEXT NOT NULL,
    "severity" "public"."SecuritySeverity" NOT NULL DEFAULT 'info',
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "country" VARCHAR(100),
    "region" VARCHAR(100),
    "city" VARCHAR(100),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "timezone" VARCHAR(50),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" "public"."ActivityType" NOT NULL,
    "status" "public"."ActivityStatus" NOT NULL DEFAULT 'active',
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "estimatedDuration" INTEGER,
    "priority" "public"."Priority" NOT NULL DEFAULT 'medium',
    "tags" TEXT[],
    "categoryId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tasks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityId" TEXT,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'todo',
    "priority" "public"."Priority" NOT NULL DEFAULT 'medium',
    "estimatedDuration" INTEGER,
    "actualDuration" INTEGER,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "tags" TEXT[],
    "categoryId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "color" VARCHAR(7),
    "icon" VARCHAR(50),
    "parentId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."work_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityId" TEXT,
    "taskId" TEXT,
    "circadianPhaseId" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "focusScore" INTEGER,
    "productivityScore" INTEGER,
    "notes" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "work_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."circadian_phases" (
    "id" TEXT NOT NULL,
    "type" "public"."CircadianPhaseType" NOT NULL,
    "category" "public"."CircadianPhaseCategory" NOT NULL,
    "priority" "public"."CircadianPhasePriority" NOT NULL DEFAULT 'medium',
    "startHour" INTEGER NOT NULL,
    "endHour" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "keyword" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "idealFor" TEXT NOT NULL,
    "color" VARCHAR(7) NOT NULL,
    "icon" VARCHAR(50) NOT NULL,
    "emoji" VARCHAR(10) NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isIntuitive" BOOLEAN NOT NULL DEFAULT true,
    "scientificReferences" TEXT[],
    "evidenceLevel" VARCHAR(20) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "circadian_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."circadian_phase_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "customStartHour" INTEGER,
    "customEndHour" INTEGER,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "notificationType" VARCHAR(20) NOT NULL,
    "autoTaskScheduling" BOOLEAN NOT NULL DEFAULT false,
    "preferredTaskTypes" TEXT[],
    "averageProductivityScore" DOUBLE PRECISION,
    "totalSessionsInPhase" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "circadian_phase_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."circadian_phase_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "productivityScore" INTEGER,
    "focusScore" INTEGER,
    "energyLevel" INTEGER,
    "activitiesCompleted" INTEGER NOT NULL DEFAULT 0,
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "mood" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "circadian_phase_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE INDEX "users_email_isActive_idx" ON "public"."users"("email", "isActive");

-- CreateIndex
CREATE INDEX "users_username_isActive_idx" ON "public"."users"("username", "isActive");

-- CreateIndex
CREATE INDEX "users_status_isActive_idx" ON "public"."users"("status", "isActive");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "public"."users"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "public"."user_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "email_notification_settings_userId_key" ON "public"."email_notification_settings"("userId");

-- CreateIndex
CREATE INDEX "password_history_userId_createdAt_idx" ON "public"."password_history"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_tokenHash_key" ON "public"."email_verification_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "email_verification_tokens_userId_isUsed_idx" ON "public"."email_verification_tokens"("userId", "isUsed");

-- CreateIndex
CREATE INDEX "email_verification_tokens_expiresAt_idx" ON "public"."email_verification_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "phone_verification_tokens_tokenHash_key" ON "public"."phone_verification_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "phone_verification_tokens_userId_isUsed_idx" ON "public"."phone_verification_tokens"("userId", "isUsed");

-- CreateIndex
CREATE INDEX "phone_verification_tokens_expiresAt_idx" ON "public"."phone_verification_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "public"."password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_isUsed_idx" ON "public"."password_reset_tokens"("userId", "isUsed");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expiresAt_idx" ON "public"."password_reset_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_sessionId_key" ON "public"."user_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "user_sessions_userId_isActive_idx" ON "public"."user_sessions"("userId", "isActive");

-- CreateIndex
CREATE INDEX "user_sessions_sessionId_idx" ON "public"."user_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "user_sessions_expiresAt_idx" ON "public"."user_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "user_sessions_deviceId_idx" ON "public"."user_sessions"("deviceId");

-- CreateIndex
CREATE INDEX "user_sessions_userId_deviceId_isActive_idx" ON "public"."user_sessions"("userId", "deviceId", "isActive");

-- CreateIndex
CREATE INDEX "user_sessions_isActive_expiresAt_idx" ON "public"."user_sessions"("isActive", "expiresAt");

-- CreateIndex
CREATE INDEX "user_sessions_lastActivity_idx" ON "public"."user_sessions"("lastActivity");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "public"."refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_isRevoked_idx" ON "public"."refresh_tokens"("userId", "isRevoked");

-- CreateIndex
CREATE INDEX "refresh_tokens_familyId_idx" ON "public"."refresh_tokens"("familyId");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "public"."refresh_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "security_logs_userId_eventType_idx" ON "public"."security_logs"("userId", "eventType");

-- CreateIndex
CREATE INDEX "security_logs_eventType_createdAt_idx" ON "public"."security_logs"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "security_logs_severity_createdAt_idx" ON "public"."security_logs"("severity", "createdAt");

-- CreateIndex
CREATE INDEX "security_logs_ipAddress_createdAt_idx" ON "public"."security_logs"("ipAddress", "createdAt");

-- CreateIndex
CREATE INDEX "activities_userId_status_idx" ON "public"."activities"("userId", "status");

-- CreateIndex
CREATE INDEX "activities_userId_startTime_idx" ON "public"."activities"("userId", "startTime");

-- CreateIndex
CREATE INDEX "activities_categoryId_idx" ON "public"."activities"("categoryId");

-- CreateIndex
CREATE INDEX "activities_type_status_idx" ON "public"."activities"("type", "status");

-- CreateIndex
CREATE INDEX "tasks_userId_status_idx" ON "public"."tasks"("userId", "status");

-- CreateIndex
CREATE INDEX "tasks_userId_dueDate_idx" ON "public"."tasks"("userId", "dueDate");

-- CreateIndex
CREATE INDEX "tasks_activityId_idx" ON "public"."tasks"("activityId");

-- CreateIndex
CREATE INDEX "tasks_categoryId_idx" ON "public"."tasks"("categoryId");

-- CreateIndex
CREATE INDEX "categories_userId_parentId_idx" ON "public"."categories"("userId", "parentId");

-- CreateIndex
CREATE INDEX "categories_userId_isDeleted_idx" ON "public"."categories"("userId", "isDeleted");

-- CreateIndex
CREATE INDEX "work_sessions_userId_startTime_idx" ON "public"."work_sessions"("userId", "startTime");

-- CreateIndex
CREATE INDEX "work_sessions_activityId_idx" ON "public"."work_sessions"("activityId");

-- CreateIndex
CREATE INDEX "work_sessions_taskId_idx" ON "public"."work_sessions"("taskId");

-- CreateIndex
CREATE INDEX "work_sessions_circadianPhaseId_idx" ON "public"."work_sessions"("circadianPhaseId");

-- CreateIndex
CREATE INDEX "circadian_phases_type_idx" ON "public"."circadian_phases"("type");

-- CreateIndex
CREATE INDEX "circadian_phases_category_idx" ON "public"."circadian_phases"("category");

-- CreateIndex
CREATE INDEX "circadian_phases_startHour_idx" ON "public"."circadian_phases"("startHour");

-- CreateIndex
CREATE INDEX "circadian_phases_isActive_idx" ON "public"."circadian_phases"("isActive");

-- CreateIndex
CREATE INDEX "circadian_phases_sortOrder_idx" ON "public"."circadian_phases"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "circadian_phases_type_key" ON "public"."circadian_phases"("type");

-- CreateIndex
CREATE INDEX "circadian_phase_preferences_userId_idx" ON "public"."circadian_phase_preferences"("userId");

-- CreateIndex
CREATE INDEX "circadian_phase_preferences_phaseId_idx" ON "public"."circadian_phase_preferences"("phaseId");

-- CreateIndex
CREATE UNIQUE INDEX "circadian_phase_preferences_userId_phaseId_key" ON "public"."circadian_phase_preferences"("userId", "phaseId");

-- CreateIndex
CREATE INDEX "circadian_phase_sessions_userId_startTime_idx" ON "public"."circadian_phase_sessions"("userId", "startTime");

-- CreateIndex
CREATE INDEX "circadian_phase_sessions_phaseId_idx" ON "public"."circadian_phase_sessions"("phaseId");

-- CreateIndex
CREATE INDEX "circadian_phase_sessions_startTime_idx" ON "public"."circadian_phase_sessions"("startTime");

-- AddForeignKey
ALTER TABLE "public"."user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_notification_settings" ADD CONSTRAINT "email_notification_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."password_history" ADD CONSTRAINT "password_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."phone_verification_tokens" ADD CONSTRAINT "phone_verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."security_logs" ADD CONSTRAINT "security_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_sessions" ADD CONSTRAINT "work_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_sessions" ADD CONSTRAINT "work_sessions_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_sessions" ADD CONSTRAINT "work_sessions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_sessions" ADD CONSTRAINT "work_sessions_circadianPhaseId_fkey" FOREIGN KEY ("circadianPhaseId") REFERENCES "public"."circadian_phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."circadian_phase_preferences" ADD CONSTRAINT "circadian_phase_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."circadian_phase_preferences" ADD CONSTRAINT "circadian_phase_preferences_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "public"."circadian_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."circadian_phase_sessions" ADD CONSTRAINT "circadian_phase_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."circadian_phase_sessions" ADD CONSTRAINT "circadian_phase_sessions_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "public"."circadian_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
