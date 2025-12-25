import pool from "../../config/db.js";


export async function getWorkersData() {
  const query = `
    SELECT id, name
    FROM users
    WHERE role = 'working' 
    `;

  const result = await pool.query(query);
  return result.rows;
}


export async function getWorkersWorkById(worker_id) {
  const query = `
    SELECT
      (to_jsonb(ed) - 'amount') AS data
    FROM estimation_deliverables ed
    WHERE worker_id = $1
  `;

  const result = await pool.query(query, [worker_id]);
  return result.rows.map((r) => r.data);
}



