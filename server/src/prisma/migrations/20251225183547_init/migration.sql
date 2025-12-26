-- CreateEnum
CREATE TYPE "gender" AS ENUM ('Nam', 'Nữ');

-- CreateEnum
CREATE TYPE "pet_gender" AS ENUM ('Đực', 'Cái');

-- CreateEnum
CREATE TYPE "membership_level" AS ENUM ('Cơ bản', 'Thân thiết', 'VIP');

-- CreateEnum
CREATE TYPE "health_status" AS ENUM ('Khỏe mạnh', 'Có vấn đề', 'Đang hồi phục', 'Chưa rõ');

-- CreateEnum
CREATE TYPE "employee_role" AS ENUM ('Bác sĩ thú y', 'Nhân viên tiếp tân', 'Nhân viên bán hàng', 'Quản lý chi nhánh');

-- CreateEnum
CREATE TYPE "payment_method" AS ENUM ('Tiền mặt', 'Chuyển khoản');

-- CreateEnum
CREATE TYPE "service_type" AS ENUM ('Khám bệnh', 'Tiêm mũi lẻ', 'Tiêm theo gói', 'Mua hàng');

-- CreateEnum
CREATE TYPE "appointment_service_type" AS ENUM ('Khám bệnh', 'Tiêm mũi lẻ', 'Tiêm theo gói');

-- CreateEnum
CREATE TYPE "product_type" AS ENUM ('Thức ăn', 'Phụ kiện');

-- CreateEnum
CREATE TYPE "promotion_for_level" AS ENUM ('Tất cả', 'Thân thiết trở lên', 'VIP');

-- CreateEnum
CREATE TYPE "status" AS ENUM ('Đang chờ xác nhận', 'Đã xác nhận', 'Hoàn thành', 'Hủy bỏ');

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "full_name" VARCHAR(50),
    "email" VARCHAR(320) NOT NULL,
    "phone_number" VARCHAR(10),
    "citizen_id" VARCHAR(12),
    "gender" "gender",
    "date_of_birth" TIMESTAMPTZ(6),
    "membership_level" "membership_level" NOT NULL DEFAULT 'Cơ bản',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "user_id" BIGINT NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMPTZ(6),

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pets" (
    "id" BIGSERIAL NOT NULL,
    "pet_name" VARCHAR(50) NOT NULL,
    "species" VARCHAR(50) NOT NULL,
    "breed" VARCHAR(50),
    "date_of_birth" TIMESTAMPTZ(6),
    "gender" "pet_gender" NOT NULL,
    "owner_id" BIGINT NOT NULL,
    "health_status" "health_status" NOT NULL DEFAULT 'Chưa rõ',

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" BIGSERIAL NOT NULL,
    "full_name" VARCHAR(50) NOT NULL,
    "date_of_birth" TIMESTAMPTZ(6) NOT NULL,
    "gender" "gender" NOT NULL,
    "role" "employee_role" NOT NULL,
    "base_salary" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" BIGSERIAL NOT NULL,
    "branch_name" VARCHAR(100) NOT NULL,
    "address" VARCHAR(200) NOT NULL,
    "phone_number" VARCHAR(10) NOT NULL,
    "opening_at" TIME(6) NOT NULL DEFAULT '08:00:00'::time,
    "closing_at" TIME(6) NOT NULL DEFAULT '22:00:00'::time,
    "manager_id" BIGINT,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mobilizations" (
    "id" BIGSERIAL NOT NULL,
    "employee_id" BIGINT NOT NULL,
    "branch_id" BIGINT NOT NULL,
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date" TIMESTAMPTZ(6),

    CONSTRAINT "mobilizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" BIGSERIAL NOT NULL,
    "created_by" BIGINT,
    "branch_id" BIGINT,
    "customer_id" BIGINT,
    "payment_method" "payment_method" NOT NULL,
    "sale_attitude_rating" INTEGER,
    "overall_satisfaction_rating" INTEGER,
    "total_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_discount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "final_amount" DECIMAL(15,2),

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "types_of_services" (
    "type" "service_type" NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "types_of_services_pkey" PRIMARY KEY ("type")
);

-- CreateTable
CREATE TABLE "services" (
    "id" BIGSERIAL NOT NULL,
    "invoice_id" BIGINT,
    "type_of_service" "service_type",
    "quality_rating" INTEGER,
    "employee_attitude_rating" INTEGER,
    "comment" TEXT,
    "unit_price" DECIMAL(15,2) NOT NULL,
    "discount_amount" DECIMAL(15,2) NOT NULL,
    "final_amount" DECIMAL(15,2),

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotions" (
    "id" BIGSERIAL NOT NULL,
    "description" TEXT,
    "apply_for" "promotion_for_level" NOT NULL,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apply_promotions" (
    "id" BIGSERIAL NOT NULL,
    "promotion_id" BIGINT NOT NULL,
    "branch_id" BIGINT NOT NULL,
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "apply_promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_for" (
    "id" BIGSERIAL NOT NULL,
    "promotion_id" BIGINT NOT NULL,
    "service_type" "service_type" NOT NULL,
    "discount_percentage" INTEGER NOT NULL,

    CONSTRAINT "promotion_for_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicines" (
    "id" BIGSERIAL NOT NULL,
    "medicine_name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "medicines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_examinations" (
    "service_id" BIGINT NOT NULL,
    "pet_id" BIGINT NOT NULL,
    "doctor_id" BIGINT NOT NULL,
    "diagnosis" TEXT,
    "conclusion" TEXT,
    "appointment_date" TIMESTAMPTZ(6),

    CONSTRAINT "medical_examinations_pkey" PRIMARY KEY ("service_id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" BIGSERIAL NOT NULL,
    "medical_examination_id" BIGINT NOT NULL,
    "medicine_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "dosage" VARCHAR(100) NOT NULL,
    "duration" VARCHAR(100) NOT NULL,
    "instructions" TEXT,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vaccines" (
    "id" BIGSERIAL NOT NULL,
    "vaccine_name" VARCHAR(200) NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "vaccines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vaccine_packages" (
    "id" BIGSERIAL NOT NULL,
    "package_name" VARCHAR(200) NOT NULL,
    "monthly_milestone" INTEGER NOT NULL,
    "cycle" INTEGER NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "vaccine_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "include_vaccines" (
    "id" BIGSERIAL NOT NULL,
    "package_id" BIGINT NOT NULL,
    "vaccine_id" BIGINT NOT NULL,
    "dosage" INTEGER NOT NULL,

    CONSTRAINT "include_vaccines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "single_injections" (
    "service_id" BIGINT NOT NULL,
    "pet_id" BIGINT NOT NULL,
    "doctor_id" BIGINT NOT NULL,

    CONSTRAINT "single_injections_pkey" PRIMARY KEY ("service_id")
);

-- CreateTable
CREATE TABLE "package_injections" (
    "service_id" BIGINT NOT NULL,
    "pet_id" BIGINT NOT NULL,
    "doctor_id" BIGINT NOT NULL,

    CONSTRAINT "package_injections_pkey" PRIMARY KEY ("service_id")
);

-- CreateTable
CREATE TABLE "vaccine_uses" (
    "id" BIGSERIAL NOT NULL,
    "single_injection_id" BIGINT,
    "vaccine_id" BIGINT NOT NULL,
    "dosage" INTEGER NOT NULL,

    CONSTRAINT "vaccine_uses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vaccine_package_uses" (
    "id" BIGSERIAL NOT NULL,
    "package_injection_id" BIGINT,
    "package_id" BIGINT NOT NULL,
    "injection_number" INTEGER NOT NULL,
    "next_injection_date" TIMESTAMPTZ(6),
    "is_completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "vaccine_package_uses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" BIGSERIAL NOT NULL,
    "product_name" VARCHAR(200) NOT NULL,
    "product_type" "product_type" NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sell_products" (
    "service_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "sell_products_pkey" PRIMARY KEY ("service_id")
);

-- CreateTable
CREATE TABLE "medicine_inventory" (
    "id" BIGSERIAL NOT NULL,
    "branch_id" BIGINT NOT NULL,
    "medicine_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "medicine_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vaccine_inventory" (
    "id" BIGSERIAL NOT NULL,
    "branch_id" BIGINT NOT NULL,
    "vaccine_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "vaccine_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_inventory" (
    "id" BIGSERIAL NOT NULL,
    "branch_id" BIGINT NOT NULL,
    "package_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "package_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_inventory" (
    "id" BIGSERIAL NOT NULL,
    "branch_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "product_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" BIGSERIAL NOT NULL,
    "pet_id" BIGINT NOT NULL,
    "owner_id" BIGINT NOT NULL,
    "branch_id" BIGINT NOT NULL,
    "doctor_id" BIGINT NOT NULL,
    "service_type" "appointment_service_type" NOT NULL,
    "appointment_time" TIMESTAMPTZ(6) NOT NULL,
    "reason" TEXT,
    "status" "status" NOT NULL DEFAULT 'Đang chờ xác nhận',
    "cancelled_reason" TEXT,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_citizen_id_key" ON "users"("citizen_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_username_key" ON "accounts"("username");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "branches_phone_number_key" ON "branches"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "branches_manager_id_key" ON "branches"("manager_id");

-- CreateIndex
CREATE UNIQUE INDEX "mobilizations_employee_id_branch_id_start_date_key" ON "mobilizations"("employee_id", "branch_id", "start_date");

-- CreateIndex
CREATE UNIQUE INDEX "apply_promotions_branch_id_promotion_id_start_date_key" ON "apply_promotions"("branch_id", "promotion_id", "start_date");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_for_promotion_id_service_type_key" ON "promotion_for"("promotion_id", "service_type");

-- CreateIndex
CREATE UNIQUE INDEX "prescriptions_medical_examination_id_medicine_id_key" ON "prescriptions"("medical_examination_id", "medicine_id");

-- CreateIndex
CREATE UNIQUE INDEX "include_vaccines_package_id_vaccine_id_key" ON "include_vaccines"("package_id", "vaccine_id");

-- CreateIndex
CREATE UNIQUE INDEX "vaccine_uses_single_injection_id_vaccine_id_key" ON "vaccine_uses"("single_injection_id", "vaccine_id");

-- CreateIndex
CREATE UNIQUE INDEX "vaccine_package_uses_package_injection_id_injection_number_key" ON "vaccine_package_uses"("package_injection_id", "injection_number");

-- CreateIndex
CREATE UNIQUE INDEX "sell_products_service_id_product_id_key" ON "sell_products"("service_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "medicine_inventory_branch_id_medicine_id_key" ON "medicine_inventory"("branch_id", "medicine_id");

-- CreateIndex
CREATE UNIQUE INDEX "vaccine_inventory_branch_id_vaccine_id_key" ON "vaccine_inventory"("branch_id", "vaccine_id");

-- CreateIndex
CREATE UNIQUE INDEX "package_inventory_branch_id_package_id_key" ON "package_inventory"("branch_id", "package_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_inventory_branch_id_product_id_key" ON "product_inventory"("branch_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_pet_id_appointment_time_service_type_key" ON "appointments"("pet_id", "appointment_time", "service_type");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_doctor_id_branch_id_appointment_time_key" ON "appointments"("doctor_id", "branch_id", "appointment_time");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mobilizations" ADD CONSTRAINT "mobilizations_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mobilizations" ADD CONSTRAINT "mobilizations_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_type_of_service_fkey" FOREIGN KEY ("type_of_service") REFERENCES "types_of_services"("type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apply_promotions" ADD CONSTRAINT "apply_promotions_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apply_promotions" ADD CONSTRAINT "apply_promotions_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_for" ADD CONSTRAINT "promotion_for_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_for" ADD CONSTRAINT "promotion_for_service_type_fkey" FOREIGN KEY ("service_type") REFERENCES "types_of_services"("type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_examinations" ADD CONSTRAINT "medical_examinations_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_examinations" ADD CONSTRAINT "medical_examinations_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_examinations" ADD CONSTRAINT "medical_examinations_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_medical_examination_id_fkey" FOREIGN KEY ("medical_examination_id") REFERENCES "medical_examinations"("service_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "include_vaccines" ADD CONSTRAINT "include_vaccines_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "vaccine_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "include_vaccines" ADD CONSTRAINT "include_vaccines_vaccine_id_fkey" FOREIGN KEY ("vaccine_id") REFERENCES "vaccines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "single_injections" ADD CONSTRAINT "single_injections_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "single_injections" ADD CONSTRAINT "single_injections_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "single_injections" ADD CONSTRAINT "single_injections_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_injections" ADD CONSTRAINT "package_injections_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_injections" ADD CONSTRAINT "package_injections_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_injections" ADD CONSTRAINT "package_injections_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccine_uses" ADD CONSTRAINT "vaccine_uses_single_injection_id_fkey" FOREIGN KEY ("single_injection_id") REFERENCES "single_injections"("service_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccine_uses" ADD CONSTRAINT "vaccine_uses_vaccine_id_fkey" FOREIGN KEY ("vaccine_id") REFERENCES "vaccines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccine_package_uses" ADD CONSTRAINT "vaccine_package_uses_package_injection_id_fkey" FOREIGN KEY ("package_injection_id") REFERENCES "package_injections"("service_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccine_package_uses" ADD CONSTRAINT "vaccine_package_uses_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "vaccine_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sell_products" ADD CONSTRAINT "sell_products_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sell_products" ADD CONSTRAINT "sell_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicine_inventory" ADD CONSTRAINT "medicine_inventory_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicine_inventory" ADD CONSTRAINT "medicine_inventory_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccine_inventory" ADD CONSTRAINT "vaccine_inventory_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccine_inventory" ADD CONSTRAINT "vaccine_inventory_vaccine_id_fkey" FOREIGN KEY ("vaccine_id") REFERENCES "vaccines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_inventory" ADD CONSTRAINT "package_inventory_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_inventory" ADD CONSTRAINT "package_inventory_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "vaccine_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_inventory" ADD CONSTRAINT "product_inventory_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_inventory" ADD CONSTRAINT "product_inventory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
