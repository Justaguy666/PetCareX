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
  WHERE a.veterinarian_id = $1
  ORDER BY p.pet_name ASC
`;

export const GET_TODAY_APPOINTMENTS = `
  SELECT a.id, a.appointment_time as "appointmentTime", a.status,
         p.id as "petId", p.pet_name as "petName", p.species,
         u.full_name as "ownerName", u.phone_number as "ownerPhone",
         b.branch_name as "branchName"
  FROM appointments a
  JOIN pets p ON p.id = a.pet_id
  JOIN users u ON u.id = a.owner_id
  JOIN branches b ON b.id = a.branch_id
  WHERE a.veterinarian_id = $1
    AND DATE(a.appointment_time) = CURRENT_DATE
  ORDER BY a.appointment_time ASC
`;

export const CREATE_EXAM_RECORD = `
  SELECT fn_create_exam_record($1, $2, $3, $4, $5) as service_id
`;
