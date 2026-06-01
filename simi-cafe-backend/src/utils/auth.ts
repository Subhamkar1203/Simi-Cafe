import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { Request, Response, NextFunction } from "express";

const SALT_ROUNDS = 10;
const COOKIE_NAME = "simi-session";
const JWT_EXPIRES_IN = "7d";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set in environment variables");
  return new TextEncoder().encode(secret);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export interface SessionPayload {
  userId: number;
}

export async function createSession(res: Response, userId: number): Promise<void> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(getJwtSecret());

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days in ms
  });
}

export function clearSession(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

// Middleware to protect client routes
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    (req as any).user = { userId: payload.userId as number };
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
}
