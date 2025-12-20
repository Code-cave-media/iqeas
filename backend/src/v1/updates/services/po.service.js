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
    notes,
    terms_and_conditions,
  ];

  const result = await client.query(query, values);
  const po = result.rows[0];

  // Link PO to project
  await client.query(
    `UPDATE projects SET po_id = $1 WHERE id = $2`,
    [po.id, project_id]
  );

  // Add uploaded files
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

export async function getPurchaseOrderById(poId, client = pool) {
  const query = `
    SELECT 
      po.*,
      json_build_object(
        'id', u.id,
        'name', u.name,
        'email', u.email
      ) AS received_by_user,
      (
        SELECT json_build_object(
          'id', p.id,
          'project_id', p.project_id,
          'name', p.name,
          'client_name', p.client_name
        )
        FROM projects p
        WHERE p.id = po.project_id
      ) AS project,
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
    WHERE po.id = $1
  `;

  const result = await client.query(query, [poId]);
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
  
  // Also update project status if needed
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

