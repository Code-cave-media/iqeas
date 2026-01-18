
import pool from './src/v1/config/db.js';

async function listColumns(tableName) {
  const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = $1", [tableName]);
  console.log(`${tableName} columns:`, res.rows.map(c => c.column_name).sort());
}

async function main() {
  try {
    await listColumns('projects');
    await listColumns('estimations');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
