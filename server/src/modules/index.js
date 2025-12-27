import authRouter from './auth/auth.route.js';
import userRouter from './user/user.route.js';
import orderRouter from './order/order.route.js';
import managerRouter from './manager/manager.route.js';
import appointmentRouter from './appointment/appointment.route.js';
import branchRouter from './branch/branch.route.js';

import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
    
export default function route(app) {
    app.use('/api/auth', authRouter);
    app.use('/api/orders', authMiddleware, orderRouter);
    app.use('/api/appointments', authMiddleware, appointmentRouter);
    app.use('/api/branches', authMiddleware, branchRouter);
    app.use('/api/me', authMiddleware, roleMiddleware('Khách hàng'), userRouter);
    app.use('/api/manager', authMiddleware, roleMiddleware('Quản lý chi nhánh'), managerRouter);
}
