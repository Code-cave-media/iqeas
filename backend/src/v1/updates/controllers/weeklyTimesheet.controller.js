import * as WeeklyTimesheetService from "../services/weeklyTimesheet.service.js";
import { formatResponse } from "../../utils/response.js";
import pool from "../../config/db.js";

export const getWeeklyTimesheetHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { week_start_date } = req.query;

    const weekDate = week_start_date ? new Date(week_start_date) : new Date();
    const timesheet = await WeeklyTimesheetService.getWeeklyTimesheet(
      userId,
      weekDate
    );

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Weekly timesheet retrieved successfully",
        data: timesheet,
      })
    );
  } catch (error) {
    console.error("Error fetching weekly timesheet:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: error.message || "Internal Server Error",
      })
    );
  }
};

export const submitWeeklyTimesheetHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const timesheet = await WeeklyTimesheetService.submitWeeklyTimesheet(
      id,
      client
    );

    await client.query("COMMIT");

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Weekly timesheet submitted successfully",
        data: timesheet,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error submitting weekly timesheet:", error);
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

export const getWeeklyTimesheetsHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;

    const result = await WeeklyTimesheetService.getWeeklyTimesheetsByUser(
      userId,
      page,
      size
    );

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Weekly timesheets retrieved successfully",
        data: result,
      })
    );
  } catch (error) {
    console.error("Error fetching weekly timesheets:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Internal Server Error",
      })
    );
  }
};

