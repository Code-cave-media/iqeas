import pool from "../config/db.js";

export async function createTask({
  project_id,
  user_id,
  title,
  description,
  status,
  priority,
  start_date,
  due_date = null,
  assigned_team_id = null,
  assigned_individual_id = null,
  completed = false,
  hours = null,
  uploaded_file_ids = [],
  selected_file_ids = [],
}) {
  const result = await pool.query(
    `INSERT INTO tasks
      (project_id, user_id, title, description, status, priority, start_date, due_date, assigned_team_id, assigned_individual_id, completed, hours)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      project_id,
      user_id,
      title,
      description,
      status,
      priority,
      start_date,
      due_date,
      assigned_team_id,
      assigned_individual_id,
      completed,
      hours,
    ]
  );

  const task = result.rows[0];

  const promises = [];

  uploaded_file_ids.forEach((fileId) => {
    promises.push(
      pool.query(
        `INSERT INTO tasks_uploaded_files (task_id, uploaded_file_id) VALUES ($1, $2)`,
        [task.id, fileId]
      )
    );
  });

  selected_file_ids.forEach((fileId) => {
    promises.push(
      pool.query(
        `INSERT INTO tasks_selected_files (task_id, uploaded_file_id) VALUES ($1, $2)`,
        [task.id, fileId]
      )
    );
  });

  await Promise.all(promises);

  return task;
}

// Get task by id with files
export async function getTaskById(id) {
  const taskResult = await pool.query(`SELECT * FROM tasks WHERE id = $1`, [
    id,
  ]);
  if (taskResult.rowCount === 0) return null;
  const task = taskResult.rows[0];

  const uploadedFiles = await pool.query(
    `SELECT uf.* FROM uploaded_files uf
     JOIN tasks_uploaded_files tuf ON uf.id = tuf.uploaded_file_id
     WHERE tuf.task_id = $1`,
    [id]
  );

  const selectedFiles = await pool.query(
    `SELECT uf.* FROM uploaded_files uf
     JOIN tasks_selected_files tsf ON uf.id = tsf.uploaded_file_id
     WHERE tsf.task_id = $1`,
    [id]
  );

  return {
    ...task,
    uploaded_files: uploadedFiles.rows,
    selected_files: selectedFiles.rows,
  };
}

// Update task partially
export async function updateTask(id, updates) {
  // Build dynamic query for patch
  const fields = [];
  const values = [];
  let idx = 1;

  for (const key in updates) {
    fields.push(`${key} = $${idx}`);
    values.push(updates[key]);
    idx++;
  }

  if (fields.length === 0) return null; // nothing to update

  values.push(id);

  const query = `UPDATE tasks SET ${fields.join(
    ", "
  )}, updated_at = NOW() WHERE id = $${idx} RETURNING *`;

  const result = await pool.query(query, values);

  return result.rows[0];
}
