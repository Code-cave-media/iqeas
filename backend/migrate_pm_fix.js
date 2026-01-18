
import pool from './src/v1/config/db.js';

async function migrate() {
  try {
    console.log('Starting migration...');
    
    // Add leader column to estimations
    await pool.query('ALTER TABLE estimations ADD COLUMN IF NOT EXISTS leader INTEGER REFERENCES users(id)');
    console.log('Added leader column to estimations (if not exists)');
    
    // Add send_to_workers column to projects
    await pool.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS send_to_workers BOOLEAN DEFAULT FALSE NOT NULL');
    console.log('Added send_to_workers column to projects (if not exists)');
    
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
