import * as WorkAllocationService from "../services/workAllocation.service.js";
import { formatResponse } from "../../utils/response.js";
import pool from "../../config/db.js";

export const createWorkAllocationHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { project_id } = req.params;
    const { estimation_id, stages } = req.body;

    if (!estimation_id) {
      return res.status(400).json(
        formatResponse({
          statusCode: 400,
          detail: "Estimation ID is required",
        })
      );
    }

    const workAllocations = await WorkAllocationService.createWorkAllocationFromEstimation(
      project_id,
      estimation_id,
      stages,
      client
    );

    await client.query("COMMIT");

    return res.status(201).json(
      formatResponse({
        statusCode: 201,
        detail: "Work allocation created successfully with 10% hour reduction",
        data: workAllocations,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating work allocation:", error);
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

export const getWorkAllocationHandler = async (req, res) => {
  try {
    const { project_id } = req.params;
    const dashboard = await WorkAllocationService.getWorkAllocationDashboard(
      project_id
    );

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Work allocation retrieved successfully",
        data: dashboard,
      })
    );
  } catch (error) {
    console.error("Error fetching work allocation:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Internal Server Error",
      })
    );
  }
};

export const assignWorkPersonHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const { work_person_id } = req.body;

    if (!work_person_id) {
      return res.status(400).json(
        formatResponse({
          statusCode: 400,
          detail: "Work person ID is required",
        })
      );
    }

    const updated = await WorkAllocationService.assignWorkPerson(
      id,
      work_person_id,
      client
    );

    await client.query("COMMIT");

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Work person assigned successfully",
        data: updated,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error assigning work person:", error);
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

export const updateWorkAllocationHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const updates = req.body;

    const updated = await WorkAllocationService.updateWorkAllocationDeliverable(
      id,
      updates,
      client
    );

    await client.query("COMMIT");

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Work allocation updated successfully",
        data: updated,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating work allocation:", error);
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

export const updateConsumedTimeHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const { consumed_time } = req.body;

    if (consumed_time === undefined) {
      return res.status(400).json(
        formatResponse({
          statusCode: 400,
          detail: "Consumed time is required",
        })
      );
    }

    const updated = await WorkAllocationService.updateConsumedTime(
      id,
      consumed_time,
      client
    );

    await client.query("COMMIT");

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Consumed time updated successfully",
        data: updated,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating consumed time:", error);
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

