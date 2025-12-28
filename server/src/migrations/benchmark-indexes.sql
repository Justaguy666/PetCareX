-- Clear cache and analyze
VACUUM ANALYZE;

-- ========================================================================
--                    GROUP 1: ACCOUNTS & AUTHENTICATION
-- ========================================================================

-- DROP indexes
DROP INDEX IF EXISTS idx_accounts_user_id;
DROP INDEX IF EXISTS idx_accounts_employee_id;
DROP INDEX IF EXISTS idx_refresh_tokens_account_id;
DROP INDEX IF EXISTS idx_refresh_tokens_expires_at;

-- CREATE indexes
CREATE INDEX idx_accounts_user_id ON accounts (user_id);
CREATE INDEX idx_accounts_employee_id ON accounts (employee_id);
CREATE INDEX idx_refresh_tokens_account_id ON refresh_tokens (account_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);

VACUUM ANALYZE accounts, refresh_tokens;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM accounts WHERE user_id = 1;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM accounts WHERE employee_id = 1;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM refresh_tokens WHERE account_id = 1;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM refresh_tokens WHERE expires_at < NOW();

-- ========================================================================
--                    GROUP 2: APPOINTMENTS
-- ========================================================================

-- DROP indexes
DROP INDEX IF EXISTS idx_appointments_owner_id_appointment_time;
DROP INDEX IF EXISTS idx_appointments_doctor_id_appointment_time;
DROP INDEX IF EXISTS idx_appointments_branch_id_appointment_time;
DROP INDEX IF EXISTS idx_appointments_appointment_time;
DROP INDEX IF EXISTS idx_appointments_pet_id;

-- CREATE indexes
CREATE INDEX idx_appointments_owner_id_appointment_time ON appointments (owner_id, appointment_time);
CREATE INDEX idx_appointments_doctor_id_appointment_time ON appointments (doctor_id, appointment_time);
CREATE INDEX idx_appointments_branch_id_appointment_time ON appointments (branch_id, appointment_time);
CREATE INDEX idx_appointments_appointment_time ON appointments (appointment_time);
CREATE INDEX idx_appointments_pet_id ON appointments (pet_id);

VACUUM ANALYZE appointments;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM appointments WHERE owner_id = 1 ORDER BY appointment_time DESC LIMIT 20;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM appointments 
WHERE doctor_id = 1 
  AND appointment_time >= CURRENT_DATE 
ORDER BY appointment_time;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM appointments 
WHERE branch_id = 1 
  AND appointment_time BETWEEN CURRENT_DATE - INTERVAL '30 days' AND CURRENT_DATE
ORDER BY appointment_time DESC;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM appointments WHERE appointment_time >= CURRENT_DATE;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM appointments WHERE pet_id = 1;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM appointments WHERE status = 'Đang chờ xác nhận';

-- ========================================================================
--                    GROUP 3: INVOICES & SERVICES
-- ========================================================================

-- DROP indexes
DROP INDEX IF EXISTS idx_invoices_customer_id;
DROP INDEX IF EXISTS idx_invoices_branch_id_created_at;
DROP INDEX IF EXISTS idx_invoices_created_by;
DROP INDEX IF EXISTS idx_invoices_created_at;
DROP INDEX IF EXISTS idx_services_invoice_id;
DROP INDEX IF EXISTS idx_services_type_of_service;
DROP INDEX IF EXISTS idx_services_created_at;

-- CREATE indexes
CREATE INDEX idx_invoices_customer_id ON invoices (customer_id);
CREATE INDEX idx_invoices_branch_id_created_at ON invoices (branch_id, created_at);
CREATE INDEX idx_invoices_created_by ON invoices (created_by);
CREATE INDEX idx_invoices_created_at ON invoices (created_at);
CREATE INDEX idx_services_invoice_id ON services (invoice_id);
CREATE INDEX idx_services_created_at ON services (created_at);

VACUUM ANALYZE invoices, services;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM invoices WHERE customer_id = 1 ORDER BY created_at DESC LIMIT 20;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM invoices 
WHERE branch_id = 1 
  AND created_at >= CURRENT_DATE - INTERVAL '90 days'
ORDER BY created_at DESC;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM invoices WHERE created_by = 1;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM invoices WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT s.* FROM services s 
INNER JOIN invoices i ON s.invoice_id = i.id 
WHERE i.customer_id = 1
LIMIT 50;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM services WHERE created_at >= CURRENT_DATE;

-- ========================================================================
--                    GROUP 4: SERVICE DETAILS (Prescriptions, Vaccines, Products)
-- ========================================================================

-- DROP indexes
DROP INDEX IF EXISTS idx_prescriptions_medicine_id;
DROP INDEX IF EXISTS idx_vaccine_uses_vaccine_id;
DROP INDEX IF EXISTS idx_sell_products_product_id;

-- CREATE indexes
CREATE INDEX idx_prescriptions_medicine_id ON prescriptions (medicine_id);
CREATE INDEX idx_vaccine_uses_vaccine_id ON vaccine_uses (vaccine_id);
CREATE INDEX idx_sell_products_product_id ON sell_products (product_id);

VACUUM ANALYZE prescriptions, vaccine_uses, sell_products;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM prescriptions WHERE medicine_id = 1;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM vaccine_uses WHERE vaccine_id = 1;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM sell_products WHERE product_id = 1;

-- ========================================================================
--                    GROUP 5: INVENTORY
-- ========================================================================

-- DROP indexes
DROP INDEX IF EXISTS idx_medicine_inventory_medicine_id;
DROP INDEX IF EXISTS idx_vaccine_inventory_vaccine_id;
DROP INDEX IF EXISTS idx_package_inventory_package_id;
DROP INDEX IF EXISTS idx_product_inventory_product_id;

-- CREATE indexes
CREATE INDEX idx_medicine_inventory_medicine_id ON medicine_inventory (medicine_id);
CREATE INDEX idx_vaccine_inventory_vaccine_id ON vaccine_inventory (vaccine_id);
CREATE INDEX idx_package_inventory_package_id ON package_inventory (package_id);
CREATE INDEX idx_product_inventory_product_id ON product_inventory (product_id);

VACUUM ANALYZE medicine_inventory, vaccine_inventory, package_inventory, product_inventory;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM medicine_inventory WHERE medicine_id = 1;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM vaccine_inventory WHERE vaccine_id = 1;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM package_inventory WHERE package_id = 1;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM product_inventory WHERE product_id = 1;

-- ========================================================================
--                    GROUP 6: MEDICAL RECORDS
-- ========================================================================

-- DROP indexes
DROP INDEX IF EXISTS idx_medical_examinations_pet_id;
DROP INDEX IF EXISTS idx_medical_examinations_doctor_id;
DROP INDEX IF EXISTS idx_single_injections_pet_id;
DROP INDEX IF EXISTS idx_single_injections_doctor_id;
DROP INDEX IF EXISTS idx_package_injections_pet_id;
DROP INDEX IF EXISTS idx_package_injections_doctor_id;

-- CREATE indexes
CREATE INDEX idx_medical_examinations_pet_id ON medical_examinations (pet_id);
CREATE INDEX idx_medical_examinations_doctor_id ON medical_examinations (doctor_id);
CREATE INDEX idx_single_injections_pet_id ON single_injections (pet_id);
CREATE INDEX idx_single_injections_doctor_id ON single_injections (doctor_id);
CREATE INDEX idx_package_injections_pet_id ON package_injections (pet_id);
CREATE INDEX idx_package_injections_doctor_id ON package_injections (doctor_id);

VACUUM ANALYZE medical_examinations, single_injections, package_injections;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM medical_examinations WHERE pet_id = 1 ORDER BY appointment_date DESC LIMIT 10;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT doctor_id, COUNT(*) as count FROM medical_examinations GROUP BY doctor_id ORDER BY count DESC;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM single_injections WHERE pet_id = 1;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM single_injections WHERE doctor_id = 1;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM package_injections WHERE pet_id = 1;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM package_injections WHERE doctor_id = 1;

-- ========================================================================
--                    GROUP 7: PETS & OWNERS
-- ========================================================================

-- DROP indexes
DROP INDEX IF EXISTS idx_pets_owner_id;

-- CREATE indexes
CREATE INDEX idx_pets_owner_id ON pets (owner_id);

VACUUM ANALYZE pets;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM pets WHERE owner_id = 1;

-- ========================================================================
--                    GROUP 8: MOBILIZATIONS
-- ========================================================================

-- DROP indexes
DROP INDEX IF EXISTS idx_mobilizations_employee_id;
DROP INDEX IF EXISTS idx_mobilizations_branch_id;

-- CREATE indexes
CREATE INDEX idx_mobilizations_employee_id ON mobilizations (employee_id);
CREATE INDEX idx_mobilizations_branch_id ON mobilizations (branch_id);

VACUUM ANALYZE mobilizations;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM mobilizations WHERE employee_id = 1;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM mobilizations WHERE branch_id = 1;

-- ========================================================================
--                    GROUP 9: PROMOTIONS
-- ========================================================================

-- DROP indexes
DROP INDEX IF EXISTS idx_apply_promotions_promotion_id;
DROP INDEX IF EXISTS idx_apply_promotions_branch_id;
DROP INDEX IF EXISTS idx_promotion_for_promotion_id;

-- CREATE indexes
CREATE INDEX idx_apply_promotions_promotion_id ON apply_promotions (promotion_id);
CREATE INDEX idx_apply_promotions_branch_id ON apply_promotions (branch_id);
CREATE INDEX idx_promotion_for_promotion_id ON promotion_for (promotion_id);

VACUUM ANALYZE apply_promotions, promotion_for;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM apply_promotions WHERE promotion_id = 1;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM apply_promotions WHERE branch_id = 1;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM promotion_for WHERE promotion_id = 1;

-- ========================================================================
--                    GROUP 10: VACCINE PACKAGES
-- ========================================================================'

-- DROP indexes
DROP INDEX IF EXISTS idx_vaccine_package_uses_package_id;
DROP INDEX IF EXISTS idx_include_vaccines_package_id;
DROP INDEX IF EXISTS idx_include_vaccines_vaccine_id;

-- CREATE indexes
CREATE INDEX idx_vaccine_package_uses_package_id ON vaccine_package_uses (package_id);
CREATE INDEX idx_include_vaccines_package_id ON include_vaccines (package_id);
CREATE INDEX idx_include_vaccines_vaccine_id ON include_vaccines (vaccine_id);

VACUUM ANALYZE vaccine_package_uses, include_vaccines;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM vaccine_package_uses WHERE package_id = 1;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM include_vaccines WHERE package_id = 1;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM include_vaccines WHERE vaccine_id = 1;
