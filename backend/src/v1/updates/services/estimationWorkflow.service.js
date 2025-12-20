import pool from "../../config/db.js";
import { updateProjectPartial } from "../../services/projects.service.js";
import * as EstimationDeliverablesService from "./estimationDeliverables.service.js";

/**
 * Send estimation to Admin for cost verification
 */
export async function sendEstimationToAdmin(estimationId, projectId, client = pool) {
  await client.query("BEGIN");

  try {
    // Update estimation status
    const estimationResult = await client.query(
      `UPDATE estimations
       SET status = 'sent_to_admin',
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [estimationId]
    );

    // Update project status
    await updateProjectPartial(
      projectId,
      { estimation_status: "sent_to_admin" },
      client
    );

    await client.query("COMMIT");

    return estimationResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

/**
 * Admin verifies and adds cost to estimation
 * Also calculates total cost from deliverables amounts
 */
export async function adminVerifyAndAddCost(
  estimationId,
  projectId,
  costData,
  client = pool
) {
  await client.query("BEGIN");

  try {
    const { cost, terms_and_conditions, notes } = costData;

    // Calculate total cost from deliverables if cost not provided
    let finalCost = cost;
    if (!finalCost) {
      const totalResult = await client.query(
        `SELECT COALESCE(SUM(amount), 0) as total
         FROM estimation_deliverables
         WHERE estimation_id = $1`,
        [estimationId]
      );
      finalCost = parseFloat(totalResult.rows[0].total);
    }

    // Update estimation with cost
    const estimationResult = await client.query(
      `UPDATE estimations
       SET cost = $1,
           notes = COALESCE($2, notes),
           status = 'verified_by_admin',
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [finalCost, notes, estimationId]
    );

    // Update project status
    await updateProjectPartial(
      projectId,
      { estimation_status: "verified_by_admin" },
      client
    );

    await client.query("COMMIT");

    return estimationResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

/**
 * Send verified estimation from Admin back to Proposals
 */
export async function sendEstimationToProposals(estimationId, projectId, client = pool) {
  await client.query("BEGIN");

  try {
    // Update estimation status
    const estimationResult = await client.query(
      `UPDATE estimations
       SET status = 'sent_to_proposals',
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [estimationId]
    );

    // Update project status
    await updateProjectPartial(
      projectId,
      { estimation_status: "sent_to_proposals" },
      client
    );

    await client.query("COMMIT");

    return estimationResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

/**
 * Proposals send estimation to Client
 */
export async function sendEstimationToClient(estimationId, projectId, client = pool) {
  await client.query("BEGIN");

  try {
    // Update estimation status
    const estimationResult = await client.query(
      `UPDATE estimations
       SET status = 'sent_to_client',
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [estimationId]
    );

    // Update project status
    await updateProjectPartial(
      projectId,
      { estimation_status: "sent_to_client" },
      client
    );

    await client.query("COMMIT");

    return estimationResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

/**
 * Get estimations pending admin verification
 */
export async function getEstimationsPendingAdmin(client = pool) {
  const query = `
    SELECT e.*,
      json_build_object(
        'id', p.id,
        'project_id', p.project_id,
        'name', p.name,
        'client_name', p.client_name,
        'client_company', p.client_company
      ) AS project
    FROM estimations e
    JOIN projects p ON e.project_id = p.id
    WHERE e.status = 'sent_to_admin'
    ORDER BY e.created_at DESC
  `;

  const result = await client.query(query);
  return result.rows;
}

/**
 * Get estimations pending proposals (verified by admin)
 */
export async function getEstimationsPendingProposals(client = pool) {
  const query = `
    SELECT e.*,
      json_build_object(
        'id', p.id,
        'project_id', p.project_id,
        'name', p.name,
        'client_name', p.client_name,
        'client_company', p.client_company
      ) AS project
    FROM estimations e
    JOIN projects p ON e.project_id = p.id
    WHERE e.status = 'sent_to_proposals'
    ORDER BY e.created_at DESC
  `;

  const result = await client.query(query);
  return result.rows;
}

