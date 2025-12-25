import pool from "../../config/db.js";

/**
 * Create work allocation deliverables from estimation with 10% hour reduction
 */
export async function createWorkAllocationFromEstimation(
  projectId,
  estimationId,
  stages,
  client = pool
) {
  // Get estimation deliverables
  const estimationDeliverables = await client.query(
    `SELECT * FROM estimation_deliverables WHERE estimation_id = $1 ORDER BY sno ASC`,
    [estimationId]
  );

  if (estimationDeliverables.rows.length === 0) {
    throw new Error("No estimation deliverables found");
  }

  const projectStages = await client.query(
    `SELECT * FROM stages WHERE project_id = $1 ORDER BY created_at ASC`,
    [projectId]
  );

  if (projectStages.rows.length === 0) {
    throw new Error("No stages found for project. Create stages first.");
  }

  const workAllocations = [];
  let mainSno = 1;

  for (const estDel of estimationDeliverables.rows) {
    // Calculate 10% reduced hours
    const reducedHours = parseFloat(estDel.hours) * 0.9;

    // Create main deliverable (first stage)
    const mainDeliverable = await client.query(
      `INSERT INTO work_allocation_deliverables (
        project_id, estimation_deliverable_id, sno, drawing_no, title,
        deliverables, discipline, stage_id, stage_name, allocated_hours
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        projectId,
        estDel.id,
        mainSno.toString(),
        estDel.drawing_no,
        estDel.title,
        estDel.deliverables,
        estDel.discipline,
        projectStages.rows[0].id,
        projectStages.rows[0].name,
        reducedHours,
      ]
    );

    const mainDel = mainDeliverable.rows[0];
    workAllocations.push(mainDel);

    // Create sub-deliverables for remaining stages
    for (let i = 1; i < projectStages.rows.length; i++) {
      const stage = projectStages.rows[i];
      const subSno = `${mainSno}.${i}`;

      const subDeliverable = await client.query(
        `INSERT INTO work_allocation_deliverables (
          project_id, estimation_deliverable_id, parent_deliverable_id,
          sno, drawing_no, title, deliverables, discipline,
          stage_id, stage_name, allocated_hours
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          projectId,
          estDel.id,
          mainDel.id,
          subSno,
          estDel.drawing_no,
          estDel.title,
          estDel.deliverables,
          estDel.discipline,
          stage.id,
          stage.name,
          reducedHours / projectStages.rows.length, // Distribute hours across stages
        ]
      );

      workAllocations.push(subDeliverable.rows[0]);
    }

    mainSno++;
  }

  return workAllocations;
}

export async function getWorkAllocationByProject(projectId, client = pool) {
  const query = `
    SELECT 
      wad.*,
      json_build_object(
        'id', u.id,
        'name', u.name,
        'email', u.email
      ) AS work_person,
      json_build_object(
        'id', s.id,
        'name', s.name,
        'status', s.status
      ) AS stage
    FROM work_allocation_deliverables wad
    LEFT JOIN users u ON wad.work_person_id = u.id
    LEFT JOIN stages s ON wad.stage_id = s.id
    WHERE wad.project_id = $1
    ORDER BY wad.sno ASC, wad.stage_name ASC
  `;

  const result = await client.query(query, [projectId]);
  return result.rows;
}

export async function assignWorkPerson(deliverableId, workPersonId, client = pool) {
  const query = `
    UPDATE work_allocation_deliverables
    SET work_person_id = $1,
        status = 'pending',
        updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;

  const result = await client.query(query, [workPersonId, deliverableId]);
  return result.rows[0];
}

export async function updateWorkAllocationDeliverable(
  deliverableId,
  updates,
  client = pool
) {
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

  if (fields.length === 0) {
    throw new Error("No fields provided to update");
  }

  fields.push(`updated_at = NOW()`);
  values.push(deliverableId);

  const query = `
    UPDATE work_allocation_deliverables
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING *
  `;

  const result = await client.query(query, values);
  return result.rows[0];
}

export async function getWorkAllocationDashboard(projectId, client = pool) {
  const deliverables = await getWorkAllocationByProject(projectId, client);

  // Group by main deliverable
  const grouped = {};
  deliverables.forEach((del) => {
    const mainSno = del.sno.split(".")[0];
    if (!grouped[mainSno]) {
      grouped[mainSno] = [];
    }
    grouped[mainSno].push(del);
  });

  return {
    deliverables: Object.values(grouped),
    table_data: deliverables.map((d) => ({
      sno: d.sno,
      drawing_no: d.drawing_no || "",
      title: d.title,
      deliverables: d.deliverables,
      discipline: d.discipline,
      stages: d.stage_name || "",
      revision: d.revision || "",
      hours: parseFloat(d.allocated_hours || 0),
      work_person: d.work_person?.name || "",
      consumed_time: parseFloat(d.consumed_time || 0),
      work_person_id: d.work_person_id,
      stage_id: d.stage_id,
      status: d.status,
    })),
    summary: {
      total_deliverables: deliverables.length,
      total_hours: deliverables.reduce(
        (sum, d) => sum + parseFloat(d.allocated_hours || 0),
        0
      ),
      total_consumed: deliverables.reduce(
        (sum, d) => sum + parseFloat(d.consumed_time || 0),
        0
      ),
      assigned: deliverables.filter((d) => d.work_person_id).length,
      unassigned: deliverables.filter((d) => !d.work_person_id).length,
    },
  };
}

export async function updateConsumedTime(deliverableId, consumedTime, client = pool) {
  const query = `
    UPDATE work_allocation_deliverables
    SET consumed_time = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;

  const result = await client.query(query, [consumedTime, deliverableId]);
  return result.rows[0];
}

