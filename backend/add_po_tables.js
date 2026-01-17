import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const createQuery = `
CREATE TABLE IF NOT EXISTS purchase_orders (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    po_number VARCHAR(100) NOT NULL,
    received_date DATE,
    received_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    terms_and_conditions TEXT,
    status VARCHAR(50) DEFAULT 'received', 
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    forwarded_to_admin_at TIMESTAMPTZ,
    forwarded_to_pm_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS purchase_order_files (
    id SERIAL PRIMARY KEY,
    po_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    uploaded_file_id INTEGER NOT NULL REFERENCES uploaded_files(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

async function run() {
  try {
    console.log("Creating tables...");
    await pool.query("BEGIN");
    await pool.query(createQuery);
    await pool.query("COMMIT");
    console.log("Tables created successfully.");
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Error creating tables:", err);
  } finally {
    process.exit();
  }
}

run();
