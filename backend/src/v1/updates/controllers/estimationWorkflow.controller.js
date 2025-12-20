import * as EstimationWorkflowService from "../services/estimationWorkflow.service.js";
import * as EstimationDeliverablesService from "../services/estimationDeliverables.service.js";
import { formatResponse } from "../../utils/response.js";
import pool from "../../config/db.js";

/**
 * Send estimation to Admin (from Estimation person)
 */
export const sendEstimationToAdminHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { project_id } = req.body;

    if (!project_id) {
      return res.status(400).json(
        formatResponse({
          statusCode: 400,
          detail: "Project ID is required",
        })
      );
    }

    await client.query("BEGIN");

    const estimation = await EstimationWorkflowService.sendEstimationToAdmin(
      id,
      project_id,
      client
    );

    await client.query("COMMIT");

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Estimation sent to Admin successfully",
        data: estimation,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error sending estimation to admin:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: error.message || "Internal Server Error",
      })
    );
  } finally {
    client.release();
  }
};

/**
 * Admin verifies and adds cost
 * Also adds amounts to deliverables if provided
 */
export const adminVerifyAndAddCostHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { project_id, cost, terms_and_conditions, notes, deliverables } = req.body;

    if (!project_id) {
      return res.status(400).json(
        formatResponse({
          statusCode: 400,
          detail: "Project ID is required",
        })
      );
    }

    await client.query("BEGIN");

    // If deliverables with amounts are provided, add amounts first
    if (deliverables && Array.isArray(deliverables) && deliverables.length > 0) {
      await EstimationDeliverablesService.addAmountsToDeliverables(
        id,
        deliverables,
        client
      );
    }

    // Then verify estimation (cost will be calculated from deliverables if not provided)
    const estimation = await EstimationWorkflowService.adminVerifyAndAddCost(
      id,
      project_id,
      { cost, terms_and_conditions, notes },
      client
    );

    await client.query("COMMIT");

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Estimation verified and cost added successfully",
        data: estimation,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error verifying estimation:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: error.message || "Internal Server Error",
      })
    );
  } finally {
    client.release();
  }
};

/**
 * Send verified estimation from Admin to Proposals
 */
export const sendEstimationToProposalsHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { project_id } = req.body;

    if (!project_id) {
      return res.status(400).json(
        formatResponse({
          statusCode: 400,
          detail: "Project ID is required",
        })
      );
    }

    await client.query("BEGIN");

    const estimation = await EstimationWorkflowService.sendEstimationToProposals(
      id,
      project_id,
      client
    );

    await client.query("COMMIT");

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Estimation sent to Proposals successfully",
        data: estimation,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error sending estimation to proposals:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: error.message || "Internal Server Error",
      })
    );
  } finally {
    client.release();
  }
};

/**
 * Proposals send estimation to Client
 */
export const sendEstimationToClientHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { project_id } = req.body;

    if (!project_id) {
      return res.status(400).json(
        formatResponse({
          statusCode: 400,
          detail: "Project ID is required",
        })
      );
    }

    await client.query("BEGIN");

    const estimation = await EstimationWorkflowService.sendEstimationToClient(
      id,
      project_id,
      client
    );

    await client.query("COMMIT");

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Estimation sent to Client successfully",
        data: estimation,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error sending estimation to client:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: error.message || "Internal Server Error",
      })
    );
  } finally {
    client.release();
  }
};

/**
 * Get estimations pending admin verification
 */
export const getEstimationsPendingAdminHandler = async (req, res) => {
  try {
    const estimations = await EstimationWorkflowService.getEstimationsPendingAdmin();

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Estimations pending admin verification retrieved successfully",
        data: estimations,
      })
    );
  } catch (error) {
    console.error("Error fetching estimations:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Internal Server Error",
      })
    );
  }
};

/**
 * Get estimations pending proposals (verified by admin)
 */
export const getEstimationsPendingProposalsHandler = async (req, res) => {
  try {
    const estimations = await EstimationWorkflowService.getEstimationsPendingProposals();

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Estimations pending proposals retrieved successfully",
        data: estimations,
      })
    );
  } catch (error) {
    console.error("Error fetching estimations:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Internal Server Error",
      })
    );
  }
};

