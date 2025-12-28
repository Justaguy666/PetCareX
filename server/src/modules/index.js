// ========================================
// Route Imports
// ========================================

// Auth & User
import authRouter from './auth/auth.route.js';
import userRouter from './user/user.route.js';

// Core Business
import appointmentRouter from './appointment/appointment.route.js';
import petRouter from './pet/pet.route.js';
import branchRouter from './branch/branch.route.js';

// Staff
import doctorRouter from './doctor/doctor.route.js';
import managerRouter from './manager/manager.route.js';
import receptionistRouter from './receptionist/receptionist.route.js';
import salesRouter from './sales/sales.route.js';
import staffRouter from './staff/staff.route.js';

// Commerce
import orderRouter from './order/order.route.js';
import productRouter from './product/product.route.js';
import promotionRouter from './promotion/promotion.route.js';

// Inventory & Catalog
import itemRouter from './item/item.route.js';
import vaccineRouter from './vaccine/vaccine.route.js';
import vaccinePackageRouter from './vaccine-package/vaccine-package.route.js';
import inventoryRouter from './inventory/inventory.route.js';

// Utilities
import catalogRouter from './catalog/catalog.route.js';
import dashboardRouter from './dashboard/dashboard.route.js';
import searchRouter from './search/search.route.js';

// Middlewares
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

// ========================================
// Route Registration
// ========================================

export default function route(app) {
    // ----------------------------------
    // Public Routes (No Auth)
    // ----------------------------------
    app.use('/api/auth', authRouter);
    app.use('/api/products', productRouter);
    app.use('/api/search', searchRouter);
    app.use('/api/dashboard', dashboardRouter);

    // ----------------------------------
    // Customer Routes
    // ----------------------------------
    app.use('/api/user', authMiddleware, userRouter);
    app.use('/api/me', authMiddleware, roleMiddleware('Khách hàng'), userRouter);
    app.use('/api/appointments', authMiddleware, appointmentRouter);
    app.use('/api/orders', authMiddleware, orderRouter);
    app.use('/api/promotions', authMiddleware, promotionRouter);

    // ----------------------------------
    // Staff Routes
    // ----------------------------------
    app.use('/api/doctor', authMiddleware, roleMiddleware('Bác sĩ thú y'), doctorRouter);
    app.use('/api/receptionist', authMiddleware, roleMiddleware('Nhân viên tiếp tân'), receptionistRouter);
    app.use('/api/sales', authMiddleware, roleMiddleware('Nhân viên bán hàng'), salesRouter);
    app.use('/api/pets', authMiddleware, roleMiddleware(['Nhân viên tiếp tân', 'Bác sĩ thú y']), petRouter);
    app.use('/api/staff', authMiddleware, staffRouter);

    // ----------------------------------
    // Manager Routes
    // ----------------------------------
    app.use('/api/manager', authMiddleware, roleMiddleware('Quản lý chi nhánh'), managerRouter);
    app.use('/api/branch', authMiddleware, branchRouter);

    // ----------------------------------
    // Inventory & Catalog Routes (for admin/staff)
    // ----------------------------------
    app.use('/api/item', authMiddleware, itemRouter);
    app.use('/api/vaccine', authMiddleware, vaccineRouter);
    app.use('/api/vaccine-package', authMiddleware, vaccinePackageRouter);
    app.use('/api/inventory', authMiddleware, inventoryRouter);

    // ----------------------------------
    // Shared/Utility Routes
    // ----------------------------------
    app.use('/api/catalog', authMiddleware, catalogRouter);
}
