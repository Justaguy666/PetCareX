import authRouter from './auth/auth.route.js';
import userRouter from './user/user.route.js';
import searchRouter from './search/search.route.js';
import branchRouter from './branch/branch.route.js';
import petRouter from './pet/pet.route.js';
import appointmentRouter from './appointment/appointment.route.js';
import orderRouter from './order/order.route.js';
import managerRouter from './manager/manager.route.js';

import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

export default function route(app) {
    // Public / auth
    app.use('/api/auth', authRouter);

    // User-related
    app.use('/api/user', authMiddleware, userRouter);
    app.use('/api/me', authMiddleware, roleMiddleware('Khách hàng'), userRouter);

    // Manager area
    app.use('/api/manager', authMiddleware, roleMiddleware('Quản lý chi nhánh'), managerRouter);

    // Branches (kept both routes as originally present)
    app.use('/api/branch', authMiddleware, branchRouter);
    app.use('/api/branches', authMiddleware, branchRouter);

    // Pets & appointments
    app.use('/api/pets', authMiddleware, roleMiddleware(['Nhân viên tiếp tân', 'Bác sĩ thú y']), petRouter);
    app.use('/api/appointments', authMiddleware, appointmentRouter);

    // Orders
    app.use('/api/orders', authMiddleware, orderRouter);
    
    app.use('/api/search', searchRouter);
}
