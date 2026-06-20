import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../auth.js";

export interface AuthedRequest extends Request {
  admin?: { sub: string; email: string };
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  try {
    const payload = verifyToken(auth.slice(7));
    req.admin = { sub: payload.sub, email: payload.email };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
