import express from "express";
import {
  getWorkersController,
  getWorkerWorkByIdController,
} from "../controllers/workers.controller.js";

const router = express.Router();
router.get("/get-workers-data", getWorkersController);
router.get("/workers/:worker_id/work", getWorkerWorkByIdController);

export default router;
