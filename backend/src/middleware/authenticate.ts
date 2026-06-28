import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { environment } from "../config/environment";
import { AuthenticationError } from "../shared/errors";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    next(new AuthenticationError("No token provided"));
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, environment.jwtSecret) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    next(new AuthenticationError("Invalid or expired token"));
  }
}
