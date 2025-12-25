import express from "express";
import {
  createPOHandler,
  getPOByIdHandler,
  getPOsByProjectHandler,
  forwardPOToAdminHandler,
  forwardPOToPMHandler,
  acceptPOHandler,
  updatePOHandler,
} from "../controllers/po.controller.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create PO
router.post("/create-po", createPOHandler);

// Get PO by ID
// router.get("/:id", getPOByIdHandler);

// Get POs by Project
router.get("/project/:project_id", getPOsByProjectHandler);

// Forward PO to Admin (Proposal team)
router.patch("/:id/forward-to-admin", forwardPOToAdminHandler);

// Forward PO to PM
router.patch("/:id/forward-to-pm", forwardPOToPMHandler);

// Accept PO
router.patch("/:id/accept", acceptPOHandler);

// Update PO
router.patch("/:id", updatePOHandler);

export default router;

