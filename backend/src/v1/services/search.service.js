import pool from "../config/db.js";

export async function searchEstimations(queryString) {
  const query = `
      SELECT * FROM projects
      WHERE
        client_name ILIKE $1 OR
        location ILIKE $1 OR
        project_type ILIKE $1
      ORDER BY created_at DESC;
    `;

  const value = [`%${queryString}%`];
  const result = await pool.query(query, value);

  return result.rows;
}
