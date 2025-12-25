-- Migration: Convert usageMB from bytes to MB
-- This fixes historical data stored as bytes

-- Convert User table
UPDATE "User"
SET "usageMB" = "usageMB" / (1024.0 * 1024.0)
WHERE "usageMB" > 10;  -- Only convert values that are clearly in bytes (> 10MB would be impossible)

-- Convert Visitor table
UPDATE "Visitor"
SET "usageMB" = "usageMB" / (1024.0 * 1024.0)
WHERE "usageMB" > 10;  -- Only convert values that are clearly in bytes

-- Verify the changes
SELECT 'User' as table_name, COUNT(*) as converted_count
FROM "User"
WHERE "usageMB" > 0 AND "usageMB" < 10
UNION ALL
SELECT 'Visitor' as table_name, COUNT(*) as converted_count
FROM "Visitor"
WHERE "usageMB" > 0 AND "usageMB" < 10;
