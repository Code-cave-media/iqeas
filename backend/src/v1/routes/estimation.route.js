import express from "express";
import { createEstimationHandler } from "../controllers/estimation.controller.js";

const router = express.Router();

router.post("/estimation", createEstimationHandler);

export default router;
