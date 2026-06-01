import { Router } from "express";
import { query, execute } from "../../db";
import { verifyPassword, createSession, hashPassword, clearSession, requireAuth } from "../../utils/auth";
import { validate } from "../../utils/validate";
import { z } from "zod";
import type { RowDataPacket } from "mysql2/promise";
import { sendOTP } from "../../utils/email";

const router = Router();

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  total_visits: number;
  successful_payments: number;
  charm_count: number;
  charms_redeemed: number;
  profile_image: string;
  created_at: string;
}

interface ExistingUser extends RowDataPacket {
  id: number;
}

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required")
  })
});

router.post("/login", validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const emailNorm = email.trim().toLowerCase();

    const users = await query<UserRow[]>(
      `SELECT id, name, email, phone, password_hash,
              total_visits, successful_payments, charm_count, charms_redeemed, profile_image, created_at
       FROM users WHERE email = ? LIMIT 1`,
      [emailNorm]
    );

    if (users.length === 0) {
      console.warn(`[AUTH FAILED] Login attempt for non-existent email: ${emailNorm} | IP: ${req.ip}`);
      return res.status(401).json({ error: "No account found with this email. Create one first." });
    }

    const user = users[0];
    const valid = await verifyPassword(password, user.password_hash);

    if (!valid) {
      console.warn(`[AUTH FAILED] Incorrect password for email: ${emailNorm} | IP: ${req.ip}`);
      return res.status(401).json({ error: "Incorrect password. Please try again." });
    }

    await createSession(res, user.id);
    console.info(`[AUTH SUCCESS] User logged in: ${emailNorm} (ID: ${user.id}) | IP: ${req.ip}`);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        total_visits: user.total_visits,
        successful_payments: user.successful_payments,
        charm_count: user.charm_count,
        charms_redeemed: user.charms_redeemed,
        profile_image: user.profile_image || "/images/Defaultpp.png",
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(10, "Phone number must be at least 10 characters"),
    password: z.string().min(6, "Password must be at least 6 characters")
  })
});

router.post("/signup", validate(signupSchema), async (req, res) => {
  console.log(`[DEBUG] Signup route hit for ${req.body.email}`);
  try {
    const { name, email, phone, password } = req.body;

    const emailNorm = email.toLowerCase();
    const phoneNorm = phone;

    const existing = await query<ExistingUser[]>(
      "SELECT id FROM users WHERE email = ? OR phone = ? LIMIT 1",
      [emailNorm, phoneNorm]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "An account with this email or phone already exists." });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await execute(
      `INSERT INTO otps (identifier, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
      [emailNorm, otp]
    );

    console.log(`[OTP] Generated OTP for ${emailNorm}: ${otp}`);

    // Send the actual email
    await sendOTP(emailNorm, otp);

    res.json({ requiresOtp: true, message: "OTP sent to your email." });
  } catch (error: any) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

const verifyOtpSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(10, "Phone number must be at least 10 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    otp: z.string().length(6, "OTP must be exactly 6 digits")
  })
});

router.post("/verify-signup-otp", validate(verifyOtpSchema), async (req, res) => {
  try {
    const { name, email, phone, password, otp } = req.body;
    const emailNorm = email.toLowerCase();
    const phoneNorm = phone;

    const existing = await query<ExistingUser[]>(
      "SELECT id FROM users WHERE email = ? OR phone = ? LIMIT 1",
      [emailNorm, phoneNorm]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "An account with this email or phone already exists." });
    }

    const otps = await query<RowDataPacket[]>(
      "SELECT id FROM otps WHERE identifier = ? AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [emailNorm, otp]
    );

    if (otps.length === 0) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    // Clear the used OTP
    await execute("DELETE FROM otps WHERE id = ?", [otps[0].id]);

    const passwordHash = await hashPassword(password);

    const result = await execute(
      `INSERT INTO users (name, email, phone, referral_code) VALUES (?, ?, ?, ?)`,
      [name.trim(), emailNorm, phoneNorm, `SIMI-${Date.now().toString(36).toUpperCase()}`]
    );

    const userId = result.insertId;

    try {
      await execute("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT ''", []);
    } catch {}

    await execute("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, userId]);

    await createSession(res, userId);
    console.info(`[AUTH SUCCESS] New user signed up after OTP: ${emailNorm} (ID: ${userId}) | IP: ${req.ip}`);

    res.json({
      user: {
        id: userId,
        name: name.trim(),
        email: emailNorm,
        phone: phoneNorm,
        total_visits: 0,
        successful_payments: 0,
        charm_count: 0,
        charms_redeemed: 0,
        profile_image: "/images/Defaultpp.png",
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Signup OTP Verification error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/logout", (req, res) => {
  clearSession(res);
  res.json({ success: true });
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const users = await query<UserRow[]>(
      `SELECT id, name, email, phone, total_visits, successful_payments, charm_count, charms_redeemed, profile_image, created_at
       FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    if (users.length === 0) {
      clearSession(res);
      return res.status(401).json({ error: "User not found." });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error("Me route error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
