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


