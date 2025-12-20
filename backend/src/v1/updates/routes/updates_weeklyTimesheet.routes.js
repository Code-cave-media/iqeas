import express from "express";
import {
  getWeeklyTimesheetHandler,
  submitWeeklyTimesheetHandler,
  getWeeklyTimesheetsHandler,
} from "../controllers/weeklyTimesheet.controller.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get weekly timesheet (creates if doesn't exist)
router.get("/timesheet/weekly", getWeeklyTimesheetHandler);

// Submit weekly timesheet
router.patch("/timesheet/weekly/:id/submit", submitWeeklyTimesheetHandler);

// Get all weekly timesheets for user
router.get("/timesheet/weekly/list", getWeeklyTimesheetsHandler);

export default router;

