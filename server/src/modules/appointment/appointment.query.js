export const LIST_APPOINTMENTS_BASE = `
  SELECT a.*, 
         p.pet_name, p.species,
         u.full_name as owner_name,
         e.full_name as doctor_name,
         b.branch_name
  FROM appointments a
  LEFT JOIN pets p ON p.id = a.pet_id
  LEFT JOIN users u ON u.id = a.owner_id
  LEFT JOIN employees e ON e.id = a.doctor_id
  LEFT JOIN branches b ON b.id = a.branch_id
  WHERE 1=1
`;

export const INSERT_APPOINTMENT = `
  SELECT fn_create_appointment($1, $2, $3, $4, $5, $6::appointment_service_type) AS appointment_id
`;

export const UPDATE_APPOINTMENT_STATUS = `
  UPDATE appointments SET status = $1::status WHERE id = $2 RETURNING *
`;
