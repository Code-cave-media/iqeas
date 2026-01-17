import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

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
      -- We'll replace the parameter with a placeholder or test value
      -- AND p.coordinator_id = $1 

    GROUP BY
      p.id,
      e.id,
      po.id

    ORDER BY p.created_at DESC
    LIMIT 20 OFFSET 0
`;

async function run() {
  try {
    console.log("Checking project assignment status...");
    const res = await pool.query(`
      SELECT id, name, status, send_to_estimation, send_to_coordinator, coordinator_id 
      FROM projects 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    console.log("Projects:", JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error("Query Failed:", err.message);
  } finally {
    process.exit();
  }
}

run();
