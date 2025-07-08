import pool from "../config/db.js";

export async function createTimeline(data) {
  const {
    project_id,
    user_id,
    title,
    description = null,
    start_date,
    end_date = null,
    completed = false,
  } = data;

  const query = `
    INSERT INTO project_timelines (
    project_id, user_id, title, description, start_date, end_date, completed
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  const values = [
    project_id,
    user_id,
    title,
    description,
    start_date,
    end_date,
    completed,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function updateTimeline(id, data) {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const key in data) {
    fields.push(`${key} = $${idx}`);
    values.push(data[key]);
    idx++;
  }
  values.push(id);

  const query = `
    UPDATE project_timelines
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = $${idx}
    RETURNING *;
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function deleteTimeline(id) {
  const query = `DELETE FROM project_timelines WHERE id = $1 RETURNING *;`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
}

export async function getTimelineById(id) {
  const query = `SELECT * FROM project_timelines WHERE id = $1;`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
}
