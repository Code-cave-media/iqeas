import pool from "../config/db.js";

// Create a new team
export async function createTeam({ title, description }) {
  const result = await pool.query(
    `INSERT INTO teams (title, description) VALUES ($1, $2) RETURNING *`,
    [title, description]
  );
  return result.rows[0];
}

// Get all teams
export async function getAllTeams() {
  const result = await pool.query(
    `SELECT * FROM teams ORDER BY created_at DESC`
  );
  return result.rows;
}
