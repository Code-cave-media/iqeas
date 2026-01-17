import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log("Adding 'hourly_rate' column to 'estimation_deliverables'...");
    
    // Check if column exists first
    const check = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'estimation_deliverables' AND column_name = 'hourly_rate'
    `);

    if (check.rows.length === 0) {
      await pool.query(`
        ALTER TABLE estimation_deliverables 
        ADD COLUMN hourly_rate NUMERIC(10, 2);
      `);
      console.log("Column 'hourly_rate' added successfully.");
    } else {
      console.log("Column 'hourly_rate' already exists.");
    }

  } catch (err) {
    console.error("Migration Failed:", err.message);
  } finally {
    process.exit();
  }
}

run();
