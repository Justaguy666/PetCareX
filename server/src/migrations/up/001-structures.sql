-- =======================================================================
-- Migration: 001-structures.sql
-- Description: Implement initial database schemas
-- EXTENSIONS, 
-- ENUM TYPES, 
-- DOMAINS, 
-- TABLES: ATTRIBUTES AND CONSTRAINTS
-- ======================================================================= 

-- CREATE DATABASE petcarex_db
--     WITH 
--     OWNER = postgres
--     ENCODING = 'UTF8'
--     LC_COLLATE = 'en_US.utf8'
--     LC_CTYPE = 'en_US.utf8'
--     TABLESPACE = pg_default
--     CONNECTION LIMIT = -1;

-- =======================================================================
-- EXTENSIONS
-- =======================================================================
CREATE EXTENSION citext;
CREATE EXTENSION btree_gist;

-- ======================================================================= 
-- ENUM TYPES
-- =======================================================================
CREATE TYPE gender AS ENUM ('Nam', 'Nữ');
CREATE TYPE pet_gender AS ENUM ('Đực', 'Cái');
CREATE TYPE membership_level AS ENUM ('Cơ bản', 'Thân thiết', 'VIP');
CREATE TYPE health_status AS ENUM ('Khỏe mạnh', 'Có vấn đề', 'Đang hồi phục', 'Chưa rõ');
CREATE TYPE employee_role AS ENUM ('Bác sĩ thú y', 'Nhân viên tiếp tân', 'Nhân viên bán hàng', 'Quản lý chi nhánh');
CREATE TYPE payment_method AS ENUM ('Tiền mặt', 'Chuyển khoản');
CREATE TYPE service_type AS ENUM ('Khám bệnh', 'Tiêm mũi lẻ', 'Tiêm theo gói', 'Mua hàng');
CREATE TYPE appointment_service_type AS ENUM ('Khám bệnh', 'Tiêm mũi lẻ', 'Tiêm theo gói');
CREATE TYPE product_type AS ENUM ('Thức ăn', 'Phụ kiện');
CREATE TYPE promotion_for_level AS ENUM ('Tất cả', 'Thân thiết trở lên', 'VIP');
CREATE TYPE status AS ENUM ('Đang chờ xác nhận', 'Đã xác nhận', 'Hoàn thành', 'Hủy bỏ');

-- =======================================================================
-- DOMAINS
-- =======================================================================
CREATE DOMAIN email_citext AS CITEXT 
CHECK (
    length(VALUE) <= 320
    AND VALUE ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

CREATE DOMAIN phone_vn AS VARCHAR(10) 
CHECK (VALUE ~ '^[0-9]{10}$');

CREATE DOMAIN citizen_id_vn AS VARCHAR(12) 
CHECK (VALUE ~ '^[0-9]{12}$');

CREATE DOMAIN past_date AS DATE 
CHECK (VALUE <= CURRENT_DATE);

CREATE DOMAIN name_text AS CITEXT 
CHECK (
    length(VALUE) <= 50
    AND VALUE ~ '^[A-Za-zÀ-ỹà-ỹ ''-]+$'
);

CREATE DOMAIN label_text AS CITEXT
CHECK (
    length(VALUE) <= 50
    AND VALUE ~ '^[A-Za-zÀ-ỹà-ỹ0-9 ()''-]+$'
);

CREATE DOMAIN object_text AS CITEXT
CHECK (
    length(VALUE) <= 200
    AND VALUE ~ '^[A-Za-zÀ-ỹà-ỹ0-9 .,()''"-]+$'
);

CREATE DOMAIN finance AS NUMERIC(15, 2) 
CHECK (VALUE >= 0);

CREATE DOMAIN rating AS INT
CHECK (
    VALUE BETWEEN 1 AND 5
    OR VALUE IS NULL
);

-- =======================================================================
-- 1. USERS (Khách Hàng)
-- =======================================================================
CREATE TABLE users (
    id                  BIGSERIAL,
    full_name           name_text,
    email               email_citext NOT NULL,
    phone_number        phone_vn,
    citizen_id          citizen_id_vn,
    gender              gender,
    date_of_birth       TIMESTAMPTZ,
    membership_level    membership_level DEFAULT 'Cơ bản',

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (id),

    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT uq_users_phone_number UNIQUE (phone_number),
    CONSTRAINT uq_users_citizen_id UNIQUE (citizen_id)
);

CREATE TABLE accounts (
    user_id             BIGINT NOT NULL,
    username            CITEXT NOT NULL,
    hashed_password     TEXT NOT NULL,
    is_active           BOOLEAN DEFAULT FALSE,
    last_login_at       TIMESTAMPTZ,

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (user_id),

    CONSTRAINT uq_accounts_username UNIQUE (username),

    CONSTRAINT fk_account_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

CREATE TABLE refresh_tokens (
    id              BIGSERIAL,
    user_id         BIGINT NOT NULL,
    token           TEXT NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (id),

    CONSTRAINT uq_refresh_tokens_token UNIQUE (token),

    CONSTRAINT fk_refresh_tokens_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,

    CONSTRAINT chk_refresh_tokens_expires_at
        CHECK (expires_at > created_at)
);

-- =======================================================================
-- 2. PETS (Thú Cưng)
-- =======================================================================
CREATE TABLE pets (
    id               BIGSERIAL,
    pet_name         name_text NOT NULL,
    species          label_text NOT NULL,
    breed            label_text,
    date_of_birth TIMESTAMPTZ,
    gender           pet_gender NOT NULL,
    owner_id         BIGINT NOT NULL,
    health_status    health_status DEFAULT 'Chưa rõ',

    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (id),

    CONSTRAINT fk_pets_owner 
        FOREIGN KEY (owner_id) 
        REFERENCES users(id) 
        ON DELETE RESTRICT
);

-- =======================================================================
-- 3. EMPLOYEES (Nhân Viên)
-- =======================================================================
CREATE TABLE employees (
    id                  BIGSERIAL,
    full_name           name_text NOT NULL,
    date_of_birth TIMESTAMPTZ NOT NULL,
    gender              gender NOT NULL,
    role                employee_role NOT NULL,
    base_salary         finance NOT NULL,

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (id)
);

-- =======================================================================
-- 4. BRANCHES (Chi Nhánh)
-- =======================================================================
CREATE TABLE branches (
    id              BIGSERIAL,
    branch_name     VARCHAR(100) NOT NULL,
    address         VARCHAR(200) NOT NULL,
    phone_number    phone_vn NOT NULL,
    opening_at      TIME NOT NULL DEFAULT '08:00:00',
    closing_at      TIME NOT NULL DEFAULT '22:00:00',
    manager_id      BIGINT,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (id),

    CONSTRAINT uq_branches_phone_number UNIQUE (phone_number),
    CONSTRAINT uq_manager_per_branch UNIQUE (manager_id),
    CONSTRAINT chk_branches_opening_closing CHECK (closing_at > opening_at),

    CONSTRAINT fk_branches_manager 
        FOREIGN KEY (manager_id)
        REFERENCES employees(id)
        ON DELETE SET NULL
);

-- =======================================================================
-- 5. MOBILIZATIONS (Lịch Sử Điều Động)
-- =======================================================================
CREATE TABLE mobilizations (
    id              BIGSERIAL,
    employee_id     BIGINT NOT NULL,
    branch_id       BIGINT NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (id),

    CONSTRAINT uq_mobilizations_employee_startdate 
        UNIQUE (employee_id, branch_id, start_date),

    CONSTRAINT chk_mobilizations_end_date 
        CHECK (end_date IS NULL OR end_date >= start_date),

    CONSTRAINT fk_mobilizations_employee 
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_mobilizations_branch 
        FOREIGN KEY (branch_id)
        REFERENCES branches(id)
        ON DELETE RESTRICT,

    CONSTRAINT ex_mobilizations_no_overlap 
        EXCLUDE USING gist (
            employee_id WITH =,
            daterange(start_date, COALESCE(end_date, 'infinity'), '[]') WITH &&
        )
);

-- EMPLOYEE CURRENT BRANCH VIEW
-- Xem nhanh chi nhánh hiện tại của nhân viên
CREATE VIEW v_employee_current_branch AS
    SELECT
        e.id AS employee_id,           
        e.full_name,    
        e.date_of_birth,
        e.gender,       
        e.role,         
        e.base_salary,
        
        m.branch_id as current_branch_id,
        b.branch_name,
        b.address,

        m.start_date,
        m.end_date

    FROM employees e
    LEFT JOIN mobilizations m 
           ON e.id = m.employee_id
           AND m.start_date <= CURRENT_DATE
           AND (m.end_date IS NULL OR m.end_date >= CURRENT_DATE)
    LEFT JOIN branches b 
           ON m.branch_id = b.id;

-- =======================================================================
-- 6. INVOICES (Hóa Đơn)
-- =======================================================================
CREATE TABLE invoices (
    id                              BIGSERIAL,
    created_by                      BIGINT,
    branch_id                       BIGINT,
    customer_id                     BIGINT,
    payment_method                  payment_method NOT NULL,
    sale_attitude_rating            rating,
    overall_satisfaction_rating     rating,

    total_amount                    finance DEFAULT 0,
    total_discount                  finance DEFAULT 0,
    final_amount                    finance GENERATED ALWAYS AS (total_amount - total_discount) STORED,

    created_at                      TIMESTAMPTZ DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (id),

    CONSTRAINT fk_invoices_created_by 
        FOREIGN KEY (created_by)
        REFERENCES employees(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_invoices_branch 
        FOREIGN KEY (branch_id)
        REFERENCES branches(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_invoices_customer
        FOREIGN KEY (customer_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_total_amount
        CHECK (total_amount >= 0),

    CONSTRAINT chk_total_discount
        CHECK (total_discount >= 0 AND total_discount <= total_amount),

    CONSTRAINT chk_final_amount
        CHECK (final_amount >= 0)
);

-- =======================================================================
-- 7. TYPES OF SERVICES (Loại Dịch Vụ)  
-- =======================================================================
CREATE TABLE types_of_services (
    type    service_type NOT NULL,
    price   finance NOT NULL,

    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (type)
);

-- =======================================================================
-- 8. SERVICES (Dịch Vụ)
-- =======================================================================
CREATE TABLE services (
    id                          BIGSERIAL,
    invoice_id                  BIGINT,
    type_of_service             service_type,
    quality_rating              rating,
    employee_attitude_rating    rating,
    comment                     TEXT,

    unit_price                  finance NOT NULL,
    discount_amount             finance NOT NULL,
    final_amount                finance GENERATED ALWAYS AS (unit_price - discount_amount) STORED,

    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (id),

    CONSTRAINT fk_services_invoice 
        FOREIGN KEY (invoice_id)
        REFERENCES invoices(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_services_type_of_service 
        FOREIGN KEY (type_of_service)
        REFERENCES types_of_services(type)
        ON DELETE RESTRICT,

    CONSTRAINT chk_comment_length 
        CHECK (comment IS NULL OR length(comment) <= 500),

    CONSTRAINT chk_discount_amount
        CHECK (discount_amount >= 0 AND discount_amount <= unit_price),

    CONSTRAINT chk_unit_price
        CHECK (unit_price >= 0),

    CONSTRAINT chk_final_amount
        CHECK (final_amount >= 0)
);

-- SERVICES BRANCH VIEW
-- Xem nhanh chi nhánh của dịch vụ thông qua hóa đơn
CREATE VIEW v_service_branch AS
SELECT
    s.id          AS service_id,
    i.id          AS invoice_id,
    i.branch_id   AS branch_id
FROM services s
JOIN invoices i ON i.id = s.invoice_id;

-- =======================================================================
-- 9. PROMOTIONS (Ưu đãi)
-- =======================================================================
CREATE TABLE promotions (
    id              BIGSERIAL,
    description     TEXT,
    apply_for       promotion_for_level NOT NULL,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (id),

    CONSTRAINT chk_description_length 
        CHECK (description IS NULL OR length(description) <= 500)
);

-- =======================================================================
-- 10. APPLY PROMOTIONS (Áp Dụng Ưu Đãi)
-- =======================================================================
CREATE TABLE apply_promotions (
    id              BIGSERIAL,
    promotion_id    BIGINT NOT NULL,
    branch_id       BIGINT NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (id),

    CONSTRAINT uq_apply_promotions_branch_promotion 
        UNIQUE (branch_id, promotion_id, start_date),

    CONSTRAINT chk_apply_promotions_date 
        CHECK (end_date >= start_date),

    CONSTRAINT fk_apply_promotions_promotion
        FOREIGN KEY (promotion_id)
        REFERENCES promotions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_apply_promotions_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(id)
        ON DELETE RESTRICT
);

-- =======================================================================
-- 11. PROMOTION FOR (Ưu Đãi Dành Cho)
-- =======================================================================
CREATE TABLE promotion_for (
    id                      BIGSERIAL,
    promotion_id            BIGINT NOT NULL,
    service_type            service_type NOT NULL,
    discount_percentage     INT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (id),

    CONSTRAINT uq_promotion_for_service_type 
        UNIQUE (promotion_id, service_type),

    CONSTRAINT chk_discount_percentage 
        CHECK (discount_percentage BETWEEN 5 AND 15),

    CONSTRAINT fk_promotion_for_promotion
        FOREIGN KEY (promotion_id)
        REFERENCES promotions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_promotion_for_service_type
        FOREIGN KEY (service_type)
        REFERENCES types_of_services(type)
        ON DELETE RESTRICT
);

-- =======================================================================
-- 12. MEDICINES (Thuốc)
-- =======================================================================
CREATE TABLE medicines (
    id              BIGSERIAL,
    medicine_name   object_text NOT NULL,
    description     TEXT,
    price           finance NOT NULL,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (id),

    CONSTRAINT chk_medicines_description_length 
        CHECK (description IS NULL OR length(description) <= 500)
);

-- =======================================================================
-- 13. MEDICAL EXAMINATIONS (Khám Bệnh)
-- =======================================================================
CREATE TABLE medical_examinations (
    service_id          BIGINT,
    pet_id              BIGINT NOT NULL,
    doctor_id           BIGINT NOT NULL,
    diagnosis           TEXT,
    conclusion          TEXT,
    appointment_date    TIMESTAMPTZ,

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (service_id),

    CONSTRAINT fk_medical_examinations_id
        FOREIGN KEY (service_id)
        REFERENCES services(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_medical_examinations_pet 
        FOREIGN KEY (pet_id) 
        REFERENCES pets(id) 
        ON DELETE RESTRICT,

    CONSTRAINT fk_medical_examinations_doctor
        FOREIGN KEY (doctor_id) 
        REFERENCES employees(id) 
        ON DELETE RESTRICT,

    CONSTRAINT chk_medical_examinations_diagnosis_length 
        CHECK (diagnosis IS NULL OR length(diagnosis) <= 500),

    CONSTRAINT chk_medical_examinations_conclusion_length 
        CHECK (conclusion IS NULL OR length(conclusion) <= 1000)
);

-- =======================================================================
-- 14. PRESCRIPTIONS (Toa Thuốc)
-- =======================================================================
CREATE TABLE prescriptions (
    id                          BIGSERIAL,
    medical_examination_id     BIGINT NOT NULL,
    medicine_id                 BIGINT NOT NULL,
    quantity                    INT NOT NULL,
    dosage                      TEXT NOT NULL,
    duration                    TEXT NOT NULL,
    instructions                TEXT,

    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (id),

    CONSTRAINT uq_prescriptions_medical_examination_medicine 
        UNIQUE (medical_examination_id, medicine_id),

    CONSTRAINT fk_prescriptions_medical_examination
        FOREIGN KEY (medical_examination_id)
        REFERENCES medical_examinations(service_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_prescriptions_medicine
        FOREIGN KEY (medicine_id)
        REFERENCES medicines(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_prescriptions_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_prescriptions_dosage_length
        CHECK (length(dosage) <= 100),

    CONSTRAINT chk_prescriptions_duration_length
        CHECK (length(duration) <= 100),

    CONSTRAINT chk_prescriptions_instructions_length
        CHECK (instructions IS NULL OR length(instructions) <= 500)
);

-- =======================================================================
-- 15. VACCINES (Vắc-xin)
-- ======================================================================= 
CREATE TABLE vaccines (
    id              BIGSERIAL,
    vaccine_name    object_text NOT NULL,
    price           finance NOT NULL,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (id)
);

-- =======================================================================
-- 16. VACCINE PACKAGES (Gói Tiêm)
-- =======================================================================
CREATE TABLE vaccine_packages (
    id                  BIGSERIAL,
    package_name        object_text NOT NULL,
    monthly_milestone   INT NOT NULL,
    cycle               INT NOT NULL,
    price               finance NOT NULL,

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (id),

    CONSTRAINT chk_vaccine_packages_monthly_milestone
        CHECK (monthly_milestone > 0),

    CONSTRAINT chk_vaccine_packages_cycle
        CHECK (cycle > 0)
);

-- =======================================================================
-- 17. INCLUDE VACCINES (Thành Phần Gói)
-- =======================================================================
CREATE TABLE include_vaccines (
    id              BIGSERIAL,
    package_id      BIGINT NOT NULL,
    vaccine_id      BIGINT NOT NULL,
    dosage          INT NOT NULL,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (id),

    CONSTRAINT uq_include_vaccines_package_vaccine
        UNIQUE (package_id, vaccine_id),

    CONSTRAINT fk_include_vaccines_package
        FOREIGN KEY (package_id)
        REFERENCES vaccine_packages(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_include_vaccines_vaccine
        FOREIGN KEY (vaccine_id)
        REFERENCES vaccines(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_include_vaccines_dosage
        CHECK (dosage > 0)
);

-- =======================================================================
-- 18. SINGLE INJECTIONS (Tiêm Mũi Lẻ)
-- =======================================================================
CREATE TABLE single_injections (
    service_id      BIGINT,
    pet_id          BIGINT NOT NULL,
    doctor_id       BIGINT NOT NULL,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (service_id),

    CONSTRAINT fk_single_injections_id
        FOREIGN KEY (service_id)
        REFERENCES services(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_single_injections_pet
        FOREIGN KEY (pet_id)
        REFERENCES pets(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_single_injections_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES employees(id)
        ON DELETE RESTRICT
);

-- =======================================================================
-- 19. PACKAGE INJECTIONS (Tiêm Theo Gói)
-- =======================================================================
CREATE TABLE package_injections (
    service_id          BIGINT,
    pet_id              BIGINT NOT NULL,
    doctor_id           BIGINT NOT NULL,

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (service_id),

    CONSTRAINT fk_package_injections_id
        FOREIGN KEY (service_id)
        REFERENCES services(id)
        ON DELETE CASCADE, 

    CONSTRAINT fk_package_injections_pet
        FOREIGN KEY (pet_id)
        REFERENCES pets(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_package_injections_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES employees(id)
        ON DELETE RESTRICT
);

-- =======================================================================
-- 20. VACCINE USES (Sử Dụng Vắc-xin)
-- =======================================================================
CREATE TABLE vaccine_uses (
    id                      BIGSERIAL,
    single_injection_id     BIGINT,
    vaccine_id              BIGINT NOT NULL,
    dosage                  INT NOT NULL,

    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (id),

    CONSTRAINT uq_vaccine_uses_single_injection_vaccine
        UNIQUE (single_injection_id, vaccine_id),

    CONSTRAINT fk_vaccine_uses_single_injection
        FOREIGN KEY (single_injection_id)
        REFERENCES single_injections(service_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_vaccine_uses_vaccine
        FOREIGN KEY (vaccine_id)
        REFERENCES vaccines(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_vaccine_uses_dosage
        CHECK (dosage > 0)
);

-- =======================================================================
-- 21. VACCINE PACKAGE USES (Sử Dụng Gói Tiêm) 
-- =======================================================================
CREATE TABLE vaccine_package_uses (
    id                      BIGSERIAL,
    package_injection_id    BIGINT,
    package_id              BIGINT NOT NULL,
    injection_number        INT NOT NULL,
    next_injection_date     DATE,
    is_completed            BOOLEAN DEFAULT FALSE,

    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),  

    PRIMARY KEY (id),

    CONSTRAINT uq_vaccine_package_uses_package_injection_injection_number
        UNIQUE (package_injection_id, injection_number),

    CONSTRAINT fk_vaccine_package_uses_package_injection
        FOREIGN KEY (package_injection_id)
        REFERENCES package_injections(service_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_vaccine_package_uses_package
        FOREIGN KEY (package_id)
        REFERENCES vaccine_packages(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_vaccine_package_uses_injection_number
        CHECK (injection_number > 0),

    CONSTRAINT chk_vaccine_package_uses_next_injection_date
        CHECK (
            (is_completed = TRUE AND next_injection_date IS NULL) OR 
            (is_completed = FALSE)
        )
);

-- =======================================================================
-- 22. PRODUCTS (Sản Phẩm)
-- =======================================================================
CREATE TABLE products (
    id              BIGSERIAL,
    product_name    object_text NOT NULL,
    product_type    product_type NOT NULL,
    price           finance NOT NULL,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (id)
);

-- =======================================================================
-- 23. SELL PRODUCTS
-- =======================================================================
CREATE TABLE sell_products (
    service_id      BIGINT,
    product_id      BIGINT NOT NULL,
    quantity        INT NOT NULL,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (service_id),

    CONSTRAINT uq_sell_products_service_product
        UNIQUE (service_id, product_id),

    CONSTRAINT fk_sell_products_id
        FOREIGN KEY (service_id)
        REFERENCES services(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_sell_products_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_sell_products_quantity
        CHECK (quantity > 0)
);

-- =======================================================================
-- 24. MEDICINE INVENTORY (Kho Thuốc)
-- =======================================================================
CREATE TABLE medicine_inventory (
    id              BIGSERIAL,
    branch_id       BIGINT NOT NULL,
    medicine_id     BIGINT NOT NULL,
    quantity        INT NOT NULL,

    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (id),

    CONSTRAINT uq_medicine_inventory_branch_medicine 
        UNIQUE (branch_id, medicine_id),

    CONSTRAINT fk_medicine_inventory_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_medicine_inventory_medicine
        FOREIGN KEY (medicine_id)
        REFERENCES medicines(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_medicine_inventory_quantity
        CHECK (quantity >= 0)
);

-- =======================================================================
-- 25. VACCINE INVENTORY (Kho Vắc-xin)
-- =======================================================================
CREATE TABLE vaccine_inventory (
    id              BIGSERIAL,
    branch_id       BIGINT NOT NULL,
    vaccine_id      BIGINT NOT NULL,
    quantity        INT NOT NULL,

    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (id),

    CONSTRAINT uq_vaccine_inventory_branch_vaccine 
        UNIQUE (branch_id, vaccine_id),

    CONSTRAINT fk_vaccine_inventory_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_vaccine_inventory_vaccine
        FOREIGN KEY (vaccine_id)
        REFERENCES vaccines(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_vaccine_inventory_quantity
        CHECK (quantity >= 0)
);  

-- =======================================================================
-- 26. PACKAGE INVENTORY (Kho Gói Tiêm)
-- =======================================================================
CREATE TABLE package_inventory (
    id              BIGSERIAL,
    branch_id       BIGINT NOT NULL,
    package_id      BIGINT NOT NULL,
    quantity        INT NOT NULL,

    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (id),

    CONSTRAINT uq_package_inventory_branch_package 
        UNIQUE (branch_id, package_id),

    CONSTRAINT fk_package_inventory_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_package_inventory_package
        FOREIGN KEY (package_id)
        REFERENCES vaccine_packages(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_package_inventory_quantity
        CHECK (quantity >= 0)
);

-- =======================================================================
-- 27. PRODUCT INVENTORY (Kho Sản Phẩm)
-- =======================================================================
CREATE TABLE product_inventory (
    id              BIGSERIAL,
    branch_id       BIGINT NOT NULL,
    product_id      BIGINT NOT NULL,
    quantity        INT NOT NULL,

    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (id),

    CONSTRAINT uq_product_inventory_branch_product 
        UNIQUE (branch_id, product_id),

    CONSTRAINT fk_product_inventory_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_product_inventory_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_product_inventory_quantity
        CHECK (quantity >= 0)
);

-- =======================================================================
-- 28. APPOINTMENTS (Lịch Hẹn)
-- =======================================================================
CREATE TABLE appointments (
    id                      BIGSERIAL,
    pet_id                  BIGINT NOT NULL,
    owner_id                BIGINT NOT NULL,
    branch_id               BIGINT NOT NULL,
    doctor_id               BIGINT NOT NULL,
    service_type            appointment_service_type NOT NULL,
    appointment_time        TIMESTAMPTZ NOT NULL,
    reason                  TEXT,
    status                  status NOT NULL DEFAULT 'Đang chờ xác nhận',
    cancelled_reason        TEXT,

    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (id),

    CONSTRAINT uq_appointments_pet_time_service
        UNIQUE (pet_id, appointment_time, service_type),

    CONSTRAINT uq_appointments_doctor_branch_time
        UNIQUE (doctor_id, branch_id, appointment_time),

    CONSTRAINT fk_appointments_pet
        FOREIGN KEY (pet_id)
        REFERENCES pets(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_appointments_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_appointments_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_appointments_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES employees(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_appointments_appointment_time
        CHECK (appointment_time >= NOW()),

    CONSTRAINT chk_appointments_reason_length 
        CHECK (reason IS NULL OR length(reason) <= 500),

    CONSTRAINT chk_appointments_cancelled_reason_length
        CHECK (cancelled_reason IS NULL OR length(cancelled_reason) <= 500),

    CONSTRAINT chk_appointments_cancelled_reason_logic
        CHECK (
            (status = 'Hủy bỏ' AND cancelled_reason IS NOT NULL)
            OR (status <> 'Hủy bỏ' AND cancelled_reason IS NULL)
        )
);

