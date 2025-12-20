import pool from "../../config/db.js";
import { generateInvoiceExcel } from "../../lib/excel.js";
import { uploadFile } from "../../lib/s3.js";

const is_production = process.env.PRODUCTION === "true";

/**
 * Generate invoice for a completed stage
 */
export async function generateStageInvoice(
  projectId,
  stageId,
  stageName,
  currentUserId,
  client = pool
) {
  // Check if stage is completed
  const stageResult = await client.query(
    `SELECT * FROM stages WHERE id = $1 AND project_id = $2`,
    [stageId, projectId]
  );

  if (stageResult.rows.length === 0) {
    throw new Error("Stage not found");
  }

  const stage = stageResult.rows[0];

  if (stage.status !== "completed") {
    throw new Error("Stage is not completed yet");
  }

  // Check if invoice already exists
  const existingBilling = await client.query(
    `SELECT * FROM stage_billings 
     WHERE project_id = $1 AND stage_id = $2`,
    [projectId, stageId]
  );

  if (existingBilling.rows.length > 0 && existingBilling.rows[0].invoice_id) {
    throw new Error("Invoice already generated for this stage");
  }

  // Get all completed deliverables for this stage
  const deliverablesResult = await client.query(
    `SELECT 
      wad.*,
      ed.amount AS estimation_amount
    FROM work_allocation_deliverables wad
    LEFT JOIN estimation_deliverables ed ON wad.estimation_deliverable_id = ed.id
    WHERE wad.project_id = $1 
      AND wad.stage_id = $2
      AND wad.status = 'completed'
    ORDER BY wad.sno ASC`,
    [projectId, stageId]
  );

  if (deliverablesResult.rows.length === 0) {
    throw new Error("No completed deliverables found for this stage");
  }

  const deliverables = deliverablesResult.rows;
  const totalAmount = deliverables.reduce(
    (sum, d) => sum + parseFloat(d.estimation_amount || 0),
    0
  );

  // Get project details
  const projectResult = await client.query(
    `SELECT * FROM projects WHERE id = $1`,
    [projectId]
  );
  const project = projectResult.rows[0];

  // Generate invoice data
  const invoiceData = {
    invoiceReference: `INV-${project.project_id}-${stageName}-${new Date().getFullYear()}`,
    paymentApplicationNo: "",
    paymentApplicationDate: new Date().toISOString().split("T")[0],
    invoiceDate: new Date().toISOString().split("T")[0],
    clientName: project.client_name || "",
    clientAddress1: project.location || "",
    clientAddress2: "",
    clientEmail: project.contact_person_email || "",
    clientGSTN: "",
    projectNo: project.project_id || "",
    projectName: project.name || "",
    quotationRef: "",
    quotationRefDate: "",
    lineOfBusiness: "",
    stateCountryOfOrigin: "",
    countryOfConsignee: "",
    modeOfMaterialTransport: "",
    netTotal: totalAmount.toFixed(2),
    cgst: "0.00",
    sgst: "0.00",
    igst: "0.00",
    grandTotal: totalAmount.toFixed(2),
    totalInWords: "",
    items: deliverables.map((d, index) => ({
      slNo: index + 1,
      description: `${d.title} - ${d.deliverables} (${stageName})`,
      hsn: "",
      qty: "1",
      unit: "Nos",
      projectValue: parseFloat(d.estimation_amount || 0).toFixed(2),
      totalAmount: parseFloat(d.estimation_amount || 0).toFixed(2),
    })),
  };

  // Generate invoice file
  const file = await generateInvoiceExcel(invoiceData);
  const file_name = `invoice-${project.project_id}-${stageName}`;
  let file_url;

  if (is_production) {
    file_url = (
      await uploadFile(file, `${file_name}.html`, "estimation-folder")
    ).url;
  } else {
    file_url = file_name;
  }

  // Create uploaded file record
  const fileResult = await client.query(
    `INSERT INTO uploaded_files (label, file, uploaded_by_id, status)
     VALUES ($1, $2, $3, 'under_review')
     RETURNING id`,
    [file_name, file_url, currentUserId]
  );

  const uploadedFileId = fileResult.rows[0].id;

  // Create stage billing record
  const billingResult = await client.query(
    `INSERT INTO stage_billings (
      project_id, stage_id, stage_name, invoice_id, billing_date, total_amount, status
    ) VALUES ($1, $2, $3, $4, $5, $6, 'draft')
    RETURNING *`,
    [
      projectId,
      stageId,
      stageName,
      uploadedFileId,
      new Date().toISOString().split("T")[0],
      totalAmount,
    ]
  );

  const billing = billingResult.rows[0];

  // Link deliverables to billing
  const billingDeliverablePromises = deliverables.map((d) =>
    client.query(
      `INSERT INTO stage_billing_deliverables (
        billing_id, work_allocation_deliverable_id, amount
      ) VALUES ($1, $2, $3)`,
      [billing.id, d.id, d.estimation_amount || 0]
    )
  );

  await Promise.all(billingDeliverablePromises);

  return {
    ...billing,
    invoice_file: {
      id: uploadedFileId,
      label: file_name,
      file: file_url,
    },
    deliverables: deliverables.length,
    total_amount: totalAmount,
  };
}

export async function getStageBillings(projectId, client = pool) {
  const query = `
    SELECT 
      sb.*,
      json_build_object(
        'id', uf.id,
        'label', uf.label,
        'file', uf.file
      ) AS invoice_file
    FROM stage_billings sb
    LEFT JOIN uploaded_files uf ON sb.invoice_id = uf.id
    WHERE sb.project_id = $1
    ORDER BY sb.billing_date DESC
  `;

  const result = await client.query(query, [projectId]);
  return result.rows;
}

export async function forwardInvoiceToProposal(
  billingId,
  forwardedByUserId,
  client = pool
) {
  const result = await client.query(
    `UPDATE stage_billings
     SET status = 'sent_to_proposal',
         sent_to_proposal_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [billingId]
  );
  return result.rows[0];
}

export async function forwardInvoiceToClient(
  billingId,
  forwardedByUserId,
  client = pool
) {
  const result = await client.query(
    `UPDATE stage_billings
     SET status = 'sent_to_client',
         sent_to_client_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [billingId]
  );
  return result.rows[0];
}

export async function markInvoiceAsPaid(billingId, paymentData, client = pool) {
  const client_transaction = client.query ? client : await pool.connect();
  
  try {
    if (!client.query) {
      await client_transaction.query("BEGIN");
    }

    // Update billing status
    const billingResult = await client_transaction.query(
      `UPDATE stage_billings
       SET status = 'paid',
           paid_at = NOW(),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [billingId]
    );

    const billing = billingResult.rows[0];

    // Create payment record
    const paymentResult = await client_transaction.query(
      `INSERT INTO payments (
        project_id, stage_billing_id, invoice_id, payment_amount,
        payment_date, payment_method, reference_number, received_by_user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        billing.project_id,
        billingId,
        billing.invoice_id,
        paymentData.payment_amount,
        paymentData.payment_date,
        paymentData.payment_method,
        paymentData.reference_number,
        paymentData.received_by_user_id,
      ]
    );

    if (!client.query) {
      await client_transaction.query("COMMIT");
    }

    return {
      billing: billing,
      payment: paymentResult.rows[0],
    };
  } catch (error) {
    if (!client.query) {
      await client_transaction.query("ROLLBACK");
    }
    throw error;
  } finally {
    if (!client.query) {
      client_transaction.release();
    }
  }
}

