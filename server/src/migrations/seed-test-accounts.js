import bcrypt from 'bcrypt';
import db from '../config/db.js';

const PASSWORD = '123456';
const SALT_ROUNDS = 10;

async function seedTestAccounts() {
  const hashedPassword = await bcrypt.hash(PASSWORD, SALT_ROUNDS);
  console.log('Hashed password:', hashedPassword);

  try {
    // 1. Create branches
    await db.query(`
      INSERT INTO branches (id, branch_name, address, phone_number, opening_at, closing_at)
      VALUES 
        (1, 'Chi nhánh Quận 1', '123 Nguyễn Huệ, Quận 1, TP.HCM', '0281234567', '08:00', '20:00'),
        (2, 'Chi nhánh Quận 7', '456 Nguyễn Văn Linh, Quận 7, TP.HCM', '0287654321', '08:00', '20:00')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Branches created');

    // 2. Customer account
    await db.query(`
      INSERT INTO users (id, email, full_name, phone_number, gender, membership_level)
      VALUES (1, 'customer@test.com', 'Nguyễn Văn Khách', '0901234567', 'Nam', 'Cơ bản')
      ON CONFLICT (id) DO NOTHING
    `);
    await db.query(`
      INSERT INTO accounts (id, username, hashed_password, is_active, account_type, user_id)
      VALUES (1, 'customer', $1, true, 'Khách hàng', 1)
      ON CONFLICT (id) DO NOTHING
    `, [hashedPassword]);
    console.log('✅ Customer account created');

    // 3. Veterinarian account
    const vet = await db.query(`
      INSERT INTO employees (full_name, date_of_birth, gender, role, base_salary)
      VALUES ('Trần Văn Bác Sĩ', '1985-03-15', 'Nam', 'Bác sĩ thú y', 15000000)
      RETURNING id
    `);
    const vetId = vet.rows[0].id;
    await db.query(`
      INSERT INTO accounts (username, hashed_password, is_active, account_type, employee_id)
      VALUES ('doctor', $1, true, 'Bác sĩ thú y', $2)
    `, [hashedPassword, vetId]);
    await db.query(`
      INSERT INTO mobilizations (employee_id, branch_id, start_date)
      VALUES ($1, 1, CURRENT_DATE)
    `, [vetId]);
    console.log('✅ Veterinarian account created (employee_id:', vetId, ')');

    // 4. Receptionist account
    const recep = await db.query(`
      INSERT INTO employees (full_name, date_of_birth, gender, role, base_salary)
      VALUES ('Lê Thị Tiếp Tân', '1995-07-20', 'Nữ', 'Nhân viên tiếp tân', 8000000)
      RETURNING id
    `);
    const recepId = recep.rows[0].id;
    await db.query(`
      INSERT INTO accounts (username, hashed_password, is_active, account_type, employee_id)
      VALUES ('receptionist', $1, true, 'Nhân viên tiếp tân', $2)
    `, [hashedPassword, recepId]);
    await db.query(`
      INSERT INTO mobilizations (employee_id, branch_id, start_date)
      VALUES ($1, 1, CURRENT_DATE)
    `, [recepId]);
    console.log('✅ Receptionist account created (employee_id:', recepId, ')');

    // 5. Sales account
    const sales = await db.query(`
      INSERT INTO employees (full_name, date_of_birth, gender, role, base_salary)
      VALUES ('Phạm Văn Bán Hàng', '1992-11-10', 'Nam', 'Nhân viên bán hàng', 9000000)
      RETURNING id
    `);
    const salesId = sales.rows[0].id;
    await db.query(`
      INSERT INTO accounts (username, hashed_password, is_active, account_type, employee_id)
      VALUES ('sales', $1, true, 'Nhân viên bán hàng', $2)
    `, [hashedPassword, salesId]);
    await db.query(`
      INSERT INTO mobilizations (employee_id, branch_id, start_date)
      VALUES ($1, 1, CURRENT_DATE)
    `, [salesId]);
    console.log('✅ Sales account created (employee_id:', salesId, ')');

    // 6. Admin/Manager account
    const admin = await db.query(`
      INSERT INTO employees (full_name, date_of_birth, gender, role, base_salary)
      VALUES ('Hoàng Văn Quản Lý', '1980-05-25', 'Nam', 'Quản lý chi nhánh', 20000000)
      RETURNING id
    `);
    const adminId = admin.rows[0].id;
    await db.query(`
      INSERT INTO accounts (username, hashed_password, is_active, account_type, employee_id)
      VALUES ('admin', $1, true, 'Quản lý chi nhánh', $2)
    `, [hashedPassword, adminId]);
    await db.query(`
      INSERT INTO mobilizations (employee_id, branch_id, start_date)
      VALUES ($1, 1, CURRENT_DATE)
    `, [adminId]);
    console.log('✅ Admin account created (employee_id:', adminId, ')');

    // Reset sequences
    await db.query(`SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users))`);
    await db.query(`SELECT setval('employees_id_seq', (SELECT COALESCE(MAX(id), 1) FROM employees))`);
    await db.query(`SELECT setval('accounts_id_seq', (SELECT COALESCE(MAX(id), 1) FROM accounts))`);
    await db.query(`SELECT setval('branches_id_seq', (SELECT COALESCE(MAX(id), 1) FROM branches))`);

    console.log('\n========================================');
    console.log('TEST ACCOUNTS CREATED:');
    console.log('========================================');
    console.log('| Role                | Username     | Password |');
    console.log('|---------------------|--------------|----------|');
    console.log('| Khách hàng          | customer     | 123456   |');
    console.log('| Bác sĩ thú y        | doctor       | 123456   |');
    console.log('| Nhân viên tiếp tân  | receptionist | 123456   |');
    console.log('| Nhân viên bán hàng  | sales        | 123456   |');
    console.log('| Quản lý chi nhánh   | admin        | 123456   |');
    console.log('========================================');

  } catch (error) {
    console.error('Error seeding test accounts:', error);
  } finally {
    await db.end();
  }
}

seedTestAccounts();
