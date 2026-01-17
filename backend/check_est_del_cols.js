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
    console.log("Listing columns for 'estimation_deliverables' table...");
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'estimation_deliverables'
      ORDER BY column_name
    `);
    const columns = res.rows.map(r => r.column_name);
    console.log("Columns:\n" + columns.join("\n"));
  } catch (err) {
    console.error("Query Failed:", err.message);
  } finally {
    process.exit();
  }
}

run();
