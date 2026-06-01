import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '../simi-cafe-backend/.env' });

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'simi_cafe',
    multipleStatements: true
  });

  const sql = `
    CREATE TABLE IF NOT EXISTS menu_tags (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS menu_item_tags (
      item_id INT NOT NULL,
      tag_id INT NOT NULL,
      PRIMARY KEY (item_id, tag_id),
      FOREIGN KEY (item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES menu_tags(id) ON DELETE CASCADE
    );
  `;

  await connection.query(sql);
  console.log("Migration complete.");
  process.exit(0);
}

runMigration().catch(console.error);
