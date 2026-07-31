-- Add the `on_break` state to WorkSessionState.
-- NOTE: PostgreSQL forbids using a newly added enum value in the same
-- transaction that adds it, so this ALTER TYPE lives in its own migration.
-- The partial unique index that references 'on_break' is created in the
-- following migration (20260731090100_work_session_break_fields).
ALTER TYPE "WorkSessionState" ADD VALUE IF NOT EXISTS 'on_break';
