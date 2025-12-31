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

