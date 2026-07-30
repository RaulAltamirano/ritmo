-- Deduplicate categories per (userId, name): keep oldest non-deleted (else oldest).
-- Retarget tasks from duplicate rows, then delete duplicates.

WITH ranked AS (
  SELECT
    id,
    "userId",
    name,
    ROW_NUMBER() OVER (
      PARTITION BY "userId", name
      ORDER BY "isDeleted" ASC, "createdAt" ASC, id ASC
    ) AS rn
  FROM "categories"
),
dupes AS (
  SELECT
    r.id AS dupe_id,
    k.id AS keep_id
  FROM ranked r
  JOIN ranked k
    ON k."userId" = r."userId"
   AND k.name = r.name
   AND k.rn = 1
  WHERE r.rn > 1
)
UPDATE "tasks" t
SET "categoryId" = d.keep_id
FROM dupes d
WHERE t."categoryId" = d.dupe_id;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "userId", name
      ORDER BY "isDeleted" ASC, "createdAt" ASC, id ASC
    ) AS rn
  FROM "categories"
)
DELETE FROM "categories"
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- CreateUniqueIndex
CREATE UNIQUE INDEX "categories_userId_name_key" ON "categories"("userId", "name");
