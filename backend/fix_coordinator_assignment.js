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
    console.log("Assigning latest project to Coordinator ID 1...");
    const res = await pool.query(`
      UPDATE projects 
      SET send_to_coordinator = true, coordinator_id = 1 
      WHERE id = (SELECT id FROM projects ORDER BY created_at DESC LIMIT 1)
      RETURNING id, name, coordinator_id, send_to_coordinator;
    `);
    console.log("Updated Project:", JSON.stringify(res.rows[0], null, 2));
  } catch (err) {
    console.error("Update Failed:", err.message);
  } finally {
    process.exit();
  }
}

run();
