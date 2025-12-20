-- ========================================================================
-- Migration: 002_behaviors.sql
-- Description: Implement database logics, procedures, functions, and triggers
-- ========================================================================

-- ========================================================================
-- 1. GENERIC FUNCTION
-- ========================================================================

-- Function to update 'updated_at' timestamp on row modification
CREATE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check service type match
CREATE FUNCTION fn_check_service_type(expected_type service_type)
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM services
        WHERE id = NEW.service_id
          AND type_of_service = expected_type
    ) THEN
        RAISE EXCEPTION
            'Service % must be of type %',
            NEW.service_id, expected_type;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================================================
-- 2. APPLY updated_at TRIGGERS
-- ========================================================================

DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'users',
        'accounts',
        'pets',
        'employees',
        'branches',
        'mobilizations',
        'invoices',
        'types_of_services',
        'services',
        'promotions',
        'apply_promotions',
        'promotion_for',
        'medicines',
        'medical_examinations',
        'prescriptions',
        'vaccines',
        'vaccine_packages',
        'include_vaccines',
        'single_injections',
        'package_injections',
        'vaccine_uses',
        'vaccine_package_uses',
        'products',
        'sell_products',
        'medicine_inventory',
        'vaccine_inventory',
        'package_inventory',
        'product_inventory',
        'appointments'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%I_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW
             EXECUTE FUNCTION fn_update_timestamp();',
            tbl, tbl
        );
    END LOOP;
END $$;

-- ========================================================================
-- 3. BUSINESS CONSTRAINT TRIGGERS
-- ========================================================================

-- 1. users
-- 2. accounts
-- 3. refresh_tokens
-- 4. pets
-- 5. employees
-- 6. branches
-- Trigger to enforce manager role constraint on Branches
CREATE FUNCTION fn_check_manager_role()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.manager_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1
            FROM employees
            WHERE id = NEW.manager_id
              AND role = 'Quản lý chi nhánh'
        ) THEN
            RAISE EXCEPTION 'Manager must have the role of "Quản lý chi nhánh"';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER trg_check_manager_role
AFTER INSERT OR UPDATE ON branches
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION fn_check_manager_role();

-- 7. mobilizations
-- 8. invoices
-- 9. types_of_services
-- 10. services
-- 11. promotions
-- 12. apply_promotions
-- 13. promotion_for
-- 14. medicines
-- 15. medical_examinations
-- 16. prescriptions
-- 17. vaccines
-- 18. vaccine_packages
-- 19. include_vaccines
-- 20. single_injections
-- 21. package_injections
-- 22. vaccine_uses
-- 23. vaccine_package_uses
-- 24. products
-- 25. sell_products
-- 26. medicine_inventory
-- 27. vaccine_inventory
-- 28. package_inventory
-- 29. product_inventory
-- 30. appointments

-- ========================================================================
-- 4. SERVICE TYPE CONSTRAINT TRIGGERS
-- ========================================================================

CREATE CONSTRAINT TRIGGER trg_check_medical_exam_service
AFTER INSERT OR UPDATE ON medical_examinations
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION fn_check_service_type('Khám bệnh');

CREATE CONSTRAINT TRIGGER trg_check_single_injection_service
AFTER INSERT OR UPDATE ON single_injections
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION fn_check_service_type('Tiêm mũi lẻ');

CREATE CONSTRAINT TRIGGER trg_check_package_injection_service
AFTER INSERT OR UPDATE ON package_injections
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION fn_check_service_type('Tiêm theo gói');

CREATE CONSTRAINT TRIGGER trg_check_sell_product_service
AFTER INSERT OR UPDATE ON sell_products
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION fn_check_service_type('Mua hàng');