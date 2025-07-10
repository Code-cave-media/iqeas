import express from "express";
import {
  createEstimationHandler,
  getEstimationHandler,
  updateEstimationHandler,
  getPMProjects,
} from "../controllers/estimation.controller.js";
const router = express.Router();

router.post("/estimation", createEstimationHandler);
router.get("/estimation/:id", getEstimationHandler);
router.patch("/estimation/:id", updateEstimationHandler);
router.get("/estimation/pm", getPMProjects); // This is the new route

export default router;
