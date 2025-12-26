-- =======================================================================
-- Migration: 001-structures.sql (down)
-- Description: Drop database objects created in 001-structures.sql
-- =======================================================================

-- Drop views
DROP VIEW IF EXISTS v_employee_current_branch CASCADE;
DROP VIEW IF EXISTS v_service_branch CASCADE;

-- Drop tables (order: child tables first). Use CASCADE to remove dependent objects.
DROP TABLE IF EXISTS sell_products CASCADE;
DROP TABLE IF EXISTS product_inventory CASCADE;
DROP TABLE IF EXISTS package_inventory CASCADE;
DROP TABLE IF EXISTS vaccine_inventory CASCADE;
DROP TABLE IF EXISTS medicine_inventory CASCADE;
DROP TABLE IF EXISTS vaccine_package_uses CASCADE;
DROP TABLE IF EXISTS vaccine_uses CASCADE;
DROP TABLE IF EXISTS vaccine_package_uses CASCADE;
DROP TABLE IF EXISTS vaccine_uses CASCADE;
DROP TABLE IF EXISTS package_injections CASCADE;
DROP TABLE IF EXISTS single_injections CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS medical_examinations CASCADE;
DROP TABLE IF EXISTS include_vaccines CASCADE;
DROP TABLE IF EXISTS vaccine_packages CASCADE;
DROP TABLE IF EXISTS vaccines CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TABLE IF EXISTS promotion_for CASCADE;
DROP TABLE IF EXISTS apply_promotions CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS types_of_services CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS mobilizations CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS pets CASCADE;
DROP TABLE IF EXISTS medicine_inventory CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;

-- Drop domains
DROP DOMAIN IF EXISTS email_citext CASCADE;
DROP DOMAIN IF EXISTS phone_vn CASCADE;
DROP DOMAIN IF EXISTS citizen_id_vn CASCADE;
DROP DOMAIN IF EXISTS past_date CASCADE;
DROP DOMAIN IF EXISTS name_text CASCADE;
DROP DOMAIN IF EXISTS label_text CASCADE;
DROP DOMAIN IF EXISTS object_text CASCADE;
DROP DOMAIN IF EXISTS finance CASCADE;
DROP DOMAIN IF EXISTS rating CASCADE;

-- Drop enum types
DROP TYPE IF EXISTS gender CASCADE;
DROP TYPE IF EXISTS pet_gender CASCADE;
DROP TYPE IF EXISTS membership_level CASCADE;
DROP TYPE IF EXISTS health_status CASCADE;
DROP TYPE IF EXISTS employee_role CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS service_type CASCADE;
DROP TYPE IF EXISTS appointment_service_type CASCADE;
DROP TYPE IF EXISTS product_type CASCADE;
DROP TYPE IF EXISTS promotion_for_level CASCADE;
DROP TYPE IF EXISTS status CASCADE;
DROP TYPE IF EXISTS account_type CASCADE;

-- Drop extensions
DROP EXTENSION IF EXISTS btree_gist CASCADE;
DROP EXTENSION IF EXISTS citext CASCADE;

-- DROP DATABASE IF EXISTS petcarex_db;

SELECT 1;
