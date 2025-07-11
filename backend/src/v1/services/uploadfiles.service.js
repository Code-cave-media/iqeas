import pool from "../config/db.js";

export async function saveUploadedFile({ label, filename, uploaded_by }) {
  const result = await pool.query(
    `INSERT INTO uploaded_files (label, file, uploaded_by_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [label, filename, uploaded_by]
  );

  return result.rows[0];
}
