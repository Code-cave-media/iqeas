import express from "express";
import {
  createPOHandler,
  getPOByIdHandler,
  getPOsByProjectHandler,
  forwardPOToAdminHandler,
  forwardPOToPMHandler,
  acceptPOHandler,
  updatePOHandler,
  getCoordinatorWorksController,
  getAllCoordinatorsController,
  getAllPMsController,
  getAllLeadersController,
} from "../controllers/po.controller.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/create-po", createPOHandler);

router.get("/getPo/:project_id", getPOsByProjectHandler);

router.patch("/:id/forward-to-admin", forwardPOToAdminHandler);

router.patch("/:id/forward-to-pm", forwardPOToPMHandler);

// Accept PO
router.patch("/:id/accept", acceptPOHandler);

// Update PO
router.patch("/:id", updatePOHandler);

router.get(
  "/coordinator/:project_coordinator_id/works",
  getCoordinatorWorksController
);

router.get("/coordinators", getAllCoordinatorsController);
router.get("/pms", getAllPMsController);
router.get("/leaders", getAllLeadersController);

export default router;
