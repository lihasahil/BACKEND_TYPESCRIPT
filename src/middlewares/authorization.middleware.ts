// src/middleware/authorize.ts
import { Request, Response, NextFunction } from "express";

interface AuthenticatedUser {
  role: string;
  [key: string]: any; // Allow for other user properties
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

const authorize = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Check if req.user was set by authentication middleware
    if (!req.user || !req.user.role) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User info missing." });
    }

    // Check if the user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied." });
    }

    // Authorized
    next();
  };
};

export default authorize;
