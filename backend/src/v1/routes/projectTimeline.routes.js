import express from "express";
import {
  createTimelineHandler,
  updateTimelineHandler,
  deleteTimelineHandler,
  getTimelineHandler,
} from "../controllers/projectTimeline.controller.js";

const router = express.Router();

router.post("/project-timeline", createTimelineHandler);
router.patch("/edit/project-timeline/:id", updateTimelineHandler);
router.delete("/delete/project-timeline/:id", deleteTimelineHandler);
router.get("/get/project-timeline/:id", getTimelineHandler);

export default router;
