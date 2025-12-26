import * as EstimationDeliverablesService from "../services/estimationDeliverables.service.js";
import { formatResponse } from "../../utils/response.js";
import pool from "../../config/db.js";

export const createEstimationDeliverablesHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { estimation_id } = req.params;
    const { deliverables } = req.body;

    if (!Array.isArray(deliverables) || deliverables.length === 0) {
      return res.status(400).json(
        formatResponse({
          statusCode: 400,
          detail: "Deliverables array is required",
        })
      );
    }

    const created =
      await EstimationDeliverablesService.createEstimationDeliverables(
        estimation_id,
        deliverables,
        client
      );

    await client.query("COMMIT");

    return res.status(201).json(
      formatResponse({
        statusCode: 201,
        detail: "Estimation deliverables created successfully",
        data: created,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating estimation deliverables:", error);
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

export const getEstimationDeliverablesHandler = async (req, res) => {
  try {
    const { estimation_id } = req.params;
    const result =
      await EstimationDeliverablesService.getEstimationDeliverablesWithTotal(
        estimation_id
      );

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Estimation deliverables retrieved successfully",
        data: result,
      })
    );
  } catch (error) {
    console.error("Error fetching estimation deliverables:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Internal Server Error",
      })
    );
  }
};

export const updateEstimationDeliverableHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const updates = req.body;

    const updated = await EstimationDeliverablesService.updateDeliverable(
      id,
      updates,
      client
    );

    await client.query("COMMIT");

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Estimation deliverable updated successfully",
        data: updated,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating estimation deliverable:", error);
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

export const deleteEstimationDeliverableHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const deleted =
      await EstimationDeliverablesService.deleteEstimationDeliverable(
        id,
        client
      );

    await client.query("COMMIT");

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Estimation deliverable deleted successfully",
        data: deleted,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting estimation deliverable:", error);
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

export const addHoursToDeliverablesByProjectHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { project_id } = req.params;
    const { deliverables, total_time } = req.body;
    console.log(`Hi ==> ${total_time}`)
    if (!Array.isArray(deliverables) || deliverables.length === 0) {
      return res.status(400).json({
        status_code: 400,
        detail: "Deliverables array is required",
      });
    }

    const updated =
      await EstimationDeliverablesService.addHoursToDeliverablesByProject(
        project_id,
        deliverables,
        total_time,
        client
      );

    await client.query("COMMIT");

    return res.status(200).json({
      status_code: 200,
      detail: "Hours updated successfully",
      data: updated,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating hours:", error);
    return res.status(500).json({
      status_code: 500,
      detail: error.message || "Internal Server Error",
    });
  } finally {
    client.release();
  }
};

export const sendDeliverablesToAdmin = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { project_id } = req.params;
    const { estimation_status } = req.body;

    console.log(`djsn ==> ${project_id}-${estimation_status}`);

    if (!project_id || !estimation_status) {
      return res.status(400).json(
        formatResponse({
          statusCode: 400,
          detail: "Project ID and deliverables array are required",
        })
      );
    }

    const updated =
      await EstimationDeliverablesService.markDeliverablesSentToAdmin(
        project_id,
        estimation_status,
        client
      );

    await client.query("COMMIT");

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Deliverables sent to admin successfully",
        data: updated,
      })
    );
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error sending deliverables to admin:", err);

    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: err.message || "Failed to send deliverables to admin", 
      })
    );
  } finally {
    client.release();
  }
};
