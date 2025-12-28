-- ========================================================================
-- Migration DOWN: 004-functions.sql
-- Description: Drop functions created in up/004-functions.sql
-- ========================================================================

BEGIN;

-- Drop appointment helper
DROP FUNCTION IF EXISTS fn_create_appointment(BIGINT, BIGINT, BIGINT, BIGINT, TIMESTAMPTZ) CASCADE;

-- Drop appointment statistics
DROP FUNCTION IF EXISTS fn_statistic_appointments_by_branch(BIGINT) CASCADE;
DROP FUNCTION IF EXISTS fn_statistic_appointments_all() CASCADE;

-- Drop doctor/branch statistics
DROP FUNCTION IF EXISTS fn_statistics_doctors_revenue() CASCADE;
DROP FUNCTION IF EXISTS fn_statistics_branches_revenue() CASCADE;

-- Drop product revenue statistics
DROP FUNCTION IF EXISTS fn_statistics_products_revenue_by_branch(BIGINT) CASCADE;
DROP FUNCTION IF EXISTS fn_statistics_products_revenue_all() CASCADE;

-- Drop buy product function
DROP FUNCTION IF EXISTS fn_buy_product(BIGINT, BIGINT, JSONB, payment_method) CASCADE;

-- Drop exam record function (both versions)
DROP FUNCTION IF EXISTS fn_create_exam_record(BIGINT, BIGINT, TEXT, TEXT, TIMESTAMPTZ) CASCADE;
DROP FUNCTION IF EXISTS fn_create_exam_record(BIGINT, BIGINT, TEXT, TEXT) CASCADE;

COMMIT;
