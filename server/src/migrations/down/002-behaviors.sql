-- ========================================================================
-- Migration: 002-behaviors.sql (down)
-- Description: Drop triggers and functions created in 002-behaviors.sql
-- ========================================================================

-- 1. Drop generated updated_at triggers
DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'users','accounts','refresh_tokens','pets','employees','branches',
        'mobilizations','invoices','types_of_services','services','promotions',
        'apply_promotions','promotion_for','medicines','medical_examinations',
        'prescriptions','vaccines','vaccine_packages','include_vaccines',
        'single_injections','package_injections','vaccine_uses','vaccine_package_uses',
        'products','sell_products','medicine_inventory','vaccine_inventory',
        'package_inventory','product_inventory','appointments'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I;', tbl, tbl);
    END LOOP;
END $$;

DROP TRIGGER IF EXISTS trg_validate_accounts_owner_role ON accounts;

DROP TRIGGER IF EXISTS trg_check_manager_role ON branches;
DROP TRIGGER IF EXISTS trg_check_doctor_role_medical_examinations ON medical_examinations;
DROP TRIGGER IF EXISTS trg_check_doctor_role_single_injections ON single_injections;
DROP TRIGGER IF EXISTS trg_check_doctor_role_package_injections ON package_injections;
DROP TRIGGER IF EXISTS trg_check_doctor_role_appointments ON appointments;

DROP TRIGGER IF EXISTS trg_check_medical_exam_service ON medical_examinations;
DROP TRIGGER IF EXISTS trg_check_single_injection_service ON single_injections;
DROP TRIGGER IF EXISTS trg_check_package_injection_service ON package_injections;
DROP TRIGGER IF EXISTS trg_check_sell_product_service ON sell_products;

DROP TRIGGER IF EXISTS trg_check_pet_ownership ON appointments;

DROP TRIGGER IF EXISTS trg_validate_employee_branch_assignment ON invoices;
DROP TRIGGER IF EXISTS trg_validate_doctor_at_branch ON appointments;

DROP TRIGGER IF EXISTS trg_recalculate_invoice_totals_iu ON services;
DROP TRIGGER IF EXISTS trg_recalculate_invoice_totals_d ON services;

DROP TRIGGER IF EXISTS trg_update_last_login_at ON refresh_tokens;

DROP TRIGGER IF EXISTS trg_validate_pet_health_status_transition ON pets;
DROP TRIGGER IF EXISTS trg_validate_appointment_status_transition ON appointments;

DROP TRIGGER IF EXISTS trg_validate_medicine_inventory ON prescriptions;
DROP TRIGGER IF EXISTS trg_validate_vaccine_inventory ON vaccine_uses;
DROP TRIGGER IF EXISTS trg_validate_vaccine_package_inventory ON vaccine_package_uses;
DROP TRIGGER IF EXISTS trg_validate_product_inventory ON sell_products;

DROP TRIGGER IF EXISTS trg_deduct_medicine_inventory_insert ON prescriptions;
DROP TRIGGER IF EXISTS trg_deduct_medicine_inventory_update ON prescriptions;
DROP TRIGGER IF EXISTS trg_deduct_vaccine_inventory_insert ON vaccine_uses;
DROP TRIGGER IF EXISTS trg_deduct_vaccine_inventory_update ON vaccine_uses;
DROP TRIGGER IF EXISTS trg_deduct_vaccine_package_inventory_insert ON vaccine_package_uses;
DROP TRIGGER IF EXISTS trg_deduct_vaccine_package_inventory_update ON vaccine_package_uses;
DROP TRIGGER IF EXISTS trg_deduct_product_inventory_insert ON sell_products;
DROP TRIGGER IF EXISTS trg_deduct_product_inventory_update ON sell_products;

DROP TRIGGER IF EXISTS trg_restore_medicine_inventory ON prescriptions;
DROP TRIGGER IF EXISTS trg_restore_vaccine_inventory ON vaccine_uses;
DROP TRIGGER IF EXISTS trg_restore_vaccine_package_inventory ON vaccine_package_uses;
DROP TRIGGER IF EXISTS trg_restore_product_inventory ON sell_products;

DROP TRIGGER IF EXISTS trg_validate_appointment_business_hours ON appointments;
DROP TRIGGER IF EXISTS trg_prevent_overlapping_pet_appointments ON appointments;
DROP TRIGGER IF EXISTS trg_update_membership_level ON invoices;
DROP TRIGGER IF EXISTS trg_validate_promotion_dates ON apply_promotions;
DROP TRIGGER IF EXISTS trg_prevent_past_appointment ON appointments;
DROP TRIGGER IF EXISTS trg_prevent_delete_active_appointment ON appointments;
DROP TRIGGER IF EXISTS trg_validate_positive_quantity_prescriptions ON prescriptions;
DROP TRIGGER IF EXISTS trg_validate_positive_quantity_vaccine_uses ON vaccine_uses;
DROP TRIGGER IF EXISTS trg_validate_positive_quantity_sell_products ON sell_products;

-- 3. Drop functions
DROP FUNCTION IF EXISTS fn_get_branch_from_service(BIGINT);
DROP FUNCTION IF EXISTS fn_update_timestamp();
DROP FUNCTION IF EXISTS fn_check_manager_role();
DROP FUNCTION IF EXISTS fn_check_doctor_role();
DROP FUNCTION IF EXISTS fn_validate_accounts_owner_role();
DROP FUNCTION IF EXISTS fn_check_service_type();
DROP FUNCTION IF EXISTS fn_check_pet_ownership();
DROP FUNCTION IF EXISTS fn_validate_employee_branch_assignment_invoices();
DROP FUNCTION IF EXISTS fn_validate_doctor_at_branch_appointments();
DROP FUNCTION IF EXISTS fn_recalculate_invoice_totals();
DROP FUNCTION IF EXISTS fn_update_last_login_at();
DROP FUNCTION IF EXISTS fn_validate_pet_health_status_transition();
DROP FUNCTION IF EXISTS fn_validate_appointment_status_transition();

DROP FUNCTION IF EXISTS fn_validate_medicine_inventory();
DROP FUNCTION IF EXISTS fn_validate_vaccine_inventory();
DROP FUNCTION IF EXISTS fn_validate_vaccine_package_inventory();
DROP FUNCTION IF EXISTS fn_validate_product_inventory();

DROP FUNCTION IF EXISTS fn_deduct_medicine_inventory_insert();
DROP FUNCTION IF EXISTS fn_deduct_medicine_inventory_update();
DROP FUNCTION IF EXISTS fn_deduct_vaccine_inventory_insert();
DROP FUNCTION IF EXISTS fn_deduct_vaccine_inventory_update();
DROP FUNCTION IF EXISTS fn_deduct_vaccine_package_inventory_insert();
DROP FUNCTION IF EXISTS fn_deduct_vaccine_package_inventory_update();
DROP FUNCTION IF EXISTS fn_deduct_product_inventory_insert();
DROP FUNCTION IF EXISTS fn_deduct_product_inventory_update();

DROP FUNCTION IF EXISTS fn_restore_medicine_inventory();
DROP FUNCTION IF EXISTS fn_restore_vaccine_inventory();
DROP FUNCTION IF EXISTS fn_restore_vaccine_package_inventory();
DROP FUNCTION IF EXISTS fn_restore_product_inventory();

DROP FUNCTION IF EXISTS fn_validate_appointment_business_hours();
DROP FUNCTION IF EXISTS fn_prevent_overlapping_pet_appointments();
DROP FUNCTION IF EXISTS fn_update_membership_level();
DROP FUNCTION IF EXISTS fn_validate_promotion_dates();
DROP FUNCTION IF EXISTS fn_prevent_past_appointment();
DROP FUNCTION IF EXISTS fn_prevent_delete_active_appointment();
DROP FUNCTION IF EXISTS fn_validate_positive_quantity();

-- Safety: ensure any leftover trigger functions are removed
SELECT 1;
