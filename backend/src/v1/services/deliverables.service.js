import pool from "../config/db.js";

export async function createDeliverablesSubmission({
  uploaded_file_ids = [],
  selected_file_ids = [],
}) {
  const result = await pool.query(
    `INSERT INTO deliverables_submissions DEFAULT VALUES RETURNING id, created_at, updated_at`
  );

  const id = result.rows[0].id;
  const promises = [];

  uploaded_file_ids.forEach((fileId) =>
    promises.push(
      pool.query(
        `INSERT INTO deliverables_submissions_uploaded_files 
         (deliverables_submission_id, uploaded_file_id) 
         VALUES ($1, $2)`,
        [id, fileId]
      )
    )
  );

  selected_file_ids.forEach((fileId) =>
    promises.push(
      pool.query(
        `INSERT INTO deliverables_submissions_selected_files 
         (deliverables_submission_id, uploaded_file_id) 
         VALUES ($1, $2)`,
        [id, fileId]
      )
    )
  );

  await Promise.all(promises);
  return result.rows[0];
}

export async function getDeliverablesSubmission(id) {
  const res = await pool.query(
    `SELECT * FROM deliverables_submissions WHERE id = $1`,
    [id]
  );
  if (res.rowCount === 0) return null;

  const submission = res.rows[0];

  const uploaded = await pool.query(
    `SELECT uf.* FROM uploaded_files uf
     JOIN deliverables_submissions_uploaded_files du
     ON uf.id = du.uploaded_file_id 
     WHERE du.deliverables_submission_id = $1`,
    [id]
  );

  const selected = await pool.query(
    `SELECT uf.* FROM uploaded_files uf
     JOIN deliverables_submissions_selected_files ds
     ON uf.id = ds.uploaded_file_id 
     WHERE ds.deliverables_submission_id = $1`,
    [id]
  );

  return {
    ...submission,
    uploaded_files: uploaded.rows,
    selected_files: selected.rows,
  };
}
