import pool from "../config/db.js";
import { uuidGenerator } from "../utils/uuidGenerator.js";

export async function createProjectMoreInfo({
  project_id,
  notes,
  enquiry,
  uploaded_file_ids = [],
}) {
  const result = await pool.query(
    `INSERT INTO project_more_info (project_id, notes, enquiry)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [project_id, notes, enquiry]
  );

  if (uploaded_file_ids.length > 0) {
    const { rows: existingFiles } = await pool.query(
      `SELECT id FROM uploaded_files WHERE id = ANY($1)`,
      [uploaded_file_ids]
    );

    if (existingFiles.length !== uploaded_file_ids.length) {
      throw new Error("One or more uploaded_file_ids do not exist");
    }

    const insertPromises = uploaded_file_ids.map((fileId) =>
      pool.query(
        `INSERT INTO project_more_info_uploaded_files (project_more_info_id, uploaded_file_id)
         VALUES ($1, $2)`,
        [id, fileId]
      )
    );
    await Promise.all(insertPromises);
  }

  return result.rows[0];
}
