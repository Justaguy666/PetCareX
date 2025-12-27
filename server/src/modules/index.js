import authRouter from './auth/auth.route.js';
import userRouter from './user/user.route.js';
import managerRouter from './manager/manager.route.js';
import branchRouter from './branch/branch.route.js';
import employeeRouter from './employee/employee.route.js';

import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

export default function route(app) {
    app.use('/api/auth', authRouter);
    app.use('/api/user', authMiddleware, userRouter);
    app.use('/api/branch', authMiddleware, branchRouter);
    app.use('/api/employee', authMiddleware, roleMiddleware(['Nhân viên bán hàng', 'Nhân viên tiếp tân', 'Bác sĩ thú y']), employeeRouter);
    app.use('/api/manager', authMiddleware, roleMiddleware('Quản lý chi nhánh'), managerRouter);
}
