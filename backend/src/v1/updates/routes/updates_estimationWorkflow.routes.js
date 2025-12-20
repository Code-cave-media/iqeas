import express from "express";
import {
  sendEstimationToAdminHandler,
  adminVerifyAndAddCostHandler,
  sendEstimationToProposalsHandler,
  sendEstimationToClientHandler,
  getEstimationsPendingAdminHandler,
  getEstimationsPendingProposalsHandler,
} from "../controllers/estimationWorkflow.controller.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

router.patch("/estimation/:id/send-to-admin", sendEstimationToAdminHandler);

router.patch("/estimation/:id/admin-verify", adminVerifyAndAddCostHandler);

router.patch("/estimation/:id/send-to-proposals", sendEstimationToProposalsHandler);

router.patch("/estimation/:id/send-to-client", sendEstimationToClientHandler);

router.get("/estimation/pending-admin", getEstimationsPendingAdminHandler);

router.get("/estimation/pending-proposals", getEstimationsPendingProposalsHandler);

export default router;

