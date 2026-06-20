import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "change-this-secret-in-production";

export interface JwtPayload {
  sub: string; // user id
  email: string;
  iat?: number;
  exp?: number;
}

export function signToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}
