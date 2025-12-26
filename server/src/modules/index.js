import AuthRouter from './auth/auth.route.js';

export default function route(app) {
    app.use('/api/auth', AuthRouter);
}
