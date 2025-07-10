import pool from "../config/db.js";

export async function createTeam({
  title,
  description = "",
  active = true,
  role = "",
  users = [],
  leader_id,
}) {
  const result = await pool.query(
    `INSERT INTO teams (title, description, active, role, users, leader_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [title, description, active, role, JSON.stringify(users), leader_id]
  );

  return result.rows[0];
}

export async function getAllTeams() {
  const result = await pool.query(
    `SELECT * FROM teams ORDER BY created_at DESC`
  );
  return result.rows;
}
