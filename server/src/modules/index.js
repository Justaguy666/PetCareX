import authRouter from './auth/auth.route.js';
import userRouter from './user/user.route.js';
import managerRouter from './manager/manager.route.js';
import searchRouter from './search/search.route.js';
import branchRouter from './branch/branch.route.js';

import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

export default function route(app) {
    app.use('/api/auth', authRouter);
    app.use('/api/user', authMiddleware, userRouter);
    app.use('/api/branch', authMiddleware, branchRouter);
    app.use('/api/manager', authMiddleware, roleMiddleware('Quản lý chi nhánh'), managerRouter);
    app.use('/api/search', searchRouter);
}
