import * as RFQDeliverablesService from "../services/rfqDeliverables.service.js";
// import * as RFQDeliverablesService from "../services/estimationDeliverables.service.js";
import { formatResponse } from "../../utils/response.js";
import pool from "../../config/db.js";

export const createRFQDeliverablesHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { project_id } = req.params;
    const { deliverables } = req.body;

    if (!Array.isArray(deliverables) || deliverables.length === 0) {
      return res.status(400).json(
        formatResponse({
          statusCode: 400,
          detail: "Deliverables array is required",
        })
      );
    }

    const hasHoursOrAmounts = deliverables.some(
      (d) => d.hours !== undefined || d.amount !== undefined
    );

    if (hasHoursOrAmounts) {
      return res.status(400).json(
        formatResponse({
          statusCode: 400,
          detail:
            "RFQ deliverables should not include hours or amounts. Only: sno, drawing_no, title, deliverables, discipline",
        })
      );
    }

    const created = await RFQDeliverablesService.createRFQDeliverables(
      project_id,
      deliverables,
      client
    );

    await client.query("COMMIT");

    return res.status(201).json(
      formatResponse({
        statusCode: 201,
        detail: "RFQ deliverables created successfully",
        data: created,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating RFQ deliverables:", error);
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

export const getRFQDeliverablesHandler = async (req, res) => {
  try {
    const { project_id } = req.params;
    const deliverables = await RFQDeliverablesService.getRFQDeliverables(
      project_id
    );
    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "RFQ deliverables retrieved",
        data: deliverables,
      })
    );
  } catch (error) {
    console.error("Error fetching RFQ deliverables:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Internal Server Error",
      })
    );
  }
};

export const addHoursToDeliverablesHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { project_id } = req.params;
    const { deliverables } = req.body;
    if (!Array.isArray(deliverables) || deliverables.length === 0) {
      return res.status(400).json(
        formatResponse({
          statusCode: 400,
          detail: "Deliverables array with hours is required",
        })
      );
    }
    const invalid = deliverables.find((d) => d.amount !== undefined);
    if (invalid) {
      return res.status(400).json(
        formatResponse({
          statusCode: 400,
          detail: "Estimation person should only add hours, not amounts",
        })
      );
    }
    const updated =
      await RFQDeliverablesService.addHoursToDeliverablesByProject(
        project_id,
        deliverables,
        client
      );
    await client.query("COMMIT");
    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Hours added to deliverables successfully",
        data: updated,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error adding hours to deliverables:", error);
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

export const addAmountsToDeliverablesHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { project_id } = req.params;
    const { deliverables } = req.body;

    console.log(project_id)

    if (!Array.isArray(deliverables) || deliverables.length === 0) {
      return res.status(400).json(
        formatResponse({
          statusCode: 400,
          detail: "Deliverables array with amount is required",
        })
      );
    }

    // Remove or reverse this check — you DO want amount!
    // If you want to allow only amount and sno:
    const invalid = deliverables.find(
      (d) => typeof d.sno !== "number" || typeof d.amount !== "number"
    );
    if (invalid) {
      return res.status(400).json(
        formatResponse({
          statusCode: 400,
          detail: "Each deliverable must have valid sno and amount (numbers)",
        })
      );
    }

    const updated = await RFQDeliverablesService.addAmountsToDeliverables(
      project_id,
      deliverables,
      client
    );

    await client.query("COMMIT");
    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Amounts added to deliverables successfully",
        data: updated,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error adding amounts to deliverables:", error);
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