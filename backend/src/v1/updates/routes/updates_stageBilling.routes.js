import express from "express";
import {
  generateStageInvoiceHandler,
  getStageBillingsHandler,
  forwardInvoiceToProposalHandler,
  forwardInvoiceToClientHandler,
  markInvoiceAsPaidHandler,
} from "../controllers/stageBilling.controller.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Generate invoice for completed stage
router.post("/projects/:project_id/stages/:stage_id/invoice", generateStageInvoiceHandler);

// Get stage billings for project
router.get("/projects/:project_id/billings", getStageBillingsHandler);

// Forward invoice to Proposal team
router.patch("/billings/:id/forward-to-proposal", forwardInvoiceToProposalHandler);

// Forward invoice to Client
router.patch("/billings/:id/forward-to-client", forwardInvoiceToClientHandler);

// Mark invoice as paid
router.patch("/billings/:id/mark-paid", markInvoiceAsPaidHandler);

export default router;

