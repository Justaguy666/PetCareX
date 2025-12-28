import db from "../../config/db.js";

class DashboardRepo {
    getCustomerStats = async (user_id) => {
        // Reuse the logic from UserRepo but consolidated here if preferred
        // Actually I'll just draft new optimized queries here
        const [petsRes, ordersRes, appointmentsRes, recentOrdersRes, upcomingApptsRes] = await Promise.all([
            db.query('SELECT COUNT(*) FROM pets WHERE owner_id = $1', [user_id]),
            db.query('SELECT COUNT(*), SUM(final_amount) as total_spent FROM invoices WHERE customer_id = $1', [user_id]),
            db.query('SELECT COUNT(*) FROM appointments WHERE owner_id = $1 AND appointment_time > NOW()', [user_id]),
            db.query(`
        SELECT i.id as invoice_id, i.total_amount, i.final_amount, i.created_at, i.payment_method,
               jsonb_agg(jsonb_build_object('product_name', p.product_name)) as items
        FROM invoices i
        LEFT JOIN services s ON s.invoice_id = i.id
        LEFT JOIN sell_products sp ON sp.service_id = s.id
        LEFT JOIN products p ON p.id = sp.product_id
        WHERE i.customer_id = $1
        GROUP BY i.id
        ORDER BY i.created_at DESC
        LIMIT 3
      `, [user_id]),
            db.query(`
        SELECT a.id, a.appointment_time, a.service_type, a.status, p.pet_name, e.full_name as doctor_name
        FROM appointments a
        JOIN pets p ON p.id = a.pet_id
        JOIN employees e ON e.id = a.doctor_id
        WHERE a.owner_id = $1 AND a.appointment_time > NOW()
        ORDER BY a.appointment_time ASC
        LIMIT 3
      `, [user_id])
        ]);

        const totalSpent = parseFloat(ordersRes.rows[0].total_spent || 0);
        const loyaltyPoints = Math.floor(totalSpent / 100000);

        return {
            stats: {
                totalPets: parseInt(petsRes.rows[0].count),
                totalOrders: parseInt(ordersRes.rows[0].count),
                upcomingAppointments: parseInt(appointmentsRes.rows[0].count),
                loyaltyPoints: loyaltyPoints
            },
            recentOrders: recentOrdersRes.rows,
            upcomingAppointments: upcomingApptsRes.rows
        };
    }

    getAdminStats = async () => {
        const today = new Date().toISOString().split('T')[0];

        const [todayAppts, totalAppts, totalInvoices, totalRevenue, recentAppts, chartData] = await Promise.all([
            db.query("SELECT COUNT(*) FROM appointments WHERE appointment_time::date = $1", [today]),
            db.query("SELECT COUNT(*) FROM appointments"),
            db.query("SELECT COUNT(*) FROM invoices"),
            db.query("SELECT SUM(final_amount) FROM invoices"),
            db.query(`
        SELECT a.id, a.appointment_time, a.status, p.pet_name, u.full_name as customer_name
        FROM appointments a
        JOIN pets p ON p.id = a.pet_id
        JOIN users u ON u.id = a.owner_id
        ORDER BY a.created_at DESC
        LIMIT 5
      `),
            db.query(`
        SELECT d.date, COUNT(a.id) as count
        FROM (
          SELECT CURRENT_DATE - i as date
          FROM generate_series(0, 6) i
        ) d
        LEFT JOIN appointments a ON a.appointment_time::date = d.date
        GROUP BY d.date
        ORDER BY d.date ASC
      `)
        ]);

        return {
            stats: {
                todayAppointments: parseInt(todayAppts.rows[0].count),
                totalAppointments: parseInt(totalAppts.rows[0].count),
                totalInvoices: parseInt(totalInvoices.rows[0].count),
                totalRevenue: parseFloat(totalRevenue.rows[0].sum || 0)
            },
            recentAppointments: recentAppts.rows,
            chartData: chartData.rows
        };
    }

    getVetStats = async (employee_id) => {
        const today = new Date().toISOString().split('T')[0];

        const [todayAppts, assignedPets, pendingAppts, recentActivity] = await Promise.all([
            db.query("SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND appointment_time::date = $2", [employee_id, today]),
            db.query("SELECT COUNT(DISTINCT pet_id) FROM appointments WHERE doctor_id = $1", [employee_id]),
            db.query("SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND status = 'Đang chờ xác nhận'", [employee_id]),
            db.query(`
        SELECT a.id, 'appointment' as type, a.status, p.pet_name, a.appointment_time as time, a.service_type
        FROM appointments a
        JOIN pets p ON p.id = a.pet_id
        WHERE a.doctor_id = $1
        ORDER BY a.updated_at DESC
        LIMIT 5
      `, [employee_id])
        ]);

        return {
            stats: {
                todaysAppointments: parseInt(todayAppts.rows[0].count),
                pendingRecords: parseInt(pendingAppts.rows[0].count),
                assignedPets: parseInt(assignedPets.rows[0].count),
                unreadNotifications: 0
            },
            recentActivity: recentActivity.rows
        };
    }

    getReceptionistStats = async () => {
        const today = new Date().toISOString().split('T')[0];

        const [todayAppts, pendingCheckins, totalCustomers, invoicesToday, recentActivity] = await Promise.all([
            db.query("SELECT COUNT(*) FROM appointments WHERE appointment_time::date = $1", [today]),
            db.query("SELECT COUNT(*) FROM appointments WHERE status = 'Đang chờ xác nhận' AND appointment_time::date = $1", [today]),
            db.query("SELECT COUNT(*) FROM users"),
            db.query("SELECT COUNT(*) FROM invoices WHERE created_at::date = $1", [today]),
            db.query(`
        SELECT 'activity' as type, a.status, p.pet_name, u.full_name as customer_name, a.updated_at as time
        FROM appointments a
        JOIN pets p ON p.id = a.pet_id
        JOIN users u ON u.id = a.owner_id
        ORDER BY a.updated_at DESC
        LIMIT 5
      `)
        ]);

        return {
            stats: {
                todaysAppointments: parseInt(todayAppts.rows[0].count),
                pendingCheckins: parseInt(pendingCheckins.rows[0].count),
                totalCustomers: parseInt(totalCustomers.rows[0].count),
                invoicesToday: parseInt(invoicesToday.rows[0].count)
            },
            recentActivity: recentActivity.rows
        };
    }

    getPublicStats = async () => {
        const [petsCount, ratingsRes] = await Promise.all([
            db.query('SELECT COUNT(*) FROM pets'),
            db.query('SELECT AVG(overall_satisfaction_rating) as avg_rating FROM invoices WHERE overall_satisfaction_rating IS NOT NULL')
        ]);

        const avgRating = parseFloat(ratingsRes.rows[0].avg_rating || 4.9); // Default to 4.9 if no ratings
        const satisfactionPercent = Math.round((avgRating / 5) * 100);

        return {
            totalPets: parseInt(petsCount.rows[0].count),
            satisfactionRate: satisfactionPercent,
            emergencySupport: "24/7"
        };
    }
}

export default new DashboardRepo();
