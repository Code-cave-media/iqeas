import express from "express";
import {
  startTaskHandler,
  pauseTaskHandler,
  resumeTaskHandler,
  finishTaskHandler,
  getTimeTrackingLogsHandler,
} from "../controllers/timeTracking.controller.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Start task
router.post("/time-tracking/start", startTaskHandler);

// Pause task
router.post("/time-tracking/pause", pauseTaskHandler);

// Resume task
router.post("/time-tracking/resume", resumeTaskHandler);

// Finish task
router.post("/time-tracking/finish", finishTaskHandler);

// Get time tracking logs
router.get("/time-tracking/logs", getTimeTrackingLogsHandler);

export default router;

