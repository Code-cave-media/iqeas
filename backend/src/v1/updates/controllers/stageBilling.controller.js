import * as StageBillingService from "../services/stageBilling.service.js";
import { formatResponse } from "../../utils/response.js";
import pool from "../../config/db.js";

export const generateStageInvoiceHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { project_id, stage_id } = req.params;
    const currentUserId = req.user.id;

    // Get stage details
    const stageResult = await client.query(
      `SELECT * FROM stages WHERE id = $1 AND project_id = $2`,
      [stage_id, project_id]
    );

    if (stageResult.rows.length === 0) {
      return res.status(404).json(
        formatResponse({
          statusCode: 404,
          detail: "Stage not found",
        })
      );
    }

    const stage = stageResult.rows[0];

    const billing = await StageBillingService.generateStageInvoice(
      project_id,
      stage_id,
      stage.name,
      currentUserId,
      client
    );

    await client.query("COMMIT");

    return res.status(201).json(
      formatResponse({
        statusCode: 201,
        detail: "Stage invoice generated successfully",
        data: billing,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error generating stage invoice:", error);
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

export const getStageBillingsHandler = async (req, res) => {
  try {
    const { project_id } = req.params;
    const billings = await StageBillingService.getStageBillings(project_id);

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Stage billings retrieved successfully",
        data: billings,
      })
    );
  } catch (error) {
    console.error("Error fetching stage billings:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Internal Server Error",
      })
    );
  }
};

export const forwardInvoiceToProposalHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const forwardedByUserId = req.user.id;

    const billing = await StageBillingService.forwardInvoiceToProposal(
      id,
      forwardedByUserId,
      client
    );

    await client.query("COMMIT");

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Invoice forwarded to Proposal team successfully",
        data: billing,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error forwarding invoice:", error);
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

export const forwardInvoiceToClientHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const forwardedByUserId = req.user.id;

    const billing = await StageBillingService.forwardInvoiceToClient(
      id,
      forwardedByUserId,
      client
    );

    await client.query("COMMIT");

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Invoice forwarded to Client successfully",
        data: billing,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error forwarding invoice:", error);
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

export const markInvoiceAsPaidHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const paymentData = {
      ...req.body,
      received_by_user_id: req.user.id,
    };

    const result = await StageBillingService.markInvoiceAsPaid(
      id,
      paymentData,
      client
    );

    await client.query("COMMIT");

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Invoice marked as paid successfully",
        data: result,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error marking invoice as paid:", error);
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

