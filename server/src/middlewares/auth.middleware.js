import jwt from 'jsonwebtoken';
import { UnauthorizedError } from "../errors/app.error.js";

export function authMiddleware(req, res, next) {
  const token = req.cookies?.accessToken;
  if (!token) {
    throw new UnauthorizedError("Missing credentials");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_KEY);
    req.user = payload;
    next();
  } catch {
    throw new UnauthorizedError("Token invalid");
  }
}

export default authMiddleware;