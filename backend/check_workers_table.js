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
    console.log("Checking for 'workers_uploaded_files' table...");
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'workers_uploaded_files'
    `);
    
    if (res.rowCount > 0) {
      console.log("Table 'workers_uploaded_files' EXISTS.");
    } else {
      console.log("Table 'workers_uploaded_files' DOES NOT EXIST.");
    }

  } catch (err) {
    console.error("Query Failed:", err.message);
  } finally {
    process.exit();
  }
}

run();
