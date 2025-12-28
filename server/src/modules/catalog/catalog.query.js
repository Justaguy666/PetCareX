export const LIST_DOCTORS = `
  SELECT id, full_name as "fullName", gender, date_of_birth as "dateOfBirth",
         role as "role"
  FROM employees
  WHERE role = 'Bác sĩ thú y'
  ORDER BY full_name ASC
`;

export const LIST_DOCTORS_BY_BRANCH = `
  SELECT DISTINCT e.id, e.full_name as "fullName", e.gender
  FROM employees e
  JOIN mobilizations m ON m.employee_id = e.id
  WHERE e.role = 'Bác sĩ thú y'
    AND m.branch_id = $1
    AND m.start_date <= CURRENT_DATE
    AND (m.end_date IS NULL OR m.end_date >= CURRENT_DATE)
  ORDER BY e.full_name ASC
`;

export const LIST_VACCINES = `
  SELECT id, vaccine_name as name, price, created_at as "createdAt"
  FROM vaccines
  ORDER BY vaccine_name ASC
`;

export const LIST_VACCINE_PACKAGES = `
  SELECT id, package_name as name, package_name as description, 
         price, created_at as "createdAt"
  FROM vaccine_packages
  ORDER BY package_name ASC
`;
