import authRouter from './auth/auth.route.js';
import userRouter from './user/user.route.js';
import authMiddleware from '../middlewares/auth.middleware.js';

export default function route(app) {
    app.use('/api/auth', authRouter);
    app.use('/api/user', authMiddleware, userRouter);
}
