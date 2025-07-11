import express from "express";
import {
  postTaskActivity,
  getTaskActivities,
} from "../controllers/task_activity_log.controller.js";

const router = express.Router();

router.post("/post/task_activity_log", postTaskActivity);
router.get("/get/task_activity_log/:task_id", getTaskActivities);

export default router;
