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
  console.debug(
    "[SERVICE][WORKERS][PROJECT] Fetching project IDs for worker:",
    worker_id
  );

  const query = `
    SELECT project_id
    FROM estimation_deliverables
    WHERE worker_id = $1
    LIMIT $2 OFFSET $3
  `;

  const result = await pool.query(query, [worker_id, limit, offset]);
  console.debug(
    "[SERVICE][WORKERS][PROJECT] Project IDs fetched:",
    result.rows
  );
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


export async function updateConsumedTime(worker_id, t1, t2) {
  const timeInitial = new Date(t1);
  const endTime = new Date(t2);

  const diffMs = endTime - timeInitial;
  if (diffMs <= 0) throw new Error("Invalid time difference");

  const newTotalSeconds = Math.floor(diffMs / 1000);

  const getCurrentTimeQuery = `
    SELECT consumed_time
    FROM estimation_deliverables
    WHERE worker_id = $1
  `;

  const { rows } = await pool.query(getCurrentTimeQuery, [worker_id]);

  const consumed = rows[0]?.consumed_time || {
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
    WHERE worker_id = $2
    RETURNING consumed_time
  `;

  const result = await pool.query(updateConsumedTimeQuery, [
    updatedConsumedTime,
    worker_id,
  ]);

  return result.rows[0];
}
