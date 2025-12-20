import * as TimeTrackingService from "../services/timeTracking.service.js";
import { formatResponse } from "../../utils/response.js";
import pool from "../../config/db.js";

export const startTaskHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { deliverable_id, drawing_log_id } = req.body;
    const userId = req.user.id;

    if (!deliverable_id && !drawing_log_id) {
      return res.status(400).json(
        formatResponse({
          statusCode: 400,
          detail: "Either deliverable_id or drawing_log_id is required",
        })
      );
    }

    const log = await TimeTrackingService.startTask(
      deliverable_id,
      drawing_log_id,
      userId,
      client
    );

    await client.query("COMMIT");

    return res.status(201).json(
      formatResponse({
        statusCode: 201,
        detail: "Task started successfully",
        data: log,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error starting task:", error);
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

export const pauseTaskHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { deliverable_id, drawing_log_id, time_spent } = req.body;
    const userId = req.user.id;

    if (time_spent === undefined) {
      return res.status(400).json(
        formatResponse({
          statusCode: 400,
          detail: "Time spent is required",
        })
      );
    }

    const log = await TimeTrackingService.pauseTask(
      deliverable_id,
      drawing_log_id,
      userId,
      time_spent,
      client
    );

    await client.query("COMMIT");

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Task paused successfully",
        data: log,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error pausing task:", error);
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

export const resumeTaskHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { deliverable_id, drawing_log_id } = req.body;
    const userId = req.user.id;

    const log = await TimeTrackingService.resumeTask(
      deliverable_id,
      drawing_log_id,
      userId,
      client
    );

    await client.query("COMMIT");

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Task resumed successfully",
        data: log,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error resuming task:", error);
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

export const finishTaskHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { deliverable_id, drawing_log_id, time_spent, notes } = req.body;
    const userId = req.user.id;

    if (time_spent === undefined) {
      return res.status(400).json(
        formatResponse({
          statusCode: 400,
          detail: "Time spent is required",
        })
      );
    }

    const log = await TimeTrackingService.finishTask(
      deliverable_id,
      drawing_log_id,
      userId,
      time_spent,
      notes,
      client
    );

    await client.query("COMMIT");

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Task finished successfully",
        data: log,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error finishing task:", error);
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

export const getTimeTrackingLogsHandler = async (req, res) => {
  try {
    const { deliverable_id, drawing_log_id } = req.query;
    const userId = req.user.id;

    const logs = await TimeTrackingService.getTimeTrackingLogs(
      deliverable_id,
      drawing_log_id,
      userId
    );

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Time tracking logs retrieved successfully",
        data: logs,
      })
    );
  } catch (error) {
    console.error("Error fetching time tracking logs:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Internal Server Error",
      })
    );
  }
};

