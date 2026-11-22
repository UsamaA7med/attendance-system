import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/app-error.js";
import { env } from "../../config/env.js";

export interface AuthPayload {
  userId: string;
  email: string;
  role: "admin" | "staff" | "manager";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new UnauthorizedError("Access token is missing or malformed"));
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch (_err) {
    next(new UnauthorizedError("Invalid or expired access token"));
  }
}

export function authorize(...allowedRoles: Array<"admin" | "staff" | "manager">) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError("Authentication required"));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new UnauthorizedError("Insufficient permissions for this resource"));
      return;
    }

    next();
  };
}
