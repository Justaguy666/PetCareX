-- =====================================================
-- BOOTSTRAP DATABASE (RUN ONCE)
-- =====================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: schema_migrations
-- Purpose: track executed migration files
-- =====================================================
CREATE TABLE IF NOT EXISTS schema_migrations (
    version        VARCHAR(255) PRIMARY KEY,
    executed_at    TIMESTAMP DEFAULT now()
);

-- Index for ordering
CREATE INDEX IF NOT EXISTS idx_schema_migrations_executed_at
ON schema_migrations (executed_at);
