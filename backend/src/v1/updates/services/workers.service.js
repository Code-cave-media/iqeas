import pool from "../../config/db.js";

export async function getWorkersData() {
  const query = `
    SELECT id, name
    FROM users
    WHERE role = 'working' 
    `;

  const result = await pool.query(query);
  return result.rows;
}

export async function getWorkersWorkByProjectIdWorkId(
  worker_id,
  project_id,
  limit,
  offset
) {
  const countQuery = `
    SELECT COUNT(*) 
    FROM estimation_deliverables
    WHERE worker_id = $1 AND project_id = $2
  `;

  const dataQuery = `
    SELECT
      (to_jsonb(ed) - 'amount') AS data
    FROM estimation_deliverables ed
    WHERE worker_id = $1 AND project_id = $2
    ORDER BY ed.created_at DESC
    LIMIT $3 OFFSET $4
  `;

  const [countResult, dataResult] = await Promise.all([
    pool.query(countQuery, [worker_id, project_id]),
    pool.query(dataQuery, [worker_id, project_id, limit, offset]),
  ]);

  return {
    total: Number(countResult.rows[0].count),
    data: dataResult.rows.map((r) => r.data),
  };
}

export async function getWorkerProjectIds(worker_id, limit, offset) {
  const query = `
    SELECT DISTINCT project_id
    FROM estimation_deliverables
    WHERE worker_id = $1
    ORDER BY project_id
    LIMIT $2 OFFSET $3
  `;

  const result = await pool.query(query, [worker_id, limit, offset]);
  return result.rows;
}


export async function getProjectDetails(project_id) {
  console.debug(
    "[SERVICE][WORKERS][PROJECT] Fetching project details for project_id:",
    project_id
  );

  const query = `
    SELECT id, name, project_id
    FROM projects
    WHERE id = $1 AND send_to_workers = TRUE
  `;

  const result = await pool.query(query, [String(project_id)]);
  console.debug(
    "[SERVICE][WORKERS][PROJECT] Project details fetched:",
    result.rows
  );
  return result.rows[0];
}
export async function updateConsumedTime(
  worker_id,
  estimation_deliverable_id,
  t1,
  t2
) {
  const timeInitial = new Date(t1);
  const endTime = new Date(t2);

  const diffMs = endTime - timeInitial;
  if (diffMs <= 0) throw new Error("Invalid time difference");

  const newTotalSeconds = Math.floor(diffMs / 1000);

  const getCurrentTimeQuery = `
    SELECT consumed_time
    FROM estimation_deliverables
    WHERE id = $1
      AND worker_id = $2
  `;

  const { rows } = await pool.query(getCurrentTimeQuery, [
    estimation_deliverable_id,
    worker_id,
  ]);

  if (rows.length === 0) {
    throw new Error("Estimation deliverable not found for worker");
  }

  const consumed = rows[0].consumed_time || {
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  const existingTotalSeconds =
    consumed.hours * 3600 + consumed.minutes * 60 + consumed.seconds;

  const updatedTotalSeconds = existingTotalSeconds + newTotalSeconds;

  const updatedConsumedTime = {
    hours: Math.floor(updatedTotalSeconds / 3600),
    minutes: Math.floor((updatedTotalSeconds % 3600) / 60),
    seconds: updatedTotalSeconds % 60,
  };

  const updateConsumedTimeQuery = `
    UPDATE estimation_deliverables
    SET consumed_time = $1,
        updated_at = NOW()
    WHERE id = $2
      AND worker_id = $3
    RETURNING consumed_time
  `;

  const result = await pool.query(updateConsumedTimeQuery, [
    updatedConsumedTime,
    estimation_deliverable_id,
    worker_id,
  ]);

  return result.rows[0];
}

export async function markEstimationDeliverableChecking(
  estimation_deliverable_id,
  worker_id,
  client = pool
) {
  const query = `
    UPDATE estimation_deliverables ed
    SET status = 'checking',
        updated_at = NOW()
    WHERE ed.id = $1
      AND EXISTS (
        SELECT 1
        FROM workers_uploaded_files wuf
        WHERE wuf.project_id = ed.project_id::INTEGER
          AND wuf.worker_id = $2
      )
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




/*

This is the new deliverable checking
*/

export async function checkInDeliverable(req, res) {
  try {
    const { estimation_deliverable_id } = req.params;
    const worker_id = req.user.id;

    const query = `
      UPDATE estimation_deliverables
      SET status = 'checking',
          updated_at = NOW()
      WHERE id = $1
        AND worker_id = $2
        AND status IN ('under progress', 'rework')
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [
      estimation_deliverable_id,
      worker_id,
    ]);

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "Cannot check-in in current status",
      });
    }

    res.json({
      success: true,
      message: "Checked in successfully",
      data: rows[0],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}


export async function uploadWorkerFiles(
  worker_id,
  uploaded_file_ids,
  project_id,
  client = pool
) {
  if (!Array.isArray(uploaded_file_ids) || uploaded_file_ids.length === 0) {
    throw new Error("uploaded_file_id must be a non-empty array");
  }

  const values = [];
  const placeholders = uploaded_file_ids.map((_, index) => {
    const base = index * 3;
    values.push(worker_id, uploaded_file_ids[index], project_id);
    return `($${base + 1}, $${base + 2}, $${base + 3})`;
  });

  const query = `
    INSERT INTO workers_uploaded_files (
      worker_id,
      uploaded_file_id,
      project_id
    )
    VALUES ${placeholders.join(", ")}
    RETURNING *
  `;

  const { rows } = await client.query(query, values);

  if (rows.length === 0) {
    throw new Error("Failed to upload worker files");
  }

  return rows;
}
