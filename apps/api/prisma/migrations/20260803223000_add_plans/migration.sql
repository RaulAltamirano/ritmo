-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('planned', 'active', 'paused', 'completed');

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "planId" TEXT;

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "PlanStatus" NOT NULL DEFAULT 'planned',
    "color" VARCHAR(7),
    "icon" VARCHAR(50),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plans_userId_isDeleted_idx" ON "plans"("userId", "isDeleted");

-- CreateIndex
CREATE INDEX "plans_userId_status_idx" ON "plans"("userId", "status");

-- CreateIndex
CREATE INDEX "tasks_planId_idx" ON "tasks"("planId");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
