export const CHECK_EMAIL_EXISTS = `
  SELECT 1 FROM users WHERE email = $1 LIMIT 1
`;

export const CHECK_USERNAME_EXISTS = `
  SELECT 1 FROM accounts WHERE username = $1 LIMIT 1
`;

export const CREATE_USER = `
  INSERT INTO users (email) VALUES ($1) RETURNING id
`;

export const CREATE_ACCOUNT = `
  INSERT INTO accounts (user_id, username, hashed_password, is_active)
  VALUES ($1, $2, $3, true)
  RETURNING *
`;

export const FIND_ACCOUNT_BY_EMAIL = `
  SELECT a.id, a.user_id, a.username, a.hashed_password, a.is_active, a.account_type
  FROM users u
  JOIN accounts a on a.user_id = u.id
  WHERE u.email = $1
`;

export const FIND_ACCOUNT_BY_USERNAME = `
  SELECT id, user_id, username, hashed_password, is_active, account_type
  FROM accounts
  WHERE username = $1
`;

export const FIND_ACCOUNT_BY_ID = `
  SELECT id, user_id, username, hashed_password, is_active, account_type
  FROM accounts
  WHERE id = $1
`;

export const UPDATE_LAST_LOGIN = `
  UPDATE accounts SET last_login_at = NOW() WHERE id = $1
`;

export const SAVE_REFRESH_TOKEN = `
  INSERT INTO refresh_tokens (account_id, token, expires_at)
  VALUES ($1, $2, $3)
`;

export const DELETE_REFRESH_TOKEN_BY_ID = `
  DELETE FROM refresh_tokens WHERE account_id = $1
`;

export const DELETE_REFRESH_TOKEN_BY_TOKEN = `
  DELETE FROM refresh_tokens WHERE token = $1
`;

export const FIND_REFRESH_TOKEN = `
  SELECT account_id, expires_at FROM refresh_tokens WHERE token = $1
`;

export const FIND_USER_BY_ACCOUNT_ID = `
  SELECT 
    u.id, 
    u.full_name, 
    u.email, 
    u.phone_number, 
    u.citizen_id,
    u.gender, 
    u.date_of_birth, 
    u.membership_level,
    u.created_at,
    a.account_type as role
  FROM accounts a
  JOIN users u on u.id = a.user_id 
  WHERE a.id = $1
`;

export const FIND_EMPLOYEE_BY_ACCOUNT_ID = `
  SELECT 
    e.id, 
    e.full_name, 
    e.gender, 
    e.date_of_birth,
    e.base_salary,
    a.account_type as role,
    b.id as branch_id,
    b.branch_name
  FROM accounts a
  JOIN employees e ON e.id = a.employee_id 
  LEFT JOIN mobilizations m ON m.employee_id = e.id 
    AND m.start_date <= CURRENT_DATE 
    AND (m.end_date IS NULL OR m.end_date >= CURRENT_DATE)
  LEFT JOIN branches b ON b.id = m.branch_id
  WHERE a.id = $1
`;
