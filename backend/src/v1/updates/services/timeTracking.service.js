import pool from "../../config/db.js";

export async function startTask(
  deliverableId,
  drawingLogId,
  userId,
  client = pool
) {
  // Create time tracking log
  const logResult = await client.query(
    `INSERT INTO time_tracking_logs (
      work_allocation_deliverable_id, drawing_stage_log_id, user_id, action
    ) VALUES ($1, $2, $3, 'start')
    RETURNING *`,
    [deliverableId, drawingLogId, userId]
  );

  // Update deliverable status
  if (deliverableId) {
    await client.query(
      `UPDATE work_allocation_deliverables
       SET status = 'in_progress', updated_at = NOW()
       WHERE id = $1`,
      [deliverableId]
    );
  }

  // Update drawing log status
  if (drawingLogId) {
    await client.query(
      `UPDATE drawing_stage_logs
       SET status = 'in_progress', updated_at = NOW()
       WHERE id = $1`,
      [drawingLogId]
    );
  }

  return logResult.rows[0];
}

export async function pauseTask(
  deliverableId,
  drawingLogId,
  userId,
  timeSpent,
  client = pool
) {
  // Create pause log
  const logResult = await client.query(
    `INSERT INTO time_tracking_logs (
      work_allocation_deliverable_id, drawing_stage_log_id, user_id, action, time_spent
    ) VALUES ($1, $2, $3, 'pause', $4)
    RETURNING *`,
    [deliverableId, drawingLogId, userId, timeSpent]
  );

  // Update consumed time
  if (deliverableId) {
    await client.query(
      `UPDATE work_allocation_deliverables
       SET consumed_time = consumed_time + $1, updated_at = NOW()
       WHERE id = $2`,
      [timeSpent, deliverableId]
    );

    // Update drawing log consumed time
    if (drawingLogId) {
      await client.query(
        `UPDATE drawing_stage_logs
         SET consumed_time = consumed_time + $1, updated_at = NOW()
         WHERE id = $2`,
        [timeSpent, drawingLogId]
      );
    }
  }

  return logResult.rows[0];
}

export async function resumeTask(
  deliverableId,
  drawingLogId,
  userId,
  client = pool
) {
  const logResult = await client.query(
    `INSERT INTO time_tracking_logs (
      work_allocation_deliverable_id, drawing_stage_log_id, user_id, action
    ) VALUES ($1, $2, $3, 'resume')
    RETURNING *`,
    [deliverableId, drawingLogId, userId]
  );

  return logResult.rows[0];
}

export async function finishTask(
  deliverableId,
  drawingLogId,
  userId,
  timeSpent,
  notes,
  client = pool
) {
  // Create finish log
  const logResult = await client.query(
    `INSERT INTO time_tracking_logs (
      work_allocation_deliverable_id, drawing_stage_log_id, user_id, action, time_spent, notes
    ) VALUES ($1, $2, $3, 'finish', $4, $5)
    RETURNING *`,
    [deliverableId, drawingLogId, userId, timeSpent, notes]
  );

  // Update consumed time
  if (deliverableId) {
    await client.query(
      `UPDATE work_allocation_deliverables
       SET consumed_time = consumed_time + $1,
           status = 'completed',
           updated_at = NOW()
       WHERE id = $2`,
      [timeSpent, deliverableId]
    );
  }

  // Update drawing log
  if (drawingLogId) {
    await client.query(
      `UPDATE drawing_stage_logs
       SET consumed_time = consumed_time + $1,
           status = 'completed',
           updated_at = NOW()
       WHERE id = $2`,
      [timeSpent, drawingLogId]
    );
  }

  return logResult.rows[0];
}

export async function getTimeTrackingLogs(
  deliverableId,
  drawingLogId,
  userId,
  client = pool
) {
  let whereClause = "WHERE 1=1";
  const values = [];
  let index = 1;

  if (deliverableId) {
    whereClause += ` AND work_allocation_deliverable_id = $${index}`;
    values.push(deliverableId);
    index++;
  }

  if (drawingLogId) {
    whereClause += ` AND drawing_stage_log_id = $${index}`;
    values.push(drawingLogId);
    index++;
  }

  if (userId) {
    whereClause += ` AND user_id = $${index}`;
    values.push(userId);
    index++;
  }

  const query = `
    SELECT 
      ttl.*,
      json_build_object(
        'id', u.id,
        'name', u.name,
        'email', u.email
      ) AS user
    FROM time_tracking_logs ttl
    LEFT JOIN users u ON ttl.user_id = u.id
    ${whereClause}
    ORDER BY ttl.created_at ASC
  `;

  const result = await client.query(query, values);
  return result.rows;
}

