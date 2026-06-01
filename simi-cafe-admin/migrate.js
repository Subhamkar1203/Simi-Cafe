import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '../simi-cafe-backend/.env' }); // or use local .env if available
// Assuming standard env vars
async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'simi_cafe',
    multipleStatements: true
  });

  const sql = `
    CREATE TABLE IF NOT EXISTS menu_diet_types (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE
    );

    INSERT IGNORE INTO menu_diet_types (name) VALUES ('Non-Veg'), ('Veg'), ('Vegan');

    -- Check if column exists before adding
    SET @dbname = 'simi_cafe';
    SET @tablename = 'menu_items';
    SET @columnname = 'diet_type_id';
    SET @preparedStatement = (SELECT IF(
      (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE
          (table_name = @tablename)
          AND (table_schema = @dbname)
          AND (column_name = @columnname)
      ) > 0,
      "SELECT 1",
      CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " INT NULL;")
    ));
    PREPARE alterIfNotExists FROM @preparedStatement;
    EXECUTE alterIfNotExists;
    DEALLOCATE PREPARE alterIfNotExists;

    UPDATE menu_items SET diet_type_id = (SELECT id FROM menu_diet_types WHERE name = 'Vegan') WHERE is_vegan = 1 AND diet_type_id IS NULL;
    UPDATE menu_items SET diet_type_id = (SELECT id FROM menu_diet_types WHERE name = 'Veg') WHERE is_vegan = 0 AND is_veg = 1 AND diet_type_id IS NULL;
    UPDATE menu_items SET diet_type_id = (SELECT id FROM menu_diet_types WHERE name = 'Non-Veg') WHERE is_vegan = 0 AND is_veg = 0 AND diet_type_id IS NULL;

    -- Add constraint safely
    SET @constraintname = 'fk_diet_type';
    SET @preparedStatement2 = (SELECT IF(
      (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
        WHERE
          (table_name = @tablename)
          AND (table_schema = @dbname)
          AND (constraint_name = @constraintname)
      ) > 0,
      "SELECT 1",
      CONCAT("ALTER TABLE ", @tablename, " ADD CONSTRAINT ", @constraintname, " FOREIGN KEY (", @columnname, ") REFERENCES menu_diet_types(id);")
    ));
    PREPARE alterIfNotExists2 FROM @preparedStatement2;
    EXECUTE alterIfNotExists2;
    DEALLOCATE PREPARE alterIfNotExists2;
  `;

  await connection.query(sql);
  console.log("Migration complete.");
  process.exit(0);
}

runMigration().catch(console.error);
