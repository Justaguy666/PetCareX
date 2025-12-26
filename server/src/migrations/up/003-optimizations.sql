-- ========================================================================
-- Migration: 003-optimizations.sql
-- Description: Implement database optimizations such as indexes and partitions
-- Note: Only indexes are created here. No schema or logic changes.
-- ========================================================================

-- ========================================================================
--                            >>INDEXES<<
-- ========================================================================

-- ------------------------------------------------------------------------
-- Auth & Token: indexes to speed up lookup and cleanup of refresh tokens
-- - Lookup tokens by user_id (e.g., revoke all tokens for a user)
-- - Cleanup expired tokens by expires_at
-- ------------------------------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_accounts_user_id' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_accounts_user_id ON accounts (user_id);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_accounts_employee_id' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_accounts_employee_id ON accounts (employee_id);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_refresh_tokens_account_id' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_refresh_tokens_account_id ON refresh_tokens (account_id);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_refresh_tokens_expires_at' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);
    END IF;
END
$$;

-- ------------------------------------------------------------------------
-- Appointments: frequent filtering by owner/doctor/branch and time ranges
-- - Support queries: WHERE owner_id = ? ORDER BY appointment_time
-- - Support doctor schedule checks and branch-based queries
-- ------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_appointments_owner_id_appointment_time' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_appointments_owner_id_appointment_time ON appointments (owner_id, appointment_time);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_appointments_doctor_id_appointment_time' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_appointments_doctor_id_appointment_time ON appointments (doctor_id, appointment_time);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_appointments_branch_id_appointment_time' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_appointments_branch_id_appointment_time ON appointments (branch_id, appointment_time);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_appointments_appointment_time' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_appointments_appointment_time ON appointments (appointment_time);
    END IF;
END
$$;

-- ------------------------------------------------------------------------
-- Invoices & Services: support filtering, joins and ordering by created_at
-- - invoices: filter by customer, branch; common listing uses branch + created_at
-- - services: join by invoice_id, filter by type_of_service, order by created_at
-- ------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_invoices_customer_id' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_invoices_customer_id ON invoices (customer_id);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_invoices_branch_id_created_at' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_invoices_branch_id_created_at ON invoices (branch_id, created_at);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_invoices_created_by' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_invoices_created_by ON invoices (created_by);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_invoices_created_at' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_invoices_created_at ON invoices (created_at);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_services_invoice_id' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_services_invoice_id ON services (invoice_id);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_services_type_of_service' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_services_type_of_service ON services (type_of_service);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_services_created_at' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_services_created_at ON services (created_at);
    END IF;
END
$$;

-- ------------------------------------------------------------------------
-- Prescriptions, Vaccine Uses, Sell Products: detail tables with high volume
-- - support lookup by medicine/vaccine/product for stock checks and reporting
-- ------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_prescriptions_medicine_id' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_prescriptions_medicine_id ON prescriptions (medicine_id);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_vaccine_uses_vaccine_id' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_vaccine_uses_vaccine_id ON vaccine_uses (vaccine_id);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_sell_products_product_id' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_sell_products_product_id ON sell_products (product_id);
    END IF;
END
$$;

-- ------------------------------------------------------------------------
-- Inventory indexes: common lookups by branch (unique) and by item across branches
-- - The UNIQUE(branch_id,item_id) already exists; add index on item_id for reverse lookups
-- ------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_medicine_inventory_medicine_id' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_medicine_inventory_medicine_id ON medicine_inventory (medicine_id);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_vaccine_inventory_vaccine_id' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_vaccine_inventory_vaccine_id ON vaccine_inventory (vaccine_id);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_package_inventory_package_id' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_package_inventory_package_id ON package_inventory (package_id);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_product_inventory_product_id' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_product_inventory_product_id ON product_inventory (product_id);
    END IF;
END
$$;

-- ------------------------------------------------------------------------
-- Medical examinations and injections: joins and lookups by pet/doctor
-- ------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_medical_examinations_pet_id' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_medical_examinations_pet_id ON medical_examinations (pet_id);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_medical_examinations_doctor_id' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_medical_examinations_doctor_id ON medical_examinations (doctor_id);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_single_injections_pet_id' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_single_injections_pet_id ON single_injections (pet_id);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_single_injections_doctor_id' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_single_injections_doctor_id ON single_injections (doctor_id);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_package_injections_pet_id' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_package_injections_pet_id ON package_injections (pet_id);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_package_injections_doctor_id' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_package_injections_doctor_id ON package_injections (doctor_id);
    END IF;
END
$$;

-- ------------------------------------------------------------------------
-- Products and employees: useful filters for product listing and employee lookups
-- ------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_products_product_type' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_products_product_type ON products (product_type);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_employees_role' AND n.nspname = current_schema()
    ) THEN
        CREATE INDEX idx_employees_role ON employees (role);
    END IF;
END
$$;

-- ========================================================================
--                          >>PARTITIONS<<
-- ========================================================================
-- Note: Partitioning is a more invasive change (requires table redefinition
-- and migration strategy). Skipping partitioning here per instructions.
-- ========================================================================
