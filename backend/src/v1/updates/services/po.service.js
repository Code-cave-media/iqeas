import pool from "../../config/db.js";

export async function createPurchaseOrder(data, client = pool) {
  const {
    project_id,
    po_number,
    received_date,
    received_by_user_id,
    notes,
    terms_and_conditions,
    uploaded_file_ids = [],
  } = data;

  const query = `
    INSERT INTO purchase_orders (
      project_id, po_number, received_date, received_by_user_id,
      notes, terms_and_conditions, status
    ) VALUES ($1, $2, $3, $4, $5, $6, 'received')
    RETURNING *
  `;

  const values = [
    project_id,
    po_number,
    received_date,
    received_by_user_id,
    notes || null, // Handle undefined/null
    terms_and_conditions || null,
  ];

  const result = await client.query(query, values);
  const po = result.rows[0];

  if (uploaded_file_ids.length > 0) {
    const filePromises = uploaded_file_ids.map((fileId) =>
      client.query(
        `INSERT INTO purchase_order_files (po_id, uploaded_file_id) VALUES ($1, $2)`,
        [po.id, fileId]
      )
    );
    await Promise.all(filePromises);
  }

  return po;
}

export async function getPurchaseOrderById(project_id, client = pool) {
  const query = `
    SELECT * FROM purchase_orders WHERE project_id = $1
  `;

  const result = await client.query(query, [project_id]);
  return result.rows[0] || null;
}

export async function getPOsByProjectId(projectId, client = pool) {
  const query = `
    SELECT 
      po.*,
      json_build_object(
        'id', u.id,
        'name', u.name,
        'email', u.email
      ) AS received_by_user,
      COALESCE((
        SELECT json_agg(json_build_object(
          'id', uf.id,
          'label', uf.label,
          'file', uf.file
        ))
        FROM purchase_order_files pof
        JOIN uploaded_files uf ON pof.uploaded_file_id = uf.id
        WHERE pof.po_id = po.id
      ), '[]'::json) AS uploaded_files
    FROM purchase_orders po
    LEFT JOIN users u ON po.received_by_user_id = u.id
    WHERE po.project_id = $1
    ORDER BY po.created_at DESC
  `;

  const result = await client.query(query, [projectId]);
  return result.rows;
}

export async function forwardPOToAdmin(poId, forwardedByUserId, client = pool) {
  const query = `
    UPDATE purchase_orders
    SET status = 'forwarded_to_admin',
        forwarded_to_admin_at = NOW(),
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const result = await client.query(query, [poId]);
  return result.rows[0];
}

export async function forwardPOToPM(poId, forwardedByUserId, client = pool) {
  const query = `
    UPDATE purchase_orders
    SET status = 'forwarded_to_pm',
        forwarded_to_pm_at = NOW(),
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const result = await client.query(query, [poId]);

  const po = await getPurchaseOrderById(poId, client);
  if (po) {
    await client.query(
      `UPDATE projects SET status = 'working' WHERE id = $1 AND status != 'working'`,
      [po.project_id]
    );
  }

  return result.rows[0];
}

export async function acceptPO(poId, acceptedByUserId, client = pool) {
  const query = `
    UPDATE purchase_orders
    SET status = 'accepted',
        accepted_at = NOW(),
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const result = await client.query(query, [poId]);
  return result.rows[0];
}

export async function updatePO(poId, updates, client = pool) {
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
  values.push(poId);

  const query = `
    UPDATE purchase_orders
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING *
  `;

  const result = await client.query(query, values);
  return result.rows[0];
}

export async function getProjectCoordinatorWorks(
  coordinator_id,
  page = 1,
  limit = 20,
  client = pool
) {
  const offset = (page - 1) * limit;

  const dataQuery = `
    SELECT
      p.*,

      -- Estimation
      e.id AS estimation_id,
      e.sent_to_pm AS estimation_sent_to_pm,

      -- Purchase Order
      po.id AS purchase_order_id,
      po.po_number,
      po.received_date,
      po.notes,
      po.terms_and_conditions,

      -- Uploaded Files
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', uf.id,
            'label', uf.label,
            'file', uf.file,
            'status', uf.status,
            'created_at', uf.created_at
          )
        ) FILTER (WHERE uf.id IS NOT NULL),
        '[]'
      ) AS uploaded_files

    FROM projects p

    -- 🔗 Estimation joined by project_id
    LEFT JOIN estimations e
      ON e.project_id = p.id

    -- Purchase Order
    LEFT JOIN purchase_orders po
      ON po.project_id = p.id

    LEFT JOIN purchase_order_files pof
      ON pof.po_id = po.id

    LEFT JOIN uploaded_files uf
      ON uf.id = pof.uploaded_file_id

    WHERE
      p.send_to_coordinator = true
      AND p.coordinator_id = $1

    GROUP BY
      p.id,
      e.id,
      po.id

    ORDER BY p.created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const countQuery = `
    SELECT COUNT(*)
    FROM projects
    WHERE
      send_to_coordinator = true
      AND coordinator_id = $1
  `;

  const [dataResult, countResult] = await Promise.all([
    client.query(dataQuery, [coordinator_id, limit, offset]),
    client.query(countQuery, [coordinator_id]),
  ]);

  return {
    data: dataResult.rows,
    total: Number(countResult.rows[0].count),
    page,
    limit,
  };
}


export async function getAllCoordinators() {
  const query = `
    SELECT id, name
    FROM users
    WHERE role = 'project_coordinator'
    ORDER BY name
  `;

  const result = await pool.query(query);
  return result.rows;
}

export async function getAllPMs() {
  const query = `
    SELECT id, name
    FROM users
    WHERE role = 'pm'
    ORDER BY name
  `;

  const result = await pool.query(query);
  return result.rows;
}

export async function getAllleaders() {
  const query = `
    SELECT id, name
    FROM users
    WHERE role = 'project_leader'
    ORDER BY name
  `;

  const result = await pool.query(query);
  return result.rows;
}




export async function getProjectCoordinatorsByProject(project_id) {
     const estimationMetaQuery = `
    SELECT
      id AS estimation_id,
      sent_to_pm AS estimation_sent_to_pm
    FROM estimations
    WHERE project_id = $1
    LIMIT 1
  `;

     const estimationMetaResult = await pool.query(estimationMetaQuery, [
       project_id,
     ]);

     /* ===============================
     Estimation Deliverables
  =============================== */
     const estimationQuery = `
    SELECT *
    FROM estimation_deliverables
    WHERE project_id = $1
    ORDER BY id ASC
  `;

     const estimationResult = await pool.query(estimationQuery, [project_id]);

     /* ===============================
     Purchase Orders + Uploaded Files
  =============================== */
     const purchaseQuery = `
    SELECT
      po.*,
      COALESCE(
        json_agg(
          jsonb_build_object(
            'id', uf.id,
            'label', uf.label,
            'file', uf.file,
            'status', uf.status,
            'uploaded_by_id', uf.uploaded_by_id,
            'created_at', uf.created_at
          )
        ) FILTER (WHERE uf.id IS NOT NULL),
        '[]'
      ) AS uploaded_files
    FROM purchase_orders po
    LEFT JOIN purchase_order_files pof
      ON pof.po_id = po.id
    LEFT JOIN uploaded_files uf
      ON uf.id = pof.uploaded_file_id
    WHERE po.project_id = $1
    GROUP BY po.id
    ORDER BY po.id ASC
  `;

     const purchaseResult = await pool.query(purchaseQuery, [project_id]);

     /* ===============================
     FINAL RESPONSE (CRITICAL)
  =============================== */
     return {
       estimation_id: estimationMetaResult.rows[0]?.estimation_id ?? null,

       estimation_sent_to_pm:
         estimationMetaResult.rows[0]?.estimation_sent_to_pm ?? false,

       estimation_deliverables: estimationResult.rows,

       purchase_orders: purchaseResult.rows,
     };

}


