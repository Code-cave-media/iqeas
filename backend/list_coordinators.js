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
    console.log("Checking project coordinators users...");
    const res = await pool.query(`
      SELECT id, name, email, role 
      FROM users 
      WHERE role = 'project_coordinator' OR role = 'admin'
      LIMIT 10
    `);
    console.log("Coordinators:", JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error("Query Failed:", err.message);
  } finally {
    process.exit();
  }
}

run();
