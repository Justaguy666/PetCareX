/**
 * Auth Middleware - Verify JWT tokens from HttpOnly cookies
 */

import jwt from 'jsonwebtoken';
import { getAccessToken } from '../utils/cookie.util.js';

/**
 * Verify access token from cookie and attach user to request
 */
export function authenticate(req, res, next) {
    try {
        // Get access token from cookie
        const token = getAccessToken(req);

        if (!token) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'No access token provided'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        // Attach user info to request
        req.user = decoded;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired',
                message: 'Access token has expired. Please refresh your token.'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid token',
                message: 'Access token is invalid'
            });
        }

        return res.status(500).json({
            error: 'Server error',
            message: 'Failed to authenticate token'
        });
    }
}

/**
 * Optional authentication - Attach user if token exists but don't require it
 */
export function optionalAuth(req, res, next) {
    try {
        const token = getAccessToken(req);

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            req.user = decoded;
        }

        next();
    } catch (error) {
        // Continue without user if token is invalid
        next();
    }
}
