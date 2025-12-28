-- ========================================================================
-- Seed Test Accounts for All Roles
-- Password cho tất cả: 123456
-- Bcrypt hash: $2b$10$rQZ5hT5z5Y5Y5Y5Y5Y5Y5OZ5hT5z5Y5Y5Y5Y5Y5Y5OZ5hT5z5Y5Y
-- ========================================================================

-- Tạo branch nếu chưa có
INSERT INTO branches (id, branch_name, address, opening_at, closing_at)
VALUES 
    (1, 'Chi nhánh Quận 1', '123 Nguyễn Huệ, Quận 1, TP.HCM', '08:00', '20:00'),
    (2, 'Chi nhánh Quận 7', '456 Nguyễn Văn Linh, Quận 7, TP.HCM', '08:00', '20:00')
ON CONFLICT (id) DO NOTHING;

-- ========================================================================
-- 1. KHÁCH HÀNG (Customer)
-- ========================================================================
INSERT INTO users (id, email, full_name, phone_number, gender, membership_level)
VALUES (1, 'customer@test.com', 'Nguyễn Văn Khách', '0901234567', 'Nam', 'Cơ bản')
ON CONFLICT (id) DO NOTHING;

INSERT INTO accounts (id, username, hashed_password, is_active, account_type, user_id)
VALUES (1, 'customer', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X3.m.Q3iy5Pp1gV.O', true, 'Khách hàng', 1)
ON CONFLICT (id) DO NOTHING;

-- ========================================================================
-- 2. BÁC SĨ THÚ Y (Veterinarian)
-- ========================================================================
INSERT INTO employees (id, full_name, date_of_birth, gender, role, base_salary)
VALUES (1, 'Trần Văn Bác Sĩ', '1985-03-15', 'Nam', 'Bác sĩ thú y', 15000000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO accounts (id, username, hashed_password, is_active, account_type, employee_id)
VALUES (2, 'doctor', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X3.m.Q3iy5Pp1gV.O', true, 'Bác sĩ thú y', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO mobilizations (employee_id, branch_id, start_date)
VALUES (1, 1, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- ========================================================================
-- 3. NHÂN VIÊN TIẾP TÂN (Receptionist)
-- ========================================================================
INSERT INTO employees (id, full_name, date_of_birth, gender, role, base_salary)
VALUES (2, 'Lê Thị Tiếp Tân', '1995-07-20', 'Nữ', 'Nhân viên tiếp tân', 8000000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO accounts (id, username, hashed_password, is_active, account_type, employee_id)
VALUES (3, 'receptionist', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X3.m.Q3iy5Pp1gV.O', true, 'Nhân viên tiếp tân', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO mobilizations (employee_id, branch_id, start_date)
VALUES (2, 1, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- ========================================================================
-- 4. NHÂN VIÊN BÁN HÀNG (Sales)
-- ========================================================================
INSERT INTO employees (id, full_name, date_of_birth, gender, role, base_salary)
VALUES (3, 'Phạm Văn Bán Hàng', '1992-11-10', 'Nam', 'Nhân viên bán hàng', 9000000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO accounts (id, username, hashed_password, is_active, account_type, employee_id)
VALUES (4, 'sales', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X3.m.Q3iy5Pp1gV.O', true, 'Nhân viên bán hàng', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO mobilizations (employee_id, branch_id, start_date)
VALUES (3, 1, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- ========================================================================
-- 5. QUẢN LÝ CHI NHÁNH (Admin/Manager)
-- ========================================================================
INSERT INTO employees (id, full_name, date_of_birth, gender, role, base_salary)
VALUES (4, 'Hoàng Văn Quản Lý', '1980-05-25', 'Nam', 'Quản lý chi nhánh', 20000000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO accounts (id, username, hashed_password, is_active, account_type, employee_id)
VALUES (5, 'admin', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X3.m.Q3iy5Pp1gV.O', true, 'Quản lý chi nhánh', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO mobilizations (employee_id, branch_id, start_date)
VALUES (4, 1, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- ========================================================================
-- Reset sequences
-- ========================================================================
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('employees_id_seq', (SELECT COALESCE(MAX(id), 1) FROM employees));
SELECT setval('accounts_id_seq', (SELECT COALESCE(MAX(id), 1) FROM accounts));
SELECT setval('branches_id_seq', (SELECT COALESCE(MAX(id), 1) FROM branches));

-- ========================================================================
-- DANH SÁCH TÀI KHOẢN TEST:
-- ========================================================================
-- | Role                  | Username     | Password | Email              |
-- |-----------------------|--------------|----------|--------------------|
-- | Khách hàng            | customer     | 123456   | customer@test.com  |
-- | Bác sĩ thú y          | doctor       | 123456   | -                  |
-- | Nhân viên tiếp tân    | receptionist | 123456   | -                  |
-- | Nhân viên bán hàng    | sales        | 123456   | -                  |
-- | Quản lý chi nhánh     | admin        | 123456   | -                  |
-- ========================================================================
