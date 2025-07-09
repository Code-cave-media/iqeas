import pool from "../config/db.js";

export async function createTeam({
  title,
  description = "",
  active = true,
  role = "",
  users = [],
}) {
  const result = await pool.query(
    `INSERT INTO teams (title, description, active, role, users)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [title, description, active, role, JSON.stringify(users)]
  );

  return result.rows[0];
}

export async function getAllTeams() {
  const result = await pool.query(
    `SELECT * FROM teams ORDER BY created_at DESC`
  );
  return result.rows;
}
