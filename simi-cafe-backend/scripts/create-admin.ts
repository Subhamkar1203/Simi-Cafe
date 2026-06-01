import { pool } from "../src/db";
import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2/promise";

async function main() {
  try {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
      console.error("Usage: npm run create-admin <email> <password>");
      process.exit(1);
    }

    const email = args[0].trim().toLowerCase();
    const password = args[1];

    if (password.length < 8) {
      console.error("Error: Password must be at least 8 characters long.");
      process.exit(1);
    }

    // Check for duplicate admins
    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM admins WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      console.error(`Error: An admin with the email '${email}' already exists.`);
      process.exit(1);
    }

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Default name to the first part of the email
    const name = email.split('@')[0];
    const role = "admin";

    // Insert admin securely using parameterized query
    await pool.execute(
      "INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );

    console.log(`Success: Secure admin account created successfully for '${email}'.`);
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
}

main();
