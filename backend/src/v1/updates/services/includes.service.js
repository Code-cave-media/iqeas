import pool from "../../config/db.js";

export async function ProjectIdTOID(projectId, client = pool) {
  const query = `
            SELECT id
            FROM projects
            WHERE project_id = $1
    `;

  const result = await client.query(query, [projectId]);
  return result.rows;
}


export async function getUserNameById(user_id, client = pool) {
  const query = `
    SELECT name
    FROM users
    WHERE id = $1
  `;
  const result = await client.query(query, [user_id]);
  return result.rows[0]?.name || null;
}



export async function searchClientsByName(query) {
  const result = await pool.query(
    `
    SELECT DISTINCT ON (LOWER(client_name))
      client_name,
      client_company,
      location,
      contact_person,
      contact_person_phone,
      contact_person_email
    FROM projects
    WHERE LOWER(client_name) LIKE LOWER($1)
    ORDER BY LOWER(client_name), created_at DESC
    LIMIT 10
    `,
    [`%${query}%`]
  );

  return result.rows;
}


export async function createHeader(features, client = pool) {
  const query = `
    INSERT INTO headers (features)
    VALUES ($1)
    RETURNING *;
  `;

  const { rows } = await client.query(query, [features]);
  return rows[0];
}

/**
 * Get all headers
 */
export async function getAllHeaders(client = pool) {
  const query = `
    SELECT *
    FROM headers
    ORDER BY created_at DESC;
  `;

  const { rows } = await client.query(query);
  return rows;
}

/**
 * Get header by id
 */
export async function getArchives() {
  const query = `
    SELECT 
      projects.*,
      estimations.sent_to_pm
    FROM projects
    LEFT JOIN estimations
      ON estimations.project_id = projects.id
    WHERE projects.is_pc_archived = true;
  `;

  const { rows } = await pool.query(query);
  return rows;
}
