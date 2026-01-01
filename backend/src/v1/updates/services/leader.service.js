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

export async function getProjectDetails(projectId, client = pool) {
  const query = `
    SELECT
      ed.id,
      ed.created_at,
      ed.updated_at,
      ed.estimation_id,
      ed.sno,
      ed.drawing_no,
      ed.title,
      ed.deliverables,
      ed.discipline,
      ed.hours,
      ed.amount,
      ed.project_id,
      ed.stage,
      ed.revision,
      ed.worker_id,
      u.name AS worker_name,
      ed.consumed_time,
      ed.total_time,
      ed.additional_values,
      ed.status,
      ed.note,

      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', uf.id,
            'label', uf.label,
            'file', uf.file,
            'status', uf.status,
            'uploaded_by_id', uf.uploaded_by_id,
            'worker_id', wuf.worker_id,
            'created_at', uf.created_at
          )
        ) FILTER (WHERE uf.id IS NOT NULL),
        '[]'
      ) AS uploaded_files

    FROM estimation_deliverables ed

    -- worker name
    LEFT JOIN users u
      ON u.id = ed.worker_id

    -- IMPORTANT: worker + project match
    LEFT JOIN workers_uploaded_files wuf
      ON wuf.worker_id = ed.worker_id
      AND wuf.project_id = ed.project_id::INTEGER

    LEFT JOIN uploaded_files uf
      ON uf.id = wuf.uploaded_file_id

    WHERE ed.project_id = $1::TEXT

    GROUP BY ed.id, u.name
    ORDER BY ed.created_at DESC;
  `;

  const result = await client.query(query, [projectId]);

  return {
    success: true,
    message: "Project details fetched successfully",
    data: {
      estimation_deliverables: result.rows,
    },
  };
}

