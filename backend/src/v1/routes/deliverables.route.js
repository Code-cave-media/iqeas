import express from "express";
import {
  createDeliverablesHandler,
  getDeliverablesHandler,
} from "../controllers/deliverables.controller.js";

const router = express.Router();

router.post("/deliverables", createDeliverablesHandler);
router.get("/deliverables/:id", getDeliverablesHandler);

export default router;
