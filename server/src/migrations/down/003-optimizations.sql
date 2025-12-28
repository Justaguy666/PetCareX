-- ========================================================================
-- Migration: 003-optimizations.sql (down)
-- Description: Rollback for optimizations - drop all indexes
-- ========================================================================

-- ------------------------------------------------------------------------
-- Drop Account indexes
-- ------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_accounts_user_id;
DROP INDEX IF EXISTS idx_accounts_employee_id;

-- ------------------------------------------------------------------------
-- Drop Refresh Token indexes
-- ------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_refresh_tokens_account_id;
DROP INDEX IF EXISTS idx_refresh_tokens_expires_at;

-- ------------------------------------------------------------------------
-- Drop Appointment indexes
-- ------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_appointments_owner_id_appointment_time;
DROP INDEX IF EXISTS idx_appointments_doctor_id_appointment_time;
DROP INDEX IF EXISTS idx_appointments_branch_id_appointment_time;
DROP INDEX IF EXISTS idx_appointments_appointment_time;

-- ------------------------------------------------------------------------
-- Drop Invoice & Service indexes
-- ------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_invoices_customer_id;
DROP INDEX IF EXISTS idx_invoices_branch_id_created_at;
DROP INDEX IF EXISTS idx_invoices_created_by;
DROP INDEX IF EXISTS idx_invoices_created_at;
DROP INDEX IF EXISTS idx_services_invoice_id;
DROP INDEX IF EXISTS idx_services_created_at;

-- ------------------------------------------------------------------------
-- Drop Prescription, Vaccine Use, and Sell Product indexes
-- ------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_prescriptions_medicine_id;
DROP INDEX IF EXISTS idx_vaccine_uses_vaccine_id;
DROP INDEX IF EXISTS idx_sell_products_product_id;

-- ------------------------------------------------------------------------
-- Drop Inventory indexes
-- ------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_medicine_inventory_medicine_id;
DROP INDEX IF EXISTS idx_vaccine_inventory_vaccine_id;
DROP INDEX IF EXISTS idx_package_inventory_package_id;
DROP INDEX IF EXISTS idx_product_inventory_product_id;

-- ------------------------------------------------------------------------
-- Drop Medical Examination and Injection indexes
-- ------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_medical_examinations_pet_id;
DROP INDEX IF EXISTS idx_medical_examinations_doctor_id;
DROP INDEX IF EXISTS idx_single_injections_pet_id;
DROP INDEX IF EXISTS idx_single_injections_doctor_id;
DROP INDEX IF EXISTS idx_package_injections_pet_id;
DROP INDEX IF EXISTS idx_package_injections_doctor_id;

-- ------------------------------------------------------------------------
-- Drop Pet indexes
-- ------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_pets_owner_id;

-- ------------------------------------------------------------------------
-- Drop Mobilization indexes
-- ------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_mobilizations_employee_id;
DROP INDEX IF EXISTS idx_mobilizations_branch_id;

-- ------------------------------------------------------------------------
-- Drop additional Appointment indexes
-- ------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_appointments_pet_id;

-- ------------------------------------------------------------------------
-- Drop Promotion indexes
-- ------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_apply_promotions_promotion_id;
DROP INDEX IF EXISTS idx_apply_promotions_branch_id;
DROP INDEX IF EXISTS idx_promotion_for_promotion_id;

-- ------------------------------------------------------------------------
-- Drop Vaccine Package Use and Include Vaccine indexes
-- ------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_vaccine_package_uses_package_id;
DROP INDEX IF EXISTS idx_include_vaccines_package_id;
DROP INDEX IF EXISTS idx_include_vaccines_vaccine_id;

-- ------------------------------------------------------------------------
-- Drop User indexes
-- ------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_users_membership_level;
