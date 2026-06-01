import { Router } from "express";
import { query } from "../../db";
import { verifyAdminPassword, createAdminSession, clearAdminSession, requireAdminAuth, checkRateLimit, recordFailedLogin, resetLoginAttempts } from "../../utils/admin-auth";
import type { RowDataPacket } from "mysql2/promise";
import bcrypt from "bcryptjs";

const router = Router();

interface AdminRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
}

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.socket.remoteAddress || "0.0.0.0";

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const rateLimitCheck = await checkRateLimit(email, ip);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({ error: `Too many failed login attempts. Try again later.` });
    }

    const admins = await query<AdminRow[]>(
      "SELECT id, name, email, password_hash, role FROM admins WHERE email = ?",
      [email]
    );

    if (admins.length === 0) {
      await recordFailedLogin(email, ip);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const admin = admins[0];

    const isValidPassword = await verifyAdminPassword(password, admin.password_hash).catch(() => false);

    if (!isValidPassword) {
      await recordFailedLogin(email, ip);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    await resetLoginAttempts(email, ip);
    await createAdminSession(res, admin.id, admin.role);

    res.json({ success: true, admin: { name: admin.name, role: admin.role } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  clearAdminSession(res);
  res.json({ success: true });
});

router.get("/me", requireAdminAuth, async (req, res) => {
  try {
    const adminId = (req as any).admin.adminId;

    const admins = await query<AdminRow[]>(
      "SELECT id, name, email, role FROM admins WHERE id = ?",
      [adminId]
    );

    if (admins.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const admin = admins[0];
    res.json({ success: true, admin: { name: admin.name, role: admin.role, email: admin.email } });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
