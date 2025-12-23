import jwt from 'jsonwebtoken';

export const signToken = (payload, options = {}) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h',
    ...options
  });

export const verifyToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);
