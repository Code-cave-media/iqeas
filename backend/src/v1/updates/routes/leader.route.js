import express from "express";
import {
  getAllProjectsToBeApprovedController,
  approveEstimationDeliverable,
  rejectEstimationDeliverable,
  addReworkNoteController,
  getProjectDetailsController,
} from "../controllers/leader.controller.js";

import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/estimations/team-projects/to-be-approved",
  getAllProjectsToBeApprovedController
);

router.patch(
  "/estimation-deliverables/:estimation_deliverable_id/approve/:worker_id",
  authenticateToken,
  approveEstimationDeliverable
);

router.patch(
  "/estimation-deliverables/:estimation_deliverable_id/rework/:worker_id",
  authenticateToken,
  rejectEstimationDeliverable
);

router.get("/leader/:project_id/details", getProjectDetailsController);

router.patch(
  "/rework-note/:estimation_deliverable_id/:worker_id",
  authenticateToken,
  addReworkNoteController
);

export default router;
