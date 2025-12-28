export const GET_ALL_STAFF = `
  SELECT 
    e.id,
    e.full_name as "fullName",
    a.username as email, -- Assuming username is email
    e.role,
    m.branch_id as "branchId"
  FROM employees e
  LEFT JOIN accounts a ON e.id = a.employee_id
  LEFT JOIN mobilizations m ON e.id = m.employee_id AND m.end_date IS NULL; -- Get current branch
`;

export const CREATE_EMPLOYEE = `
  INSERT INTO employees (full_name, role, date_of_birth, gender, base_salary)
  VALUES ($1, $2, NOW(), 'Nam', 0) -- Using placeholder values
  RETURNING id;
`;

export const CREATE_ACCOUNT = `
  INSERT INTO accounts (username, hashed_password, employee_id, account_type)
  VALUES ($1, $2, $3, $4)
  RETURNING id;
`;

export const CREATE_MOBILIZATION = `
  INSERT INTO mobilizations (employee_id, branch_id, start_date)
  VALUES ($1, $2, NOW());
`;
