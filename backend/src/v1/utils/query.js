import pool from "../config/db.js";
export async function getUserById(id) {
  const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
  return result.rows[0] || null;
}