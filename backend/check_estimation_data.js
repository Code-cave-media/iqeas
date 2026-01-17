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
    console.log("Checking data in estimations table...");
    const res = await pool.query(`
      SELECT id, project_id, sent_to_pm, forwarded_user_id, pm_id 
      FROM estimations 
      ORDER BY updated_at DESC 
      LIMIT 10
    `);
    console.log("Estimations:", JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error("Query Failed:", err.message);
  } finally {
    process.exit();
  }
}

run();
