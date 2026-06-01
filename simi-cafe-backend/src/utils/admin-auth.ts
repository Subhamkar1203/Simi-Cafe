import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { Request, Response, NextFunction } from "express";
import { query, execute } from "../db";
import type { RowDataPacket } from "mysql2/promise";

const SALT_ROUNDS = 12;
const COOKIE_NAME = "admin-session";
const JWT_EXPIRES_IN = "2h";
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set in environment variables");
  return new TextEncoder().encode(secret);
}

export async function hashAdminPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyAdminPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function checkRateLimit(email: string, ip: string): Promise<{ allowed: boolean, blockedUntil?: Date }> {
  const attempts = await query<RowDataPacket[]>(
    `SELECT attempts, blocked_until FROM login_attempts WHERE email = ? AND ip_address = ? LIMIT 1`,
    [email, ip]
  );

  if (attempts.length === 0) return { allowed: true };

  const record = attempts[0];
  if (record.blocked_until && new Date(record.blocked_until) > new Date()) {
    return { allowed: false, blockedUntil: new Date(record.blocked_until) };
  }

  return { allowed: true };
}

export async function recordFailedLogin(email: string, ip: string): Promise<void> {
  const attempts = await query<RowDataPacket[]>(
    `SELECT attempts, blocked_until FROM login_attempts WHERE email = ? AND ip_address = ? LIMIT 1`,
    [email, ip]
  );

  if (attempts.length === 0) {
    await execute(`INSERT INTO login_attempts (email, ip_address, attempts) VALUES (?, ?, 1)`, [email, ip]);
  } else {
    const record = attempts[0];
    const newAttempts = record.attempts + 1;
    let blockedUntil = null;
    
    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      blockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60000);
      await execute(`UPDATE login_attempts SET attempts = ?, blocked_until = ? WHERE email = ? AND ip_address = ?`, [newAttempts, blockedUntil, email, ip]);
    } else {
      await execute(`UPDATE login_attempts SET attempts = ?, last_attempt = NOW() WHERE email = ? AND ip_address = ?`, [newAttempts, email, ip]);
    }
  }
}

export async function resetLoginAttempts(email: string, ip: string): Promise<void> {
  await execute(`DELETE FROM login_attempts WHERE email = ? AND ip_address = ?`, [email, ip]);
}

export interface AdminSessionPayload {
  adminId: number;
  role: string;
}

export async function createAdminSession(res: Response, adminId: number, role: string): Promise<void> {
  const token = await new SignJWT({ adminId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(getJwtSecret());

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 2 * 1000, // 2 hours in ms
  });
}

export function clearAdminSession(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
}

export async function requireAdminAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies[COOKIE_NAME] || req.cookies["admin_session"];
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    (req as any).admin = { adminId: payload.adminId as number, role: payload.role as string };
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
}
