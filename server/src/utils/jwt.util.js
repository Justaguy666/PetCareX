import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export const generateToken = () => {
  return crypto.randomBytes(64).toString('hex');
} 

export const signToken = (payload, expiredAt) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expiredAt
  });

export const verifyToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);
