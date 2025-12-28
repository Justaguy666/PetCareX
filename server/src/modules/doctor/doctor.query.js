export const GET_DOCTOR_ID_BY_ACCOUNT = `
  SELECT employee_id FROM accounts WHERE id = $1
`;

export const GET_ASSIGNED_PETS = `
  SELECT DISTINCT p.id, p.pet_name as name, p.species, p.breed, 
         p.gender, p.date_of_birth as "dateOfBirth", p.health_status as "healthStatus",
         u.full_name as "ownerName", u.phone_number as "ownerPhone"
  FROM pets p
  JOIN appointments a ON a.pet_id = p.id
  JOIN users u ON u.id = p.owner_id
  WHERE a.doctor_id = $1
  ORDER BY p.pet_name ASC
`;

export const GET_PETS_BY_APPOINTMENT_TYPE = `
  SELECT DISTINCT p.id, p.pet_name as name, p.species, p.breed, 
         p.gender, p.date_of_birth as "dateOfBirth", p.health_status as "healthStatus",
         u.full_name as "ownerName", u.phone_number as "ownerPhone",
         a.id as "appointmentId", a.status as "appointmentStatus"
  FROM pets p
  JOIN appointments a ON a.pet_id = p.id
  JOIN users u ON u.id = p.owner_id
  WHERE a.doctor_id = $1 
    AND a.service_type = $2::appointment_service_type
    AND a.status IN ('Đang chờ xác nhận', 'Đã xác nhận')
  ORDER BY p.pet_name ASC
`;

export const GET_TODAY_APPOINTMENTS = `
  SELECT a.id, a.appointment_time as "appointmentTime", a.status, a.reason,
         p.id as "petId", p.pet_name as "petName", p.species,
         u.full_name as "ownerName", u.phone_number as "ownerPhone",
         b.branch_name as "branchName"
  FROM appointments a
  JOIN pets p ON p.id = a.pet_id
  JOIN users u ON u.id = a.owner_id
  JOIN branches b ON b.id = a.branch_id
  WHERE a.doctor_id = $1
    AND DATE(a.appointment_time) = CURRENT_DATE
  ORDER BY a.appointment_time ASC
`;

export const CREATE_EXAM_RECORD = `
  SELECT fn_create_exam_record($1::BIGINT, $2::BIGINT, $3::TEXT, $4::TEXT, $5::TIMESTAMPTZ) as service_id
`;

export const GET_VACCINE_INVENTORY_BY_BRANCH = `
  SELECT v.id, v.vaccine_name as name, v.price,
         COALESCE(vi.quantity, 0) as stock
  FROM vaccines v
  LEFT JOIN vaccine_inventory vi ON vi.vaccine_id = v.id AND vi.branch_id = $1
  ORDER BY v.vaccine_name ASC
`;

export const GET_PACKAGE_INVENTORY_BY_BRANCH = `
  SELECT vp.id, vp.package_name as name, vp.price, vp.cycle, vp.monthly_milestone,
         COALESCE(pi.quantity, 0) as stock,
         COALESCE(
           (SELECT json_agg(json_build_object(
             'vaccineId', iv.vaccine_id::text,
             'dosage', iv.dosage,
             'vaccineName', v.vaccine_name
           ))
           FROM include_vaccines iv
           JOIN vaccines v ON v.id = iv.vaccine_id
           WHERE iv.package_id = vp.id),
           '[]'::json
         ) as vaccines
  FROM vaccine_packages vp
  LEFT JOIN package_inventory pi ON pi.package_id = vp.id AND pi.branch_id = $1
  ORDER BY vp.package_name ASC
`;

export const GET_DOCTOR_BRANCH = `
  SELECT m.branch_id
  FROM accounts a
  JOIN employees e ON e.id = a.employee_id
  JOIN mobilizations m ON m.employee_id = e.id
  WHERE a.id = $1
    AND m.start_date <= CURRENT_DATE
    AND (m.end_date IS NULL OR m.end_date >= CURRENT_DATE)
  LIMIT 1
`;

export const CREATE_INVOICE = `
  INSERT INTO invoices (created_by, branch_id, customer_id, payment_method, total_amount)
  VALUES ($1, $2, $3, 'Tiền mặt'::payment_method, $4)
  RETURNING id
`;

export const CREATE_SERVICE = `
  INSERT INTO services (invoice_id, type_of_service, unit_price, discount_amount)
  VALUES ($1, $2::service_type, $3, 0)
  RETURNING id
`;

export const CREATE_SINGLE_INJECTION = `
  INSERT INTO single_injections (service_id, pet_id, doctor_id)
  VALUES ($1, $2, $3)
  RETURNING *
`;

export const GET_PET_OWNER = `
  SELECT owner_id FROM pets WHERE id = $1
`;

export const GET_VACCINE_PRICE = `
  SELECT price FROM vaccines WHERE id = $1
`;

export const GET_PACKAGE_PRICE = `
  SELECT price FROM vaccine_packages WHERE id = $1
`;

export const CREATE_PACKAGE_INJECTION = `
  INSERT INTO package_injections (service_id, pet_id, doctor_id)
  VALUES ($1, $2, $3)
  RETURNING *
`;

export const CREATE_VACCINE_PACKAGE_USE = `
  INSERT INTO vaccine_package_uses (package_injection_id, package_id, injection_number, is_completed)
  VALUES ($1, $2, $3, false)
  RETURNING *
`;

export const DEDUCT_VACCINE_STOCK = `
  UPDATE vaccine_inventory
  SET quantity = quantity - $3, updated_at = NOW()
  WHERE branch_id = $1 AND vaccine_id = $2 AND quantity >= $3
  RETURNING *
`;

export const CONFIRM_APPOINTMENT = `
  UPDATE appointments 
  SET status = 'Đã xác nhận', updated_at = NOW()
  WHERE id = $1 AND doctor_id = $2
  RETURNING *
`;

export const CANCEL_APPOINTMENT = `
  UPDATE appointments 
  SET status = 'Hủy bỏ', cancelled_reason = $3, updated_at = NOW()
  WHERE id = $1 AND doctor_id = $2
  RETURNING *
`;

export const GET_PENDING_APPOINTMENTS_COUNT = `
  SELECT COUNT(*) as count
  FROM appointments
  WHERE doctor_id = $1 AND status = 'Đang chờ xác nhận'
`;

export const GET_MEDICAL_RECORDS_BY_PET = `
  SELECT 
    me.service_id as id,
    me.diagnosis,
    me.conclusion,
    me.appointment_date,
    me.created_at as "created_at",
    COALESCE(e.full_name, 'Unknown') as "doctor_name",
    p.pet_name
  FROM medical_examinations me
  LEFT JOIN employees e ON e.id = me.doctor_id
  LEFT JOIN pets p ON p.id = me.pet_id
  WHERE me.pet_id = $1
  ORDER BY me.created_at DESC
`;

export const GET_MEDICINES = `
  SELECT id, medicine_name as name, description, price
  FROM medicines
  ORDER BY medicine_name ASC
`;

export const CREATE_PRESCRIPTION = `
  INSERT INTO prescriptions (medical_examination_id, medicine_id, quantity, dosage, duration, instructions)
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING *
`;

export const GET_PET_FULL_HISTORY = `
  SELECT 
    'examination' as type,
    me.service_id as id,
    me.diagnosis as description,
    me.conclusion,
    me.created_at,
    e.full_name as doctor_name,
    NULL as vaccine_name,
    NULL as dosage
  FROM medical_examinations me
  JOIN employees e ON e.id = me.doctor_id
  WHERE me.pet_id = $1

  UNION ALL

  SELECT 
    'single_injection' as type,
    si.service_id as id,
    v.vaccine_name as description,
    NULL as conclusion,
    si.created_at,
    e.full_name as doctor_name,
    v.vaccine_name,
    vu.dosage::text
  FROM single_injections si
  JOIN employees e ON e.id = si.doctor_id
  LEFT JOIN vaccine_uses vu ON vu.single_injection_id = si.service_id
  LEFT JOIN vaccines v ON v.id = vu.vaccine_id
  WHERE si.pet_id = $1

  UNION ALL

  SELECT 
    'package_injection' as type,
    pi.service_id as id,
    vp.package_name as description,
    NULL as conclusion,
    pi.created_at,
    e.full_name as doctor_name,
    vp.package_name as vaccine_name,
    NULL as dosage
  FROM package_injections pi
  JOIN employees e ON e.id = pi.doctor_id
  LEFT JOIN vaccine_package_uses vpu ON vpu.package_injection_id = pi.service_id
  LEFT JOIN vaccine_packages vp ON vp.id = vpu.package_id
  WHERE pi.pet_id = $1

  ORDER BY created_at DESC
`;
