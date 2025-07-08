import pool from "../config/db.js";

export async function createEstimation(data) {
  const {
    project_id,
    user_id,
    status = "draft",
    log = null,
    cost = null,
    deadline = null,
    approval_date = null,
    approved = false,
    sent_to_pm = false,
    forward_to = null,
    notes = null,
    updates = null,
    uploaded_file_ids = [],
  } = data;

  const query = `
    INSERT INTO estimations (
      project_id, user_id, status, log, cost,
      deadline, approval_date, approved, sent_to_pm,
      forward_to, notes, updates
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10,
      $11, $12, $13
    ) RETURNING *;
  `;

  const values = [
    project_id,
    user_id,
    status,
    log,
    cost,
    deadline,
    approval_date,
    approved,
    sent_to_pm,
    forward_to,
    notes,
    updates,
  ];

  const result = await pool.query(query, values);

  if (uploaded_file_ids.length > 0) {
    const promises = uploaded_file_ids.map((fileId) =>
      pool.query(
        `INSERT INTO estimation_uploaded_files (estimation_id, uploaded_file_id) VALUES ($1, $2)`,
        [id, fileId]
      )
    );
    await Promise.all(promises);
  }

  return result.rows[0];
}

export async function getEstimationById(id) {
  const estimationResult = await pool.query(
    `SELECT * FROM estimations WHERE id = $1`,
    [id]
  );

  if (estimationResult.rowCount === 0) return null;

  const estimation = estimationResult.rows[0];

  const uploadedFilesResult = await pool.query(
    `SELECT uf.* FROM uploaded_files uf
     JOIN estimation_uploaded_files euf ON uf.id = euf.uploaded_file_id
     WHERE euf.estimation_id = $1`,
    [id]
  );

  estimation.uploaded_files = uploadedFilesResult.rows;
  return estimation;
}
