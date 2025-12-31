import pool from "../../config/db.js";

export async function getAllProjectsToBeApproved(
  leader_id,
  page = 1,
  limit = 10,
  client = pool
) {
  const offset = (page - 1) * limit;

  // Fetch only estimation + project info where leader is assigned
 const dataQuery = `
    SELECT *
    FROM projects p
    JOIN estimations e
      ON e.project_id = p.id
    WHERE e.leader = $1
    ORDER BY e.created_at DESC
    LIMIT $2 OFFSET $3;
  `;

 const countQuery = `
    SELECT COUNT(DISTINCT p.id)::int AS total
    FROM projects p
    JOIN estimations e
      ON e.project_id = p.id
    WHERE e.leader = $1;
  `;

 const [dataResult, countResult] = await Promise.all([
   client.query(dataQuery, [leader_id, limit, offset]),
   client.query(countQuery, [leader_id]),
 ]);

  return {
    data: dataResult.rows,
    total: countResult.rows[0].total,
    page,
    limit,
    totalPages: Math.ceil(countResult.rows[0].total / limit),
  };
}


export async function markEstimationDeliverableRejected(
  estimation_deliverable_id,
  worker_id,
  client = pool
) {
  const query = `
    UPDATE estimation_deliverables ed
    SET status = 'rework',
        updated_at = NOW()
    WHERE ed.id = $1
      AND ed.worker_id = $2
    RETURNING ed.*;
  `;

  const { rows } = await client.query(query, [
    estimation_deliverable_id,
    worker_id,
  ]);

  if (rows.length === 0) {
    throw new Error("Not authorized or invalid estimation deliverable");
  }

  return rows[0];
}

export async function markEstimationDeliverableApproved(
  estimation_deliverable_id,
  worker_id,
  client = pool
) {
  const query = `
    UPDATE estimation_deliverables ed
    SET status = 'approved',
        updated_at = NOW()
    WHERE ed.id = $1
      AND ed.worker_id = $2
    RETURNING ed.*;
  `;

  const { rows } = await client.query(query, [
    estimation_deliverable_id,
    worker_id,
  ]);

  if (rows.length === 0) {
    throw new Error("Not authorized or invalid estimation deliverable");
  }

  return rows[0];
}

export async function AddReworkNote(
  note,
  estimation_deliverable_id,
  worker_id,
  client = pool
) {
  const query = `
    UPDATE estimation_deliverables ed
    SET note = $1,
        updated_at = NOW()
    WHERE ed.id = $2
      AND ed.worker_id = $3
    RETURNING ed.*;
  `;

  const { rows } = await client.query(query, [
    note,
    estimation_deliverable_id,
    worker_id,
  ]);

  if (rows.length === 0) {
    throw new Error("Not authorized or invalid estimation deliverable");
  }

  return rows[0];
}


export async function getProjectDetails(project_id, client = pool) {
  try {
    const deliverablesQuery = `
      SELECT *
      FROM estimation_deliverables
      WHERE project_id = $1
      ORDER BY created_at DESC;
    `;
    const deliverablesResult = await client.query(deliverablesQuery, [
      project_id,
    ]);
    const deliverables = deliverablesResult.rows;

    // 2️⃣ Get all worker_uploaded_files for the project
    const workerFilesQuery = `
      SELECT worker_id, uploaded_file_id
      FROM workers_uploaded_files
      WHERE project_id = $1;
    `;
    const workerFilesResult = await client.query(workerFilesQuery, [
      project_id,
    ]);
    const workerFiles = workerFilesResult.rows;

    // 3️⃣ Get uploaded_files based on uploaded_file_id
    const uploadedFileIds = workerFiles.map((wf) => wf.uploaded_file_id);
    let uploadedFiles = [];
    if (uploadedFileIds.length > 0) {
      const uploadedFilesQuery = `
        SELECT *
        FROM uploaded_files
        WHERE id = ANY($1);
      `;
      const uploadedFilesResult = await client.query(uploadedFilesQuery, [
        uploadedFileIds,
      ]);
      uploadedFiles = uploadedFilesResult.rows;
    }

    return {
      success: true,
      data: {
        estimation_deliverables: deliverables,
        workers_uploaded_files: workerFiles,
        uploaded_files: uploadedFiles,
      },
    };
  } catch (err) {
    console.error("Error fetching project details:", err);
    throw new Error("Failed to fetch project details");
  }
}