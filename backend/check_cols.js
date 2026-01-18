
import pool from './src/v1/config/db.js';

async function checkColumns() {
  try {
    const estRes = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'estimations'");
    console.log('estimations columns:', estRes.rows.map(c => c.column_name).join(', '));

    const projRes = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'projects'");
    console.log('projects columns:', projRes.rows.map(c => c.column_name).join(', '));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkColumns();
