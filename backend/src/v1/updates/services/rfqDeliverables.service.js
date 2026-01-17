import pool from "../../config/db.js";

export async function createRFQDeliverables(
  projectId,
  deliverables,
  client = pool
) {
  const results = [];

  for (const deliverable of deliverables) {
    const {
      sno,
      drawing_no,
      title,
      deliverables: deliverableName,
      discipline,
      additional = null,
    } = deliverable;

    const existing = await client.query(
      `SELECT id FROM estimation_deliverables
       WHERE project_id = $1 AND sno = $2`,
      [projectId, sno]
    );

    if (existing.rows.length > 0) {
      const updated = await client.query(
        `UPDATE estimation_deliverables
         SET drawing_no = $1,
             title = $2,
             deliverables = $3,
             discipline = $4,
             additional = $5,
             updated_at = NOW()
         WHERE id = $6
         RETURNING *`,
        [
          drawing_no,
          title,
          deliverableName,
          discipline,
          additional,
          existing.rows[0].id,
        ]
      );
      results.push(updated.rows[0]);
    } else {
      const inserted = await client.query(
        `INSERT INTO estimation_deliverables (
          project_id,
          estimation_id,
          sno,
          drawing_no,
          title,
          deliverables,
          discipline,
          additional,
          hours,
          amount
        )
        VALUES ($1, NULL, $2, $3, $4, $5, $6, $7, NULL, NULL)
        RETURNING *`,
        [
          projectId,
          sno,
          drawing_no,
          title,
          deliverableName,
          discipline,
          additional,
        ]
      );
      results.push(inserted.rows[0]);
    }
  }

  return results;
}


export async function getRFQDeliverables(projectId, client = pool) {
  const query = `
    SELECT *
    FROM estimation_deliverables
    WHERE project_id = $1 
    ORDER BY sno ASC
  `;

  const result = await client.query(query, [projectId]);
  return result.rows;
}


export async function linkRFQDeliverablesToEstimation(projectId, estimationId, client = pool) {
  const result = await client.query(
    `UPDATE estimation_deliverables
     SET estimation_id = $1, updated_at = NOW()
     WHERE project_id = $2 
     RETURNING *`,
    [estimationId, projectId]
  );

  return result.rows;
}


export async function addHoursToDeliverablesByProject(
  projectId,
  deliverablesWithHours,
  totalTime,
  client = pool
) {
  const results = [];

  for (const deliverable of deliverablesWithHours) {
    const { sno, hours } = deliverable;

    if (hours === undefined || hours === null) {
      throw new Error(`Hours is required for deliverable with sno ${sno}`);
    }

    const result = await client.query(
      `UPDATE estimation_deliverables
       SET hours = $1,
           total_time = $2,
           updated_at = NOW()
       WHERE project_id = $3 AND sno = $4
       RETURNING *`,
      [hours, totalTime, projectId, sno]
    );

    if (result.rowCount === 0) {
      throw new Error(
        `Deliverable with sno ${sno} not found for project ${projectId}`
      );
    }

    results.push(result.rows[0]);
  }

  return results;
}


export async function addAmountsToDeliverables(
  projectId,
  deliverablesWithAmount,
  client = pool
) {
  const results = [];

  for (const deliverable of deliverablesWithAmount) {
    const { sno, amount, hourly_rate } = deliverable;

    if (amount === undefined || amount === null || isNaN(amount)) {
      throw new Error(
        `Amount is required and must be a valid number for deliverable with sno ${sno}`
      );
    }

    const result = await client.query(
      `UPDATE estimation_deliverables
       SET amount = $1, hourly_rate = $2, updated_at = NOW()
       WHERE project_id = $3
         AND sno = $4
       RETURNING *`,
      [amount, hourly_rate || null, projectId, sno]
    );

    if (result.rowCount === 0) {
      throw new Error(
        `Deliverable with sno ${sno} not found for project ${projectId}`
      );
    }

    results.push(result.rows[0]);
  }

  return results;
}

export async function addWorkPersonToDeliverables(
  projectId,
  assignments,
  client = pool
) {
  const results = [];

  for (const assignment of assignments) {
    const { sno, work_person } = assignment;

    if (!work_person || work_person.trim() === "") {
      throw new Error(
        `Work person name is required for deliverable with sno ${sno}`
      );
    }

    const result = await client.query(
      `UPDATE estimation_deliverables
       SET work_person = $1,
           updated_at = NOW()
       WHERE project_id = $2 AND sno = $3
       RETURNING 
         id, sno, drawing_no, title, discipline, deliverables, 
         amount, hours, work_person, total_time`,
      [work_person.trim(), projectId, sno]
    );

    if (result.rowCount === 0) {
      throw new Error(
        `Deliverable with sno ${sno} not found for project ${projectId}`
      );
    }

    results.push(result.rows[0]);
  }

  return results;
}