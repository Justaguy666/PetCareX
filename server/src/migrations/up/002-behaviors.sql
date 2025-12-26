-- ========================================================================
-- Migration: 002-behaviors.sql
-- Description: Implement database logics, procedures, functions, and triggers
-- ========================================================================

-- ========================================================================
-- HELPERS
-- ========================================================================

CREATE FUNCTION fn_get_branch_from_service(p_service_id BIGINT)
RETURNS BIGINT AS $$
DECLARE v_branch_id BIGINT;
BEGIN
    SELECT branch_id
    INTO v_branch_id
    FROM v_service_branch
    WHERE service_id = p_service_id;

    RETURN v_branch_id;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ========================================================================
-- 1. updated_at TRIGGERS
-- ========================================================================

CREATE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        NEW.updated_at = NOW();
    END IF; 

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'users',
        'accounts',
        'refresh_tokens',
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
-- 2. VALIDATE BRANCH MANAGER ROLE TRIGGER
-- ========================================================================

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
            RAISE EXCEPTION 'Nhân viên % phải có vai trò "Quản lý chi nhánh"', NEW.manager_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_manager_role
BEFORE INSERT OR UPDATE ON branches
FOR EACH ROW
EXECUTE FUNCTION fn_check_manager_role();

-- ========================================================================
-- 3. VALIDATE DOCTOR ROLE TRIGGER
-- ========================================================================

CREATE FUNCTION fn_check_doctor_role()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.doctor_id IS NOT NULL AND NOT EXISTS (
        SELECT 1
        FROM employees
        WHERE id = NEW.doctor_id
          AND role = 'Bác sĩ thú y'
    ) THEN
        RAISE EXCEPTION 'Nhân viên % phải có vai trò "Bác sĩ thú y"', NEW.doctor_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_doctor_role_medical_examinations
BEFORE INSERT OR UPDATE ON medical_examinations
FOR EACH ROW
EXECUTE FUNCTION fn_check_doctor_role();

CREATE TRIGGER trg_check_doctor_role_single_injections
BEFORE INSERT OR UPDATE ON single_injections
FOR EACH ROW
EXECUTE FUNCTION fn_check_doctor_role();

CREATE TRIGGER trg_check_doctor_role_package_injections
BEFORE INSERT OR UPDATE ON package_injections
FOR EACH ROW
EXECUTE FUNCTION fn_check_doctor_role();

CREATE TRIGGER trg_check_doctor_role_appointments
BEFORE INSERT OR UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION fn_check_doctor_role();

-- ========================================================================
-- 4. SERVICE TYPE CONSTRAINT TRIGGERS
-- ========================================================================

CREATE FUNCTION fn_check_service_type()
RETURNS TRIGGER AS $$
DECLARE
    expected_type service_type;
BEGIN
    expected_type := TG_ARGV[0]::service_type;

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

CREATE TRIGGER trg_check_medical_exam_service
BEFORE INSERT OR UPDATE ON medical_examinations
FOR EACH ROW
EXECUTE FUNCTION fn_check_service_type('Khám bệnh');

CREATE TRIGGER trg_check_single_injection_service
BEFORE INSERT OR UPDATE ON single_injections
FOR EACH ROW
EXECUTE FUNCTION fn_check_service_type('Tiêm mũi lẻ');

CREATE TRIGGER trg_check_package_injection_service
BEFORE INSERT OR UPDATE ON package_injections
FOR EACH ROW
EXECUTE FUNCTION fn_check_service_type('Tiêm theo gói');

CREATE TRIGGER trg_check_sell_product_service
BEFORE INSERT OR UPDATE ON sell_products
FOR EACH ROW
EXECUTE FUNCTION fn_check_service_type('Mua hàng');

-- ========================================================================
-- 5. VALIDATE PET OWNERSHIP TRIGGER
-- ========================================================================

CREATE FUNCTION fn_check_pet_ownership()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pets
        WHERE id = NEW.pet_id
          AND owner_id = NEW.owner_id
    ) THEN
        RAISE EXCEPTION
            'Pet % không thuộc sở hữu của Khách hàng %',
            NEW.pet_id, NEW.owner_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_pet_ownership
BEFORE INSERT OR UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION fn_check_pet_ownership();

-- ========================================================================
-- 6. VALIDATE EMPLOYEE BRANCH ASSIGNMENT TRIGGERS
-- ========================================================================

-- Validate employee at branch for invoices
CREATE FUNCTION fn_validate_employee_branch_assignment_invoices()
RETURNS TRIGGER AS $$
DECLARE
    v_employee_branch_id BIGINT;
BEGIN
    IF NEW.created_by IS NULL THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF NOT (NEW.created_by IS DISTINCT FROM OLD.created_by OR NEW.branch_id IS DISTINCT FROM OLD.branch_id) THEN
            RETURN NEW;
        END IF;
    END IF;

    SELECT current_branch_id
    INTO v_employee_branch_id
    FROM v_employee_current_branch
    WHERE employee_id = NEW.created_by;

    IF v_employee_branch_id IS NULL OR v_employee_branch_id IS DISTINCT FROM NEW.branch_id THEN
        RAISE EXCEPTION
            'Nhân viên % không được phân công cho Chi nhánh % vào thời điểm này',
            NEW.created_by, NEW.branch_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_employee_branch_assignment
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION fn_validate_employee_branch_assignment_invoices();

-- Validate doctor at branch for appointments
CREATE FUNCTION fn_validate_doctor_at_branch_appointments()
RETURNS TRIGGER AS $$
DECLARE
    v_doctor_branch_id BIGINT;
BEGIN
    SELECT current_branch_id INTO v_doctor_branch_id
    FROM v_employee_current_branch
    WHERE employee_id = NEW.doctor_id;

    IF v_doctor_branch_id IS NULL OR v_doctor_branch_id != NEW.branch_id THEN
        RAISE EXCEPTION 'Bác sĩ % không làm việc tại chi nhánh % vào thời điểm đặt lịch',
            NEW.doctor_id, NEW.branch_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_doctor_at_branch
BEFORE INSERT OR UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION fn_validate_doctor_at_branch_appointments();

-- ========================================================================
-- 7. INVOICE TOTAL AMOUNT AND DISCOUNT AMOUNT SYNC TRIGGER
-- =======================================================================

CREATE FUNCTION fn_recalculate_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
    v_invoice_id BIGINT;
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF NOT (
            NEW.invoice_id IS DISTINCT FROM OLD.invoice_id
            OR NEW.unit_price IS DISTINCT FROM OLD.unit_price
            OR NEW.discount_amount IS DISTINCT FROM OLD.discount_amount
        ) THEN
            RETURN NULL;
        END IF;
    END IF;

    v_invoice_id := COALESCE(NEW.invoice_id, OLD.invoice_id);

    IF v_invoice_id IS NULL THEN
        RETURN NULL;
    END IF;

    UPDATE invoices
    SET 
        total_amount = COALESCE((
            SELECT SUM(unit_price)
            FROM services
            WHERE invoice_id = v_invoice_id
        ), 0),
        total_discount = COALESCE((
            SELECT SUM(discount_amount)
            FROM services
            WHERE invoice_id = v_invoice_id
        ), 0)
    WHERE id = v_invoice_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalculate_invoice_totals_iu
AFTER INSERT OR UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION fn_recalculate_invoice_totals();

CREATE TRIGGER trg_recalculate_invoice_totals_d
AFTER DELETE ON services    
FOR EACH ROW
EXECUTE FUNCTION fn_recalculate_invoice_totals();

-- ========================================================================
-- 8. UPDATE LAST LOGIN AT TRIGGER
-- ========================================================================

CREATE FUNCTION fn_update_last_login_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE accounts
    SET last_login_at = NOW()
    WHERE id = NEW.account_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_last_login_at
AFTER INSERT ON refresh_tokens
FOR EACH ROW
EXECUTE FUNCTION fn_update_last_login_at();

-- ========================================================================
-- 9. STATE MACHINE CONTROLLERS
-- ========================================================================

CREATE FUNCTION fn_validate_pet_health_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.health_status = 'Đang hồi phục' AND OLD.health_status != 'Có vấn đề' THEN
        RAISE EXCEPTION
            'Trạng thái sức khỏe chỉ có thể chuyển sang "Đang hồi phục" từ trạng thái "Có vấn đề"';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_pet_health_status_transition
BEFORE UPDATE ON pets
FOR EACH ROW
EXECUTE FUNCTION fn_validate_pet_health_status_transition();

CREATE FUNCTION fn_validate_appointment_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF NEW.status = 'Hủy bỏ' AND OLD.status NOT IN ('Đang chờ xác nhận', 'Đã xác nhận') THEN
            RAISE EXCEPTION
                'Trạng thái "Hủy bỏ" chỉ có thể chuyển từ "Đang chờ xác nhận" hoặc "Đã xác nhận"';
        ELSIF NEW.status = 'Hoàn thành' AND OLD.status != 'Đã xác nhận' THEN
            RAISE EXCEPTION
                'Trạng thái "Hoàn thành" chỉ có thể chuyển từ "Đã xác nhận"';
        ELSIF NEW.status = 'Đã xác nhận' AND OLD.status != 'Đang chờ xác nhận' THEN
            RAISE EXCEPTION
                'Trạng thái "Đã xác nhận" chỉ có thể chuyển từ "Đang chờ xác nhận"';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_appointment_status_transition
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION fn_validate_appointment_status_transition();

-- ========================================================================
-- 10. CHECK QUANTITY IN INVENTORY TRIGGERS
-- ========================================================================

-- Medicine Inventory Check
CREATE FUNCTION fn_validate_medicine_inventory()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_id BIGINT;
    v_quantity INT;
BEGIN
    SELECT fn_get_branch_from_service(service_id) INTO v_branch_id
    FROM medical_examinations
    WHERE service_id = NEW.medical_examination_id;

    IF v_branch_id IS NULL THEN
        RAISE EXCEPTION 'Không tìm thấy chi nhánh cho medical examination %', NEW.medical_examination_id;
    END IF;

    SELECT quantity INTO v_quantity
    FROM medicine_inventory
    WHERE branch_id = v_branch_id
      AND medicine_id = NEW.medicine_id
    FOR UPDATE;

    IF v_quantity IS NULL OR v_quantity < NEW.quantity THEN
        RAISE EXCEPTION 'Không đủ thuốc % trong kho chi nhánh %', NEW.medicine_id, v_branch_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_medicine_inventory
BEFORE INSERT OR UPDATE ON prescriptions
FOR EACH ROW
EXECUTE FUNCTION fn_validate_medicine_inventory();

-- Vaccine Inventory Check
CREATE FUNCTION fn_validate_vaccine_inventory()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_id BIGINT;
    v_quantity INT;
BEGIN
    SELECT fn_get_branch_from_service(service_id) INTO v_branch_id
    FROM single_injections
    WHERE service_id = NEW.single_injection_id;

    IF v_branch_id IS NULL THEN
        RAISE EXCEPTION 'Không tìm thấy chi nhánh cho single injection %', NEW.single_injection_id;
    END IF;

    SELECT quantity INTO v_quantity
    FROM vaccine_inventory
    WHERE branch_id = v_branch_id
      AND vaccine_id = NEW.vaccine_id
    FOR UPDATE;

    IF v_quantity IS NULL OR v_quantity < NEW.dosage THEN
        RAISE EXCEPTION 'Không đủ vaccine % trong kho chi nhánh %', NEW.vaccine_id, v_branch_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_vaccine_inventory
BEFORE INSERT OR UPDATE ON vaccine_uses
FOR EACH ROW
EXECUTE FUNCTION fn_validate_vaccine_inventory();

-- Vaccine Package Inventory Check
CREATE FUNCTION fn_validate_vaccine_package_inventory()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_id BIGINT;
    v_quantity INT;
BEGIN
    SELECT fn_get_branch_from_service(service_id) INTO v_branch_id
    FROM package_injections
    WHERE service_id = NEW.package_injection_id;

    IF v_branch_id IS NULL THEN
        RAISE EXCEPTION 'Không tìm thấy chi nhánh cho package injection %', NEW.package_injection_id;
    END IF;

    SELECT quantity INTO v_quantity
    FROM package_inventory
    WHERE branch_id = v_branch_id
      AND package_id = NEW.package_id
    FOR UPDATE;

    IF v_quantity IS NULL OR v_quantity < 1 THEN
        RAISE EXCEPTION 'Không đủ gói vaccine % trong kho chi nhánh %', NEW.package_id, v_branch_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_vaccine_package_inventory
BEFORE INSERT OR UPDATE ON vaccine_package_uses
FOR EACH ROW
EXECUTE FUNCTION fn_validate_vaccine_package_inventory();

-- Product Inventory Check
CREATE FUNCTION fn_validate_product_inventory()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_id BIGINT;
    v_quantity INT;
BEGIN
    SELECT fn_get_branch_from_service(NEW.service_id) INTO v_branch_id;

    IF v_branch_id IS NULL THEN
        RAISE EXCEPTION 'Không tìm thấy chi nhánh cho service %', NEW.service_id;
    END IF;

    SELECT quantity INTO v_quantity
    FROM product_inventory
    WHERE branch_id = v_branch_id
      AND product_id = NEW.product_id
    FOR UPDATE;

    IF v_quantity IS NULL OR v_quantity < NEW.quantity THEN
        RAISE EXCEPTION 'Không đủ sản phẩm % trong kho chi nhánh %', NEW.product_id, v_branch_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_product_inventory
BEFORE INSERT OR UPDATE ON sell_products
FOR EACH ROW
EXECUTE FUNCTION fn_validate_product_inventory();

-- ========================================================================
-- 11. AUTOMATICALLY DEDUCT QUANTITY TRIGGERS
-- ========================================================================

-- Medicine Inventory Deduction - INSERT
CREATE FUNCTION fn_deduct_medicine_inventory_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_id BIGINT;
BEGIN
    -- Get branch
    SELECT fn_get_branch_from_service(service_id) INTO v_branch_id
    FROM medical_examinations
    WHERE service_id = NEW.medical_examination_id;

    -- Deduct inventory
    UPDATE medicine_inventory
    SET quantity = quantity - NEW.quantity
    WHERE branch_id = v_branch_id 
      AND medicine_id = NEW.medicine_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deduct_medicine_inventory_insert
AFTER INSERT ON prescriptions
FOR EACH ROW
EXECUTE FUNCTION fn_deduct_medicine_inventory_insert();

-- Medicine Inventory Deduction - UPDATE
CREATE FUNCTION fn_deduct_medicine_inventory_update()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_id BIGINT;
    v_delta INT;
BEGIN
    SELECT fn_get_branch_from_service(service_id) INTO v_branch_id
    FROM medical_examinations
    WHERE service_id = NEW.medical_examination_id;

    IF OLD.medicine_id != NEW.medicine_id THEN
        UPDATE medicine_inventory
        SET quantity = quantity + OLD.quantity
        WHERE branch_id = v_branch_id 
          AND medicine_id = OLD.medicine_id;
        
        UPDATE medicine_inventory
        SET quantity = quantity - NEW.quantity
        WHERE branch_id = v_branch_id 
          AND medicine_id = NEW.medicine_id;
    ELSE
        v_delta := NEW.quantity - OLD.quantity;
        
        IF v_delta != 0 THEN
            UPDATE medicine_inventory
            SET quantity = quantity - v_delta
            WHERE branch_id = v_branch_id 
              AND medicine_id = NEW.medicine_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deduct_medicine_inventory_update
AFTER UPDATE OF quantity, medicine_id, medical_examination_id ON prescriptions
FOR EACH ROW
WHEN (
    NEW.quantity IS DISTINCT FROM OLD.quantity 
    OR NEW.medicine_id IS DISTINCT FROM OLD.medicine_id
    OR NEW.medical_examination_id IS DISTINCT FROM OLD.medical_examination_id
)
EXECUTE FUNCTION fn_deduct_medicine_inventory_update();

-- Vaccine Inventory Deduction - INSERT
CREATE FUNCTION fn_deduct_vaccine_inventory_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_id BIGINT;
BEGIN
    SELECT fn_get_branch_from_service(service_id) INTO v_branch_id
    FROM single_injections
    WHERE service_id = NEW.single_injection_id;

    UPDATE vaccine_inventory
    SET quantity = quantity - NEW.dosage
    WHERE branch_id = v_branch_id 
      AND vaccine_id = NEW.vaccine_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deduct_vaccine_inventory_insert
AFTER INSERT ON vaccine_uses
FOR EACH ROW
EXECUTE FUNCTION fn_deduct_vaccine_inventory_insert();

-- Vaccine Inventory Deduction - UPDATE
CREATE FUNCTION fn_deduct_vaccine_inventory_update()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_id BIGINT;
    v_delta INT;
BEGIN
    SELECT fn_get_branch_from_service(service_id) INTO v_branch_id
    FROM single_injections
    WHERE service_id = NEW.single_injection_id;

    IF OLD.vaccine_id != NEW.vaccine_id THEN
        UPDATE vaccine_inventory
        SET quantity = quantity + OLD.dosage
        WHERE branch_id = v_branch_id 
          AND vaccine_id = OLD.vaccine_id;
        
        UPDATE vaccine_inventory
        SET quantity = quantity - NEW.dosage
        WHERE branch_id = v_branch_id 
          AND vaccine_id = NEW.vaccine_id;
    ELSE
        v_delta := NEW.dosage - OLD.dosage;
        
        IF v_delta != 0 THEN
            UPDATE vaccine_inventory
            SET quantity = quantity - v_delta
            WHERE branch_id = v_branch_id 
              AND vaccine_id = NEW.vaccine_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deduct_vaccine_inventory_update
AFTER UPDATE OF dosage, vaccine_id, single_injection_id ON vaccine_uses
FOR EACH ROW
WHEN (
    NEW.dosage IS DISTINCT FROM OLD.dosage 
    OR NEW.vaccine_id IS DISTINCT FROM OLD.vaccine_id
    OR NEW.single_injection_id IS DISTINCT FROM OLD.single_injection_id
)
EXECUTE FUNCTION fn_deduct_vaccine_inventory_update();

-- Vaccine Package Inventory Deduction - INSERT
CREATE FUNCTION fn_deduct_vaccine_package_inventory_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_id BIGINT;
BEGIN
    SELECT fn_get_branch_from_service(service_id) INTO v_branch_id
    FROM package_injections
    WHERE service_id = NEW.package_injection_id;

    UPDATE package_inventory
    SET quantity = quantity - 1
    WHERE branch_id = v_branch_id 
      AND package_id = NEW.package_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deduct_vaccine_package_inventory_insert
AFTER INSERT ON vaccine_package_uses
FOR EACH ROW
EXECUTE FUNCTION fn_deduct_vaccine_package_inventory_insert();

-- Vaccine Package Inventory Deduction - UPDATE
CREATE FUNCTION fn_deduct_vaccine_package_inventory_update()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_id BIGINT;
BEGIN
    SELECT fn_get_branch_from_service(service_id) INTO v_branch_id
    FROM package_injections
    WHERE service_id = NEW.package_injection_id;

    IF OLD.package_id != NEW.package_id THEN
        UPDATE package_inventory
        SET quantity = quantity + 1
        WHERE branch_id = v_branch_id 
          AND package_id = OLD.package_id;
        
        UPDATE package_inventory
        SET quantity = quantity - 1
        WHERE branch_id = v_branch_id 
          AND package_id = NEW.package_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deduct_vaccine_package_inventory_update
AFTER UPDATE OF package_id, package_injection_id ON vaccine_package_uses
FOR EACH ROW
WHEN (
    NEW.package_id IS DISTINCT FROM OLD.package_id
    OR NEW.package_injection_id IS DISTINCT FROM OLD.package_injection_id
)
EXECUTE FUNCTION fn_deduct_vaccine_package_inventory_update();

-- Product Inventory Deduction - INSERT
CREATE FUNCTION fn_deduct_product_inventory_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_id BIGINT;
BEGIN
    SELECT fn_get_branch_from_service(NEW.service_id) INTO v_branch_id;

    UPDATE product_inventory
    SET quantity = quantity - NEW.quantity
    WHERE branch_id = v_branch_id 
      AND product_id = NEW.product_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deduct_product_inventory_insert
AFTER INSERT ON sell_products
FOR EACH ROW
EXECUTE FUNCTION fn_deduct_product_inventory_insert();

-- Product Inventory Deduction - UPDATE
CREATE FUNCTION fn_deduct_product_inventory_update()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_id BIGINT;
    v_delta INT;
BEGIN
    SELECT fn_get_branch_from_service(NEW.service_id) INTO v_branch_id;

    IF OLD.product_id != NEW.product_id THEN
        UPDATE product_inventory
        SET quantity = quantity + OLD.quantity
        WHERE branch_id = v_branch_id 
          AND product_id = OLD.product_id;

        UPDATE product_inventory
        SET quantity = quantity - NEW.quantity
        WHERE branch_id = v_branch_id 
          AND product_id = NEW.product_id;
    ELSE
        v_delta := NEW.quantity - OLD.quantity;
        
        IF v_delta != 0 THEN
            UPDATE product_inventory
            SET quantity = quantity - v_delta
            WHERE branch_id = v_branch_id 
              AND product_id = NEW.product_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deduct_product_inventory_update
AFTER UPDATE OF quantity, product_id, service_id ON sell_products
FOR EACH ROW
WHEN (
    NEW.quantity IS DISTINCT FROM OLD.quantity 
    OR NEW.product_id IS DISTINCT FROM OLD.product_id
    OR NEW.service_id IS DISTINCT FROM OLD.service_id
)
EXECUTE FUNCTION fn_deduct_product_inventory_update();

-- ========================================================================
-- 12. AUTOMATICALLY RESTORE QUANTITY TRIGGERS
-- ========================================================================

-- Medicine Inventory Restoration
CREATE FUNCTION fn_restore_medicine_inventory()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_id BIGINT;
BEGIN
    SELECT fn_get_branch_from_service(service_id) INTO v_branch_id
    FROM medical_examinations
    WHERE service_id = OLD.medical_examination_id;

    UPDATE medicine_inventory
    SET quantity = quantity + OLD.quantity
    WHERE branch_id = v_branch_id
      AND medicine_id = OLD.medicine_id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_restore_medicine_inventory
AFTER DELETE ON prescriptions
FOR EACH ROW
EXECUTE FUNCTION fn_restore_medicine_inventory();   

-- Vaccine Inventory Restoration
CREATE FUNCTION fn_restore_vaccine_inventory()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_id BIGINT;
BEGIN
    SELECT fn_get_branch_from_service(service_id) INTO v_branch_id
    FROM single_injections
    WHERE service_id = OLD.single_injection_id;

    UPDATE vaccine_inventory
    SET quantity = quantity + OLD.dosage
    WHERE branch_id = v_branch_id
      AND vaccine_id = OLD.vaccine_id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_restore_vaccine_inventory
AFTER DELETE ON vaccine_uses
FOR EACH ROW
EXECUTE FUNCTION fn_restore_vaccine_inventory();

-- Vaccine Package Inventory Restoration
CREATE FUNCTION fn_restore_vaccine_package_inventory()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_id BIGINT;
BEGIN
    SELECT fn_get_branch_from_service(service_id) INTO v_branch_id
    FROM package_injections
    WHERE service_id = OLD.package_injection_id;

    UPDATE package_inventory
    SET quantity = quantity + 1
    WHERE branch_id = v_branch_id
      AND package_id = OLD.package_id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_restore_vaccine_package_inventory
AFTER DELETE ON vaccine_package_uses
FOR EACH ROW
EXECUTE FUNCTION fn_restore_vaccine_package_inventory();

-- Product Inventory Restoration
CREATE FUNCTION fn_restore_product_inventory()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_id BIGINT;
BEGIN
    SELECT fn_get_branch_from_service(OLD.service_id) INTO v_branch_id;

    UPDATE product_inventory
    SET quantity = quantity + OLD.quantity
    WHERE branch_id = v_branch_id
      AND product_id = OLD.product_id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_restore_product_inventory
AFTER DELETE ON sell_products
FOR EACH ROW
EXECUTE FUNCTION fn_restore_product_inventory();

-- ========================================================================
-- 13. VALIDATE APPOINTMENT TIME TRIGGER
-- ========================================================================

CREATE FUNCTION fn_validate_appointment_business_hours()
RETURNS TRIGGER AS $$
DECLARE
    v_opening TIME;
    v_closing TIME;
    v_appt_time TIME;
BEGIN
    SELECT opening_at, closing_at INTO v_opening, v_closing
    FROM branches WHERE id = NEW.branch_id;

    v_appt_time := NEW.appointment_time::TIME;

    IF v_appt_time < v_opening OR v_appt_time > v_closing THEN
        RAISE EXCEPTION 'Thời gian hẹn phải trong giờ mở cửa (% - %)',
            v_opening, v_closing;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_appointment_business_hours
BEFORE INSERT OR UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION fn_validate_appointment_business_hours();

-- ========================================================================
-- 14. PREVENT OVERLAPPING APPOINTMENTS FOR ONE PET TRIGGER
-- ========================================================================

CREATE FUNCTION fn_prevent_overlapping_pet_appointments()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM appointments
        WHERE pet_id = NEW.pet_id
          AND id != COALESCE(NEW.id, -1)
          AND status NOT IN ('Hủy bỏ', 'Hoàn thành')
          AND tstzrange(
              appointment_time,
              appointment_time + INTERVAL '1 hour',
              '[)'
          ) && tstzrange(
              NEW.appointment_time,
              NEW.appointment_time + INTERVAL '1 hour',
              '[)'
          )
    ) THEN
        RAISE EXCEPTION 'Pet % đã có lịch hẹn trùng thời gian', NEW.pet_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_overlapping_pet_appointments
BEFORE INSERT OR UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION fn_prevent_overlapping_pet_appointments();

-- ========================================================================
-- 15. AUTOMATICLY UPDATE MEMBERSHIP LEVEL TRIGGER
-- ========================================================================

CREATE FUNCTION fn_update_membership_level()
RETURNS TRIGGER AS $$
DECLARE
    v_total_spent NUMERIC;
BEGIN
    IF NEW.customer_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT SUM(final_amount) INTO v_total_spent
    FROM invoices
    WHERE customer_id = NEW.customer_id
      AND created_at >= NOW() - INTERVAL '1 year';

    UPDATE users
    SET membership_level = CASE
        WHEN v_total_spent >= 12000000 THEN 'VIP'::membership_level
        WHEN v_total_spent >= 5000000 THEN 'Thân thiết'::membership_level
        ELSE 'Cơ bản'::membership_level
    END
    WHERE id = NEW.customer_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_membership_level
AFTER INSERT OR UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION fn_update_membership_level();

-- ========================================================================
-- 15. VALIDATE PROMOTION APPLICABILITY TRIGGER
-- ========================================================================

CREATE FUNCTION fn_validate_promotion_dates()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM apply_promotions
        WHERE promotion_id = NEW.promotion_id
          AND branch_id = NEW.branch_id
          AND id != COALESCE(NEW.id, -1)
          AND daterange(start_date, end_date, '[]') && daterange(NEW.start_date, NEW.end_date, '[]')
    ) THEN
        RAISE EXCEPTION 'Khuyến mãi đã được áp dụng trong khoảng thời gian này tại chi nhánh';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_promotion_dates
BEFORE INSERT OR UPDATE ON apply_promotions
FOR EACH ROW
EXECUTE FUNCTION fn_validate_promotion_dates();

-- ========================================================================
-- 16. VALIDATE APPOINTMENT DATE TRIGGER
-- ======================================================================== 

CREATE FUNCTION fn_prevent_past_appointment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.appointment_time < NOW() THEN
        RAISE EXCEPTION 'Không thể đặt lịch hẹn trong quá khứ';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_past_appointment
BEFORE INSERT OR UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION fn_prevent_past_appointment();

-- ========================================================================
-- 17. PREVENTING DELETION OF ACTIVE APPOINTMENTS TRIGGER
-- ========================================================================

CREATE FUNCTION fn_prevent_delete_active_appointment()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IN ('Đã xác nhận') AND OLD.appointment_time >= NOW() THEN
        RAISE EXCEPTION 'Không thể xóa lịch hẹn đã xác nhận. Vui lòng hủy lịch trước.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_delete_active_appointment
BEFORE DELETE ON appointments
FOR EACH ROW
EXECUTE FUNCTION fn_prevent_delete_active_appointment();

-- ========================================================================
-- 18. VALIDATE POSITIVE QUANTITY TRIGGERS
-- ========================================================================

CREATE FUNCTION fn_validate_positive_quantity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantity IS NOT NULL AND NEW.quantity <= 0 THEN
        RAISE EXCEPTION 'Số lượng phải lớn hơn 0';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_positive_quantity_prescriptions
BEFORE INSERT OR UPDATE ON prescriptions
FOR EACH ROW
EXECUTE FUNCTION fn_validate_positive_quantity();

CREATE TRIGGER trg_validate_positive_quantity_vaccine_uses
BEFORE INSERT OR UPDATE ON vaccine_uses
FOR EACH ROW
WHEN (NEW.dosage IS NOT NULL AND NEW.dosage <= 0)
EXECUTE FUNCTION fn_validate_positive_quantity();

CREATE TRIGGER trg_validate_positive_quantity_sell_products
BEFORE INSERT OR UPDATE ON sell_products
FOR EACH ROW
EXECUTE FUNCTION fn_validate_positive_quantity();

-- ========================================================================
-- 20. VALIDATE ACCOUNT OWNER ROLE TRIGGER
-- ========================================================================

CREATE FUNCTION fn_validate_accounts_owner_role()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.employee_id IS NOT NULL AND NEW.user_id IS NOT NULL THEN
        RAISE EXCEPTION 'Tài khoản chỉ thuộc về một Nhân viên hoặc một Khách hàng';
    END IF;

    IF NEW.account_type IN (
        'Bác sĩ thú y', 'Nhân viên bán hàng', 'Nhân viên tiếp tân', 'Quản lý chi nhánh'
    ) THEN
        IF NEW.employee_id IS NULL THEN
            RAISE EXCEPTION 'Tài khoản với account_type "%" phải liên kết tới một Nhân viên', NEW.account_type;
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM employees e
            WHERE e.id = NEW.employee_id
              AND (
                (NEW.account_type = 'Bác sĩ thú y' AND e.role = 'Bác sĩ thú y')
                OR (NEW.account_type = 'Nhân viên bán hàng' AND e.role = 'Nhân viên bán hàng')
                OR (NEW.account_type = 'Nhân viên tiếp tân' AND e.role = 'Nhân viên tiếp tân')
                OR (NEW.account_type = 'Quản lý chi nhánh' AND e.role = 'Quản lý chi nhánh')
              )
        ) THEN
            RAISE EXCEPTION 'Nhân viên % không tồn tại hoặc vai trò không khớp với account_type "%"', 
                NEW.employee_id, NEW.account_type;
        END IF;
    END IF;

    IF NEW.account_type = 'Khách hàng' THEN
        IF NEW.user_id IS NULL THEN
            RAISE EXCEPTION 'Tài khoản Khách hàng phải liên kết tới một Người dùng';
        END IF;

        IF NEW.employee_id IS NOT NULL THEN
            RAISE EXCEPTION 'Tài khoản Khách hàng không được liên kết tới Nhân viên';
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM users
            WHERE id = NEW.user_id
        ) THEN
            RAISE EXCEPTION 'Khách hàng % không tồn tại', NEW.user_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_accounts_owner_role
BEFORE INSERT OR UPDATE ON accounts
FOR EACH ROW
EXECUTE FUNCTION fn_validate_accounts_owner_role();