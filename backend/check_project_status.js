import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const query = `
  SELECT id, project_id, name, status, send_to_estimation, created_at 
  FROM projects 
  ORDER BY created_at DESC 
  LIMIT 5;
`;

async function run() {
  try {
    console.log("Checking recent projects...");
    const res = await pool.query(query);
    console.log("Recent Projects:", JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error("Error checking projects:", err);
  } finally {
    process.exit();
  }
}

run();
