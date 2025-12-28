export const GET_TODAY_APPOINTMENTS = `
  SELECT a.*, 
         p.pet_name, p.species,
         u.full_name as owner_name, u.phone_number as owner_phone,
         e.full_name as doctor_name,
         b.branch_name
  FROM appointments a
  LEFT JOIN pets p ON p.id = a.pet_id
  LEFT JOIN users u ON u.id = a.owner_id
  LEFT JOIN employees e ON e.id = a.doctor_id
  LEFT JOIN branches b ON b.id = a.branch_id
  WHERE a.branch_id = $1
    AND DATE(a.appointment_time) = CURRENT_DATE
  ORDER BY a.appointment_time ASC
`;

export const GET_BRANCH_APPOINTMENTS = `
  SELECT a.*, 
         p.pet_name, p.species,
         u.full_name as owner_name, u.phone_number as owner_phone,
         e.full_name as doctor_name
  FROM appointments a
  LEFT JOIN pets p ON p.id = a.pet_id
  LEFT JOIN users u ON u.id = a.owner_id
  LEFT JOIN employees e ON e.id = a.doctor_id
  WHERE a.branch_id = $1
`;

export const CHECKIN_APPOINTMENT = `
  UPDATE appointments 
  SET status = 'Đã xác nhận'::status
  WHERE id = $1
  RETURNING *
`;

export const SEARCH_CUSTOMERS = `
  SELECT u.id, u.full_name, u.email, u.phone_number, u.membership_level
  FROM users u
  WHERE u.full_name ILIKE $1 OR u.phone_number ILIKE $1 OR u.email ILIKE $1
  LIMIT 20
`;

export const GET_CUSTOMER_PETS = `
  SELECT id, pet_name, species, breed, date_of_birth, gender
  FROM pets
  WHERE owner_id = $1
  ORDER BY pet_name ASC
`;

export const GET_AVAILABLE_DOCTORS = `
  SELECT DISTINCT e.id, e.full_name
  FROM employees e
  JOIN mobilizations m ON m.employee_id = e.id
  WHERE e.role = 'Bác sĩ thú y'
    AND m.branch_id = $1
    AND m.start_date <= CURRENT_DATE
    AND (m.end_date IS NULL OR m.end_date >= CURRENT_DATE)
  ORDER BY e.full_name ASC
`;

export const GET_RECEPTIONIST_BRANCH = `
  SELECT b.id, b.branch_name, b.address, b.opening_at, b.closing_at
  FROM accounts a
  JOIN employees e ON e.id = a.employee_id
  JOIN mobilizations m ON m.employee_id = e.id
  JOIN branches b ON b.id = m.branch_id
  WHERE a.id = $1
    AND m.start_date <= CURRENT_DATE
    AND (m.end_date IS NULL OR m.end_date >= CURRENT_DATE)
  LIMIT 1
`;
