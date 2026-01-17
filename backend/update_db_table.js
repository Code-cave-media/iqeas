import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});


const query = `
CREATE TABLE IF NOT EXISTS estimation_deliverables (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    estimation_id INTEGER REFERENCES estimations(id) ON DELETE CASCADE,
    sno INTEGER NOT NULL,
    drawing_no VARCHAR(100),
    title VARCHAR(255),
    deliverables TEXT,
    discipline VARCHAR(100),
    additional TEXT,
    hours NUMERIC(10, 2),
    amount NUMERIC(15, 2),
    total_time NUMERIC(10, 2),
    work_person VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (project_id, sno)
);
`;

async function run() {
  try {
    console.log("Creating table...");
    await pool.query(query);
    console.log("Table created successfully!");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    process.exit();
  }
}

run();
