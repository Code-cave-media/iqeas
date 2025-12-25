import express from "express";
import {
  getWorkersController,
  getWorkerWorkByIdAndProjectIdController,
  getWorkersProjectWorkByIdController,
} from "../controllers/workers.controller.js";

const router = express.Router();
router.get("/get-workers-data", getWorkersController);
router.get("/workers/:worker_id/work/:project_id", getWorkerWorkByIdAndProjectIdController);
router.get("/workers/:worker_id/projects", getWorkersProjectWorkByIdController);

export default router;
