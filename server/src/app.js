import express from 'express';
import route from './modules/index.js';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from "cors";
import cookieParser from 'cookie-parser';

import { errorHandler } from './middlewares/error.middleware.js';
// import notFound from './middlewares/notFound.js';

const app = express();

// Cookie Parser
app.use(cookieParser());

// Morgan
app.use(morgan('dev'));

// Parser JSON
app.use(bodyParser.json());

// CORS - Allow frontend to access backend APIs with credentials (cookies)
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'], // Common Vite dev server ports
    credentials: true, // Allow cookies to be sent with requests
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Route
route(app);

// Error handling
// app.use(notFound);
app.use(errorHandler);

export default app;