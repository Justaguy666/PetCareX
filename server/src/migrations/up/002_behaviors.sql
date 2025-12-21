-- ========================================================================
-- Migration: 002_behaviors.sql
-- Description: Implement database logics, procedures, functions, and triggers
-- ========================================================================

-- ========================================================================
-- 1. updated_at TRIGGERS
-- ========================================================================

CREATE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
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
    IF NOT EXISTS (
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
-- 5. AUTO-UPDATE MEMBERSHIP LEVEL FUNCTION
-- ========================================================================

CREATE FUNCTION fn_recalculate_membership_level()
RETURNS VOID AS $$
BEGIN
    UPDATE users u
    SET membership_level = sub.new_level
    FROM (
        SELECT
            u2.id,
            CASE
                WHEN COALESCE(SUM(i.final_amount), 0) >= 12000000 THEN 'VIP'
                WHEN COALESCE(SUM(i.final_amount), 0) >= 5000000
                     AND u2.membership_level = 'Cơ bản'
                    THEN 'Thân thiết'
                WHEN u2.membership_level = 'VIP'
                     AND COALESCE(SUM(i.final_amount), 0) < 8000000
                    THEN 'Thân thiết'
                WHEN u2.membership_level = 'Thân thiết'
                     AND COALESCE(SUM(i.final_amount), 0) < 3000000
                    THEN 'Cơ bản'
                ELSE u2.membership_level
            END AS new_level
        FROM users u2
        LEFT JOIN invoices i
            ON i.customer_id = u2.id
           AND i.created_at >= NOW() - INTERVAL '1 year'
        GROUP BY u2.id, u2.membership_level
    ) sub
    WHERE u.id = sub.id
      AND u.membership_level IS DISTINCT FROM sub.new_level;
END;
$$ LANGUAGE plpgsql;

-- Note: This function should be called periodically, e.g., via a scheduled job or cron job (node-cron).
-- If the platform supports it, consider using database scheduling features to automate this task.
-- Or it can be invoked by the OS-level scheduler.

-- ========================================================================
-- 6. VALIDATE PET OWNERSHIP TRIGGER
-- ========================================================================

CREATE FUNCTION fn_check_pet_ownership()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pets
        WHERE id = NEW.pet_id
          AND owner_id = NEW.customer_id
    ) THEN
        RAISE EXCEPTION
            'Pet % không thuộc sở hữu của Khách hàng %',
            NEW.pet_id, NEW.customer_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_pet_ownership
BEFORE INSERT OR UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION fn_check_pet_ownership();

-- ======================================================================== 
-- 7. VALIDATE APPOINTMENT TIMING TRIGGER
-- ========================================================================

CREATE FUNCTION fn_check_appointment_time()
RETURNS TRIGGER AS $$
DECLARE
    v_opening_at TIME;
    v_closing_at TIME;
    v_appointment_time TIME;
BEGIN
    SELECT opening_at, closing_at
    INTO v_opening_at, v_closing_at
    FROM branches
    WHERE id = NEW.branch_id;

    v_appointment_time := NEW.appointment_time::TIME;

    IF v_appointment_time < v_opening_at OR v_appointment_time > v_closing_at THEN
        RAISE EXCEPTION
            'Thời gian hẹn % nằm ngoài giờ làm việc của chi nhánh (% - %)',
            v_appointment_time, v_opening_at, v_closing_at;
    END IF;

    IF (TG_OP = 'INSERT' OR OLD.appointment_time IS DISTINCT FROM NEW.appointment_time) THEN
        IF NEW.appointment_time <= NOW() THEN
            RAISE EXCEPTION
                'Thời gian hẹn % phải là thời gian trong tương lai',
                NEW.appointment_time;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_appointment_time
BEFORE INSERT OR UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION fn_check_appointment_time();

-- ========================================================================
-- 8. PREVENT OVERLAPPING APPOINTMENTS TRIGGER
-- ========================================================================

CREATE FUNCTION fn_prevent_overlapping_appointments()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.doctor_id IS NOT NULL AND NEW.status NOT IN ('Hủy bỏ', 'Hoàn thành') THEN
        IF EXISTS (
            SELECT 1
            FROM appointments
            WHERE doctor_id = NEW.doctor_id
              AND id <> NEW.id
              AND status = 'Đã xác nhận'
              AND ABS(EXTRACT(EPOCH FROM (appointment_time - NEW.appointment_time))) < 3600
        ) THEN 
            RAISE EXCEPTION
                'Bác sĩ % đã có lịch hẹn trong vòng một giờ kể từ %',
                NEW.doctor_id, NEW.appointment_time;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_overlapping_appointments
BEFORE INSERT OR UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION fn_prevent_overlapping_appointments();

-- ========================================================================
-- 9. AUTOMATICLY SET APPOINTMENT STATUS COMPLETED FUNCTION
-- ========================================================================

CREATE FUNCTION fn_set_appointment_status_completed() 
RETURNS VOID AS $$
BEGIN
    UPDATE appointments
    SET status = 'Hoàn thành'
    WHERE 
        status = 'Đã xác nhận'
        AND appointment_time <= NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Note: This function should be called periodically.

-- ======================================================================== 
-- 10. AUTOMATICLY SET APPOINTMENT STATUS CANCELLED FUNCTION
-- ========================================================================

CREATE FUNCTION fn_set_appointment_status_cancelled()
RETURNS VOID AS $$
BEGIN
    UPDATE appointments
    SET 
        status = 'Hủy bỏ',
        cancelled_reason = 'Hệ thống tự động hủy do không xác nhận trước giờ hẹn'
    WHERE
        status = 'Đang chờ xác nhận'
        AND appointment_time <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Note: This function should be called periodically.

-- ========================================================================
-- 11. CONFIRM APPOINTMENT TRIGGER
-- ========================================================================

CREATE FUNCTION fn_confirm_appointment()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE appointments
    SET status = 'Hủy bỏ',
        cancelled_reason = 'Hệ thống tự động hủy do bác sĩ đã nhận lịch hẹn khác'
    WHERE
        status = 'Đang chờ xác nhận'
        AND doctor_id = NEW.doctor_id
        AND id <> NEW.id
        AND ABS(EXTRACT(EPOCH FROM (appointment_time - NEW.appointment_time))) < 3600;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_confirm_appointment
AFTER INSERT OR UPDATE ON appointments
FOR EACH ROW
WHEN (NEW.status = 'Đã xác nhận' AND NEW.doctor_id IS NOT NULL)
EXECUTE FUNCTION fn_confirm_appointment();

-- ========================================================================
-- 12. VALIDATE EMPLOYEE BRANCH ASSIGNMENT TRIGGER
-- ========================================================================

CREATE FUNCTION fn_validate_employee_branch_assignment()
RETURNS TRIGGER AS $$
DECLARE
    v_employee_branch_id BIGINT;
BEGIN
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
WHEN (
    NEW.created_by IS NOT NULL
    AND (
        TG_OP = 'INSERT'
        OR NEW.created_by IS DISTINCT FROM OLD.created_by
        OR NEW.branch_id IS DISTINCT FROM OLD.branch_id
    )
)
EXECUTE FUNCTION fn_validate_employee_branch_assignment();