import pool from "../../config/db.js";

export async function getAllProjectsToBeApproved(
  page = 1,
  limit = 10,
  client = pool
) {
  const offset = (page - 1) * limit;

  const dataQuery = `
SELECT
  ed.*,

  -- Project data
  jsonb_build_object(
    'id', p.id,
    'name', p.name,
    'created_at', p.created_at,
    'updated_at', p.updated_at
  ) AS project,

  -- Workers uploaded files + actual file data
  COALESCE(
    jsonb_agg(
      DISTINCT jsonb_build_object(
        'id', wuf.id,
        'worker_id', wuf.worker_id,
        'project_id', wuf.project_id,

        -- File info from uploaded_files
        'file', jsonb_build_object(
          'id', uf.id,
          'label', uf.label,
          'file', uf.file,
          'status', uf.status,
          'uploaded_by_id', uf.uploaded_by_id,
          'created_at', uf.created_at,
          'updated_at', uf.updated_at
        )
      )
    ) FILTER (WHERE wuf.id IS NOT NULL),
    '[]'
  ) AS workers_uploaded_files

FROM estimation_deliverables ed

JOIN projects p
  ON p.id = ed.project_id::integer

LEFT JOIN workers_uploaded_files wuf
  ON wuf.project_id = ed.project_id::integer

LEFT JOIN uploaded_files uf
  ON uf.id = wuf.uploaded_file_id

WHERE ed.status = 'checking'

GROUP BY ed.id, p.id
ORDER BY ed.created_at DESC
LIMIT $1 OFFSET $2;


  `;

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM estimation_deliverables
    WHERE status = 'checking';
  `;

  const [dataResult, countResult] = await Promise.all([
    client.query(dataQuery, [limit, offset]),
    client.query(countQuery),
  ]);

  return {
    data: dataResult.rows,
    total: countResult.rows[0].total,
    page,
    limit,
    totalPages: Math.ceil(countResult.rows[0].total / limit),
  };
}
