import pool from "../../config/db.js";

export async function addHoursToDeliverables(
  projectId,
  deliverablesWithHours,
  totalTime,
  client = pool
) {
  const promises = deliverablesWithHours.map(({ sno, hours }) => {
    if (hours === undefined || hours === null) {
      throw new Error(`Hours is required for deliverable with sno ${sno}`);
    }

    return client.query(
      `UPDATE estimation_deliverables
       SET hours = $1,
       SET total_time = $4
       updated_at = NOW()
       WHERE project_id = $2 AND sno = $3
       RETURNING *`,
      [hours, projectId, sno, totalTime]
    );
  });

  const results = await Promise.all(promises);

  if (results.some((r) => r.rowCount === 0)) {
    throw new Error("One or more deliverables not found");
  }

  return results.map((r) => r.rows[0]);
}

export async function addAmountsToDeliverables(
  projectId,
  deliverablesWithAmounts,
  client = pool
) {
  const promises = deliverablesWithAmounts.map(({ sno, amount }) => {
    if (amount === undefined || amount === null) {
      throw new Error(`Amount is required for deliverable with sno ${sno}`);
    }

    return client.query(
      `UPDATE estimation_deliverables
       SET amount = $1, updated_at = NOW()
       WHERE project_id = $2 AND sno = $3
       RETURNING *`,
      [amount, projectId, sno]
    );
  });

  const results = await Promise.all(promises);

  if (results.some((r) => r.rowCount === 0)) {
    throw new Error("One or more deliverables not found for amount update");
  }

  return results.map((r) => r.rows[0]);
}

export async function createEstimationDeliverables(
  projectId,
  deliverables,
  client = pool
) {
  const promises = deliverables.map(
    ({
      sno,
      drawing_no,
      title,
      deliverables: deliverableName,
      discipline,
      hours,
      amount,
    }) =>
      client.query(
        `INSERT INTO estimation_deliverables (
          project_id,
          sno,
          drawing_no,
          title,
          deliverables,
          discipline,
          hours,
          amount
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        ON CONFLICT (project_id, sno) DO UPDATE SET
          drawing_no = EXCLUDED.drawing_no,
          title = EXCLUDED.title,
          deliverables = EXCLUDED.deliverables,
          discipline = EXCLUDED.discipline,
          hours = COALESCE(EXCLUDED.hours, estimation_deliverables.hours),
          amount = COALESCE(EXCLUDED.amount, estimation_deliverables.amount),
          updated_at = NOW()
        RETURNING *`,
        [
          projectId,
          sno,
          drawing_no,
          title,
          deliverableName,
          discipline,
          hours ?? null,
          amount ?? null,
        ]
      )
  );

  const results = await Promise.all(promises);
  return results.map((r) => r.rows[0]);
}

export async function getDeliverablesByProject(projectId, client = pool) {
  const pid = String(projectId).trim();
  console.log(pid);

  const result = await client.query(
    `SELECT *
     FROM estimation_deliverables
     WHERE project_id = $1::text`,
    [pid]
  );

  console.log("ROWS FOUND ===>", result.rows.length);
  return result.rows;
}

export async function getDeliverablesWithTotals(projectId, client = pool) {
  const deliverables = await getDeliverablesByProject(projectId, client);

  console.log(
    `Hi this is the data from the deliverables ===>> ${deliverables}`
  );
  const totals = deliverables.reduce(
    (acc, d) => ({
      total_hours: acc.total_hours + Number(d.hours || 0),
      total_amount: acc.total_amount + Number(d.amount || 0),
    }),
    { total_hours: 0, total_amount: 0 }
  );

  const table_data = deliverables.map((d) => ({
    sno: d.sno,
    drawing_no: d.drawing_no || "",
    title: d.title,
    deliverables: d.deliverables,
    discipline: d.discipline,
    hours: Number(d.hours || 0),
    amount: Number(d.amount || 0),
  }));

  return {
    table_data,
    totals,
  };
}

export async function updateDeliverable(deliverableId, updates, client = pool) {
  const fields = [];
  const values = [];
  let index = 1;

  for (const key in updates) {
    if (updates[key] !== undefined) {
      fields.push(`${key} = $${index}`);
      values.push(updates[key]);
      index++;
    }
  }

  if (!fields.length) {
    throw new Error("No fields provided to update");
  }

  fields.push("updated_at = NOW()");
  values.push(deliverableId);

  const result = await client.query(
    `UPDATE estimation_deliverables
     SET ${fields.join(", ")}
     WHERE id = $${index}
     RETURNING *`,
    values
  );

  return result.rows[0];
}

export async function deleteDeliverable(deliverableId, client = pool) {
  const result = await client.query(
    `DELETE FROM estimation_deliverables
     WHERE id = $1
     RETURNING *`,
    [deliverableId]
  );

  return result.rows[0];
}

export async function markDeliverablesSentToAdmin(projectId, status, client) {
  if (!projectId || !status) {
    throw new Error("Project ID and status required");
  }

  const result = await client.query(
    `UPDATE projects
     SET estimation_status = $2
     WHERE id = $1
     RETURNING *`,
    [projectId, status]
  );

  if (result.rowCount === 0) {
    throw new Error("No project found with given project_id");
  }

  return result.rows[0];
}
