import { ForbiddenError, UnauthorizedError } from "../errors/app.error.js";

export function roleMiddleware(requiredRoles) {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  return function (req, res, next) {
    if (!req.account) {
      throw new UnauthorizedError("Missing credentials");
    }

    const role = req.account.role;
    
    if (!role) {
      throw new ForbiddenError("Missing role");
    }

    if (!roles.includes(role)) {
      throw new ForbiddenError("Insufficient role");
    }

    next();
  };
}

export default roleMiddleware;
