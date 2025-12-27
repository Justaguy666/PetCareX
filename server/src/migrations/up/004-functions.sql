-- ========================================================================
-- Migration: 004-functions.sql
-- Description: Implement database functions
-- ========================================================================

-- ========================================================================
--                            >>KHÁCH HÀNG<<
-- ========================================================================

CREATE FUNCTION fn_buy_product(
    p_customer_id BIGINT,
    p_branch_id BIGINT,
    p_items JSONB,
    p_payment_method payment_method DEFAULT 'Tiền mặt'::payment_method
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  v_invoice_id BIGINT;
  v_service_id BIGINT;

  v_item JSONB;
  v_product_id BIGINT;
  v_qty INT;

  v_price finance;
  v_line_total finance;
  v_price_service finance;
  v_total finance := 0;
BEGIN
    -- 1) Check customer exists
    PERFORM 1 FROM users WHERE id = p_customer_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Customer % not found', p_customer_id;
    END IF;

    -- 2) Check branch exists
    PERFORM 1 FROM branches WHERE id = p_branch_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Branch % not found', p_branch_id;
    END IF;

    -- 3) Create invoice
    INSERT INTO invoices (branch_id, customer_id, payment_method, total_amount, total_discount)
    VALUES (p_branch_id, p_customer_id, p_payment_method, 0::finance, 0::finance)
    RETURNING id INTO v_invoice_id;

    -- 4) Create service "Mua hàng"
    INSERT INTO services (invoice_id, type_of_service, unit_price, discount_amount)
    VALUES (v_invoice_id, 'Mua hàng'::service_type, 0::finance, 0::finance)
    RETURNING id INTO v_service_id;

    -- 5) Loop items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::BIGINT;
        v_qty        := (v_item->>'quantity')::INT;

        IF v_product_id IS NULL OR v_product_id <= 0 THEN
            RAISE EXCEPTION 'Invalid product_id: %', v_item;
        END IF;

        IF v_qty IS NULL OR v_qty <= 0 THEN
            RAISE EXCEPTION 'Invalid quantity for product %', v_product_id;
        END IF;

        -- get product price
        SELECT p.price INTO v_price
        FROM products p
        WHERE p.id = v_product_id;

        IF v_price IS NULL THEN
            RAISE EXCEPTION 'Product % not found', v_product_id;
        END IF;

        -- lock & check inventory
        PERFORM 1
        FROM product_inventory pi
        WHERE pi.branch_id = p_branch_id
          AND pi.product_id = v_product_id
          AND pi.quantity >= v_qty
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Insufficient stock at branch %, product %, need %',
                p_branch_id, v_product_id, v_qty;
        END IF;

        -- deduct inventory
        UPDATE product_inventory pi
        SET quantity = pi.quantity - v_qty
        WHERE pi.branch_id = p_branch_id
          AND pi.product_id = v_product_id;

        -- insert sell_products (NO unit_price column)
        INSERT INTO sell_products (service_id, product_id, quantity)
        VALUES (v_service_id, v_product_id, v_qty);

        -- accumulate total
        v_line_total := (v_price * v_qty)::finance;
        v_total := (v_total + v_line_total)::finance;
    END LOOP;

    SELECT price into v_price_service
    FROM types_of_services
    WHERE type = 'Mua hàng'::service_type;

    v_total := (v_total + v_price_service)::finance;

    -- 6) Update totals
    UPDATE services
    SET unit_price = v_total
    WHERE id = v_service_id;

    UPDATE invoices
    SET total_amount = v_total
    WHERE id = v_invoice_id;

    RETURN v_invoice_id;
END;
$$;

-- ========================================================================
--                            >>QUẢN LÝ<<
-- ========================================================================

CREATE FUNCTION fn_statistics_branches_revenue()
RETURNS TABLE (
    v_id BIGINT,
    v_name VARCHAR(100),
    v_total_revenue NUMERIC(15, 2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    	RETURN QUERY
        SELECT
            b.id,
            b.branch_name,
            COALESCE(SUM(i.total_amount), 0)
        FROM branches b
        LEFT JOIN invoices i ON i.branch_id = b.id
        GROUP BY b.id, b.branch_name
        ORDER BY COALESCE(SUM(i.total_amount), 0) DESC;
END;
$$;

CREATE FUNCTION fn_statistics_doctors_revenue()
RETURNS TABLE (
    v_id BIGINT,
    v_name name_text,
    v_total_revenue NUMERIC(15, 2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.full_name,
        COALESCE(SUM(i.total_amount), 0)
    FROM employees e
    LEFT JOIN (
        SELECT doctor_id, service_id FROM medical_examinations
        UNION ALL
        SELECT doctor_id, service_id FROM single_injections
        UNION ALL
        SELECT doctor_id, service_id FROM package_injections
    ) ds ON ds.doctor_id = e.id
    LEFT JOIN services sv ON sv.id = ds.service_id
    LEFT JOIN invoices i ON i.id = sv.invoice_id
    WHERE e.role = 'Bác sĩ thú y'::employee_role
      AND sv.type_of_service IN (
        'Khám bệnh'::service_type,
        'Tiêm mũi lẻ'::service_type,
        'Tiêm theo gói'::service_type
      )
    GROUP BY e.id, e.full_name
    ORDER BY COALESCE(SUM(i.total_amount), 0) DESC;
END;
$$;

CREATE FUNCTION fn_statistic_appointments_all()
RETURNS TABLE (
    branch_id BIGINT,
    branch_name VARCHAR(100),
    total_appointments BIGINT,
    medical BIGINT,
    single_injection BIGINT,
    package_injection BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.id,
        b.branch_name,
        COUNT(a.id),
        COUNT(*) FILTER (WHERE a.service_type = 'Khám bệnh'::appointment_service_type),
        COUNT(*) FILTER (WHERE a.service_type = 'Tiêm mũi lẻ'::appointment_service_type),
        COUNT(*) FILTER (WHERE a.service_type = 'Tiêm theo gói'::appointment_service_type)
    FROM branches b
    LEFT JOIN appointments a ON a.branch_id = b.id
    GROUP BY b.id, b.branch_name
    ORDER BY b.id;
END;
$$;

CREATE FUNCTION fn_statistic_appointments_by_branch(p_branch_id BIGINT)
RETURNS TABLE (
    branch_id BIGINT,
    branch_name VARCHAR(100),
    total_appointments BIGINT,
    medical BIGINT,
    single_injection BIGINT,
    package_injection BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.id,
        b.branch_name,
        COUNT(a.id),
        COUNT(*) FILTER (WHERE a.service_type = 'Khám bệnh'::appointment_service_type),
        COUNT(*) FILTER (WHERE a.service_type = 'Tiêm mũi lẻ'::appointment_service_type),
        COUNT(*) FILTER (WHERE a.service_type = 'Tiêm theo gói'::appointment_service_type)
    FROM branches b
    LEFT JOIN appointments a ON a.branch_id = b.id
    WHERE b.id = p_branch_id
    GROUP BY b.id, b.branch_name;
END;
$$;
