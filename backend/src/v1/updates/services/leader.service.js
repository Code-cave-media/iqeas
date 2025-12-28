import pool from "../../config/db.js";

export async function getAllProjectsToBeApproved() {
  const query = `
    SELECT
      ed.*,

      -- Project data
      jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'created_at', p.created_at,
        'updated_at', p.updated_at
      ) AS project,

      -- Workers uploaded files
      COALESCE(
        jsonb_agg(
          DISTINCT jsonb_build_object(
            'id', wuf.id,
            'worker_id', wuf.worker_id,
            'uploaded_file_id', wuf.uploaded_file_id,
            'project_id', wuf.project_id
          )
        ) FILTER (WHERE wuf.id IS NOT NULL),
        '[]'
      ) AS workers_uploaded_files

    FROM estimation_deliverables ed
    JOIN projects p
      ON p.id = ed.project_id
    LEFT JOIN workers_uploaded_files wuf
      ON wuf.project_id = ed.project_id

    WHERE ed.status = 'checking'

    GROUP BY ed.id, p.id
    ORDER BY ed.created_at DESC;
  `;

  const result = await pool.query(query);
  return result.rows;
}
