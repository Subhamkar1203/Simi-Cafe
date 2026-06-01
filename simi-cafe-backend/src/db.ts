import mysql, { type Pool, type PoolOptions, type RowDataPacket, type ResultSetHeader } from "mysql2/promise";
import dotenv from 'dotenv';
dotenv.config();

/* ─── Connection pool (singleton) ──────────────────────────── */

const poolConfig: PoolOptions = {
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? "simi_cafe",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Force UTC for consistent timestamp handling
  timezone: "+00:00",
};

// Use a global variable in dev so hot-reload doesn't exhaust connections
const globalForDb = globalThis as unknown as { __dbPool?: Pool };

export const pool: Pool =
  globalForDb.__dbPool ?? mysql.createPool(poolConfig);

if (process.env.NODE_ENV !== "production") {
  globalForDb.__dbPool = pool;
}

/* ─── Helper: run a query and return typed rows ──────────── */

export async function query<T extends RowDataPacket[]>(
  sql: string,
  params?: any[]
): Promise<T> {
  const [rows] = await pool.query<T>(sql, params);
  return rows;
}

/* ─── Helper: run an INSERT / UPDATE / DELETE ────────────── */

export async function execute(
  sql: string,
  params?: any[]
): Promise<ResultSetHeader> {
  const [result] = await pool.execute<ResultSetHeader>(sql, params);
  return result;
}

/* ─── Health check ───────────────────────────────────────── */

export async function ping(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

/* ─── Initialization ─────────────────────────────────────── */

export async function initDb(): Promise<void> {
  try {
    await execute(`
      CREATE TABLE IF NOT EXISTS otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        identifier VARCHAR(255) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Database initialized: otps table exists.");

    try {
      await execute("ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) DEFAULT '/images/Defaultpp.png'");
      console.log("Added profile_image column to users table.");
    } catch {
      // Column likely already exists
    }
  } catch (error) {
    console.error("Database initialization failed:", error);
  }

  // Admin password migration: if any admin has a plain text password, hash it.
  try {
    const bcrypt = await import("bcryptjs");
    const [adminsWithPlain] = await pool.query<RowDataPacket[]>("SELECT id, password_hash FROM admins WHERE password_hash NOT LIKE '$2%'");
    
    if (adminsWithPlain.length > 0) {
      console.log(`[MIGRATION] Found ${adminsWithPlain.length} admin accounts with plain-text passwords. Migrating to bcrypt...`);
      for (const admin of adminsWithPlain) {
         const hash = await bcrypt.hash(admin.password_hash, 12);
         await pool.execute("UPDATE admins SET password_hash = ? WHERE id = ?", [hash, admin.id]);
      }
      console.log("[MIGRATION] Admin password migration complete.");
    }
  } catch (error) {
    // If admins table doesn't exist or other error, ignore gracefully
    console.log("[MIGRATION] Skipped admin password migration (table might not exist yet).");
  }
}
