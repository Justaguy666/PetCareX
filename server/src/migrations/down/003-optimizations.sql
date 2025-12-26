-- ========================================================================
-- Migration: 003-optimizations.sql (down)
-- Description: Rollback for optimizations - drop all indexes
-- ========================================================================

-- ------------------------------------------------------------------------
-- Drop Auth & Token indexes
-- ------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_refresh_tokens_user_id;
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
DROP INDEX IF EXISTS idx_services_type_of_service;
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
-- Drop Product and Employee indexes
-- ------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_products_product_type;
DROP INDEX IF EXISTS idx_employees_role;
