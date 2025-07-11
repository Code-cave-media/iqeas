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
    forward_to_id = null,
    notes = null,
    updates = null,
    uploaded_file_ids = [],
  } = data;

  const query = `
    INSERT INTO estimations (
      project_id, user_id, status, log, cost,
      deadline, approval_date, approved, sent_to_pm,
      forward_to_id, notes, updates
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12
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
    forward_to_id,
    notes,
    updates,
  ];

  const result = await pool.query(query, values);
  const estimation = result.rows[0];

  if (uploaded_file_ids.length > 0) {
    const promises = uploaded_file_ids.map((fileId) =>
      pool.query(
        `INSERT INTO estimation_uploaded_files (estimation_id, uploaded_file_id) VALUES ($1, $2)`,
        [estimation.id, fileId]
      )
    );
    await Promise.all(promises);
  }

  return estimation;
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

export async function updateEstimation(id, data) {
  const fields = [];
  const values = [];
  let index = 1;

  for (const key in data) {
    fields.push(`${key} = $${index}`);
    values.push(data[key]);
    index++;
  }

  if (fields.length === 0) {
    throw new Error("No fields provided to update");
  }

  const query = `
    UPDATE estimations
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = $${index}
    RETURNING *;
  `;

  values.push(id);

  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function getProjectsSentToPM() {
  const query = `SELECT * FROM estimations WHERE sent_to_pm = true ORDER BY created_at DESC;`;
  const result = await pool.query(query);
  return result.rows;
}

export async function getProjectsApproved() {
  const query = `SELECT * FROM estimations WHERE approved = false ORDER BY created_at DESC;`;
  const result = await pool.query(query);
  return result.rows;
}

export async function getProjectsDraft() {
  const query = `SELECT * FROM estimations WHERE status = 'draft' ORDER BY created_at DESC;`;
  const result = await pool.query(query);
  return result.rows;
}
