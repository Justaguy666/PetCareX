-- ========================================================================
-- Migration: 003-optimizations.sql (down)
-- Description: Rollback for optimizations (indexes/partitions)
-- ========================================================================

-- Note: `up` file currently contains no indexes or partitions.
-- Add DROP INDEX IF EXISTS / DROP TABLE ... PARTITION commands here
-- if you later add indexes or partitions in the corresponding `up` migration.

-- Example (uncomment and adjust names when needed):
-- DROP INDEX IF EXISTS idx_some_table_some_column;
-- ALTER TABLE some_table DETACH PARTITION some_table_p2019;
-- DROP TABLE IF EXISTS some_table_p2019;

-- No-op placeholder to keep migration ordering consistent
SELECT 1;
