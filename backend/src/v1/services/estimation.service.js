import pool from "../config/db.js";
import { generateInvoiceExcel } from "../lib/excel.js";
import { uploadFile } from "../lib/s3.js";

const is_production = process.env.PRODUCTION === "true";

/* ========================= CREATE ========================= */
export async function createEstimation(data, client = pool) {
  const {
    project_id,
    user_id,
    status = "approved",
    log = null,
    cost = null,
    deadline = null,
    approval_date = null,
    approved = false,
    sent_to_pm = false,
    forwarded_user_id = null,
    notes = null,
  } = data;

  // 1️⃣ Check if estimation exists
  const existing = await client.query(
    `SELECT id FROM estimations WHERE project_id = $1`,
    [project_id]
  );

  // 2️⃣ Update if exists
  if (existing.rows.length > 0) {
    const updateQuery = `
      UPDATE estimations
      SET
        user_id = $2,
        status = $3,
        log = $4,
        cost = $5,
        deadline = $6,
        approval_date = $7,
        approved = $8,
        sent_to_pm = $9,
        forwarded_user_id = $10,
        notes = $11,
        updated_at = NOW()
      WHERE project_id = $1
      RETURNING *;
    `;

    const result = await client.query(updateQuery, [
      project_id,
      user_id,
      status,
      log,
      cost,
      deadline,
      approval_date,
      approved,
      sent_to_pm,
      forwarded_user_id,
      notes,
    ]);

    return result.rows[0];
  }

  // 3️⃣ Else create new
  const insertQuery = `
    INSERT INTO estimations (
      project_id, user_id, status, log, cost,
      deadline, approval_date, approved,
      sent_to_pm, forwarded_user_id, notes
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
    )
    RETURNING *;
  `;

  const result = await client.query(insertQuery, [
    project_id,
    user_id,
    status,
    log,
    cost,
    deadline,
    approval_date,
    approved,
    sent_to_pm,
    forwarded_user_id,
    notes,
  ]);

  return result.rows[0];
}


/* ========================= GET BY ID ========================= */
export async function getEstimationById(estimationId, client = pool) {
  const query = `
    SELECT e.*,
      json_build_object(
        'id', u.id,
        'name', u.name,
        'email', u.email
      ) AS user
    FROM estimations e
    LEFT JOIN users u ON u.id = e.user_id
    WHERE e.id = $1
    LIMIT 1;
  `;

  const result = await client.query(query, [estimationId]);
  return result.rows[0];
}

/* ========================= GET BY PROJECT ========================= */
export async function getEstimationByProjectId(project_id) {
  const result = await pool.query(
    `SELECT * FROM estimations WHERE project_id = $1 ORDER BY created_at DESC`,
    [project_id]
  );
  return result.rows;
}

/* ========================= UPDATE ========================= */
export async function updateEstimation(id, data, client) {
  const fields = [];
  const values = [];
  let i = 1;

  for (const key in data) {
    fields.push(`${key} = $${i}`);
    values.push(data[key]);
    i++;
  }

  const query = `
    UPDATE estimations
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = $${i}
    RETURNING *;
  `;

  values.push(id);

  const result = await client.query(query, values);
  return result.rows[0];
}

/* ========================= CORRECTION ========================= */
export async function createEstimationCorrection(data, client) {
  const result = await client.query(
    `INSERT INTO estimation_corrections (estimation_id, correction)
     VALUES ($1, $2) RETURNING *`,
    [data.estimation_id, data.correction]
  );
  return result.rows[0];
}

/* ========================= LISTINGS ========================= */
export async function getProjectsSentToPM() {
  const result = await pool.query(
    `SELECT * FROM estimations WHERE sent_to_pm = true ORDER BY created_at DESC`
  );
  return result.rows;
}

export async function getProjectsApproved() {
  const result = await pool.query(
    `SELECT * FROM estimations WHERE approved = true ORDER BY created_at DESC`
  );
  return result.rows;
}

export async function getProjectsDraft() {
  const result = await pool.query(
    `SELECT * FROM estimations WHERE status = 'draft' ORDER BY created_at DESC`
  );
  return result.rows;
}

/* ========================= INVOICE ========================= */
export async function createInvoice(client, estimationId, data, userId) {
  const file = await generateInvoiceExcel(data);
  const fileUrl = is_production
    ? (await uploadFile(file, "invoice.xlsx", "estimations")).url
    : "invoice.xlsx";

  const result = await client.query(
    `INSERT INTO uploaded_files (label, file, uploaded_by_id)
     VALUES ('invoice', $1, $2) RETURNING *`,
    [fileUrl, userId]
  );

  return result.rows[0];
}
