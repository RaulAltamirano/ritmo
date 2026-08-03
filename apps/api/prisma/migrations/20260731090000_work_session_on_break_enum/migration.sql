/**
 * Soft-delete a failed migration's ALTER TYPE so fresh DBs work when
 * WorkSessionState was never created by init (schema drift / db push era).
 * If the type already exists, only ensure `on_break` is present.
 */
DO $$
BEGIN
  CREATE TYPE "WorkSessionState" AS ENUM (
    'running',
    'paused',
    'on_break',
    'pending_feedback',
    'completed',
    'abandoned'
  );
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END
$$;

ALTER TYPE "WorkSessionState" ADD VALUE IF NOT EXISTS 'on_break';
