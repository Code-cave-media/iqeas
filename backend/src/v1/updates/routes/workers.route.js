import express from "express";
import {
  getWorkersController,
  getWorkerWorkByIdAndProjectIdController,
  getWorkersProjectWorkByIdController,
  markDeliverableCheckingController,
  uploadWorkerFilesController,
} from "../controllers/workers.controller.js";

import { authenticateToken } from "../../middleware/authMiddleware.js";

import { checkInDeliverable } from "../services/workers.service.js";

const router = express.Router();

router.get("/get-workers-data", getWorkersController);

router.get(
  "/workers/:worker_id/work/:project_id",
  getWorkerWorkByIdAndProjectIdController
);

router.get("/workers/:worker_id/projects", getWorkersProjectWorkByIdController);

router.patch(
  "/estimation-deliverables/:estimation_deliverable_id/checking/:worker_id",
  markDeliverableCheckingController
);

router.patch(
  "/estimation-deliverables/:estimation_deliverable_id/check-in",
  authenticateToken,
  checkInDeliverable
);

router.post(
  "/projects/:project_id/workers/:worker_id/upload",
  uploadWorkerFilesController
);

export default router;
