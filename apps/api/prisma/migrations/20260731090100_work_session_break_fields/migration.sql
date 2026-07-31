-- Break timing fields for the focus -> break -> reflection cycle.
ALTER TABLE "work_sessions" ADD COLUMN IF NOT EXISTS "breakStartedAt" TIMESTAMP(3);
ALTER TABLE "work_sessions" ADD COLUMN IF NOT EXISTS "breakPausedDurationSec" INTEGER NOT NULL DEFAULT 0;

-- Recreate the partial unique "one active session per user" index so that
-- `on_break` counts as an active (non-terminal) state. Runs in a separate
-- migration from the ALTER TYPE so the new enum value is already committed.
DROP INDEX IF EXISTS "work_sessions_active_per_user";
CREATE UNIQUE INDEX "work_sessions_active_per_user"
  ON "work_sessions" ("userId")
  WHERE "isDeleted" = false
    AND "state" IN ('running', 'paused', 'on_break', 'pending_feedback');
