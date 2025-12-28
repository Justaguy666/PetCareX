export const FETCH_PETS = `
  SELECT 
    p.*, 
    u.id AS owner_id, u.full_name AS owner_name,
    la.appointment_time AS last_appointment_time,
    COUNT(*) OVER() AS total_count
  FROM pets p
  JOIN users u ON p.owner_id = u.id
  LEFT JOIN LATERAL (
    SELECT appointment_time
    FROM appointments
    WHERE pet_id = p.id AND status = 'Hoàn thành'
    ORDER BY appointment_time DESC
    LIMIT 1
  ) la ON true
`;

export const FETCH_PET_BY_ID = `
  SELECT 
    p.*, 
    u.id AS owner_id, u.full_name AS owner_name,
    la.id AS last_appointment_id,
    la.appointment_time AS last_appointment_time
  FROM pets p
  JOIN users u ON p.owner_id = u.id
  LEFT JOIN LATERAL (
    SELECT id, appointment_time
    FROM appointments
    WHERE pet_id = p.id AND status = 'Hoàn thành'
    ORDER BY appointment_time DESC
    LIMIT 1
  ) la ON true
  WHERE p.id = $1
`;
