import pool from "../config/db.js";

export async function createTaskActivity({
  task_id,
  user_id,
  action,
  note,
  uploaded_file_ids = [],
}) {
  const result = await pool.query(
    `INSERT INTO task_activity_logs (task_id, user_id, action, note)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [task_id, user_id, action, note]
  );

  const activity = result.rows[0];

  const fileInserts = uploaded_file_ids.map((fileId) =>
    pool.query(
      `INSERT INTO task_activity_files (task_activity_log_id, uploaded_file_id)
       VALUES ($1, $2)`,
      [activity.id, fileId]
    )
  );

  await Promise.all(fileInserts);

  return activity;
}

export async function getTaskActivityByTaskId(task_id) {
  const { rows: logs } = await pool.query(
    `SELECT * FROM task_activity_logs WHERE task_id = $1 ORDER BY created_at DESC`,
    [task_id]
  );

  for (const log of logs) {
    const { rows: files } = await pool.query(
      `SELECT uf.* FROM uploaded_files uf
       JOIN task_activity_files taf ON uf.id = taf.uploaded_file_id
       WHERE taf.task_activity_log_id = $1`,
      [log.id]
    );

    log.uploaded_files = files;
  }

  return logs;
}
