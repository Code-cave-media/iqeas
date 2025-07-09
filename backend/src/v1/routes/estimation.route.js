import express from "express";
import {
  createEstimationHandler,
  getEstimationHandler,
  updateEstimationHandler,
} from "../controllers/estimation.controller.js";
const router = express.Router();

router.post("/estimation", createEstimationHandler);
router.get("/estimation/:id", getEstimationHandler);
router.patch("/estimation/:id", updateEstimationHandler);

export default router;
