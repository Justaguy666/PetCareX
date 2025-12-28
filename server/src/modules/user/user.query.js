export const LIST_ORDERS = `
  SELECT
    i.id AS invoice_id,
    i.customer_id,
    i.branch_id,
    i.payment_method,
    i.total_amount,
    i.total_discount,
    i.final_amount,
    i.created_at,
    i.updated_at,
    s.id AS service_id,
    s.type_of_service,
    jsonb_agg(
      jsonb_build_object(
        'product_id',   p.id,
        'product_name', p.product_name,
        'product_type', p.product_type,
        'quantity',     sp.quantity,
        'price',        p.price
      )
      ORDER BY p.id
    ) AS items
  FROM invoices i
  JOIN services s       ON s.invoice_id = i.id
  JOIN sell_products sp ON sp.service_id = s.id
  JOIN products p       ON p.id = sp.product_id
  WHERE i.customer_id = $1
  GROUP BY
    i.id, i.customer_id, i.branch_id, i.payment_method,
    i.total_amount, i.total_discount, i.final_amount,
    i.created_at, i.updated_at,
    s.id, s.type_of_service
  ORDER BY i.created_at DESC, i.id DESC
`;

export const LIST_APPOINTMENTS = `
  SELECT * FROM appointments
  WHERE owner_id = $1
  ORDER BY appointment_time DESC
`;

export const LIST_PETS = `
  SELECT 
    id,
    pet_name as name,
    species as type,
    species,
    breed,
    date_of_birth as birth_date,
    gender,
    health_status,
    owner_id,
    created_at,
    updated_at
  FROM pets
  WHERE owner_id = $1
  ORDER BY pet_name ASC
`;

export const CREATE_PET = `
  INSERT INTO pets (pet_name, species, breed, date_of_birth, gender, owner_id)
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING id, pet_name as name, species as type, species, breed, 
            date_of_birth as birth_date, gender, health_status, 
            owner_id, created_at, updated_at
`;

export const UPDATE_PROFILE = `
  UPDATE users 
  SET 
    full_name = COALESCE($1, full_name),
    phone_number = COALESCE($2, phone_number),
    citizen_id = COALESCE($3, citizen_id),
    gender = COALESCE($4, gender),
    date_of_birth = COALESCE($5, date_of_birth),
    updated_at = NOW()
  WHERE id = $6
  RETURNING *
`;

export const COUNT_PETS = `
  SELECT COUNT(*) FROM pets WHERE owner_id = $1
`;

export const COUNT_ORDERS_STATS = `
  SELECT COUNT(*), SUM(final_amount) as total_spent FROM invoices WHERE customer_id = $1
`;

export const COUNT_UPCOMING_APPOINTMENTS = `
  SELECT COUNT(*) FROM appointments WHERE owner_id = $1 AND appointment_time > NOW()
`;

export const GET_UPCOMING_APPOINTMENTS = `
  SELECT 
    a.id,
    a.appointment_time,
    a.service_type,
    a.status,
    p.pet_name,
    e.full_name as doctor_name
  FROM appointments a
  JOIN pets p ON p.id = a.pet_id
  JOIN employees e ON e.id = a.doctor_id
  WHERE a.owner_id = $1 AND a.appointment_time > NOW()
  ORDER BY a.appointment_time ASC
  LIMIT 3
`;
