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
  fetchProjectCoordinators,
  patchPurchaseOrder,
} from "../controllers/po.controller.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/create-po", createPOHandler);

router.get("/getPo/:project_id", getPOsByProjectHandler);


router.get(
  "/coordinator/:project_coordinator_id/works",
  getCoordinatorWorksController
);


router.get("/project-coordinators/:project_id", fetchProjectCoordinators);
router.patch("/update-po/:id", patchPurchaseOrder);


router.get("/coordinators", getAllCoordinatorsController);
router.get("/pms", getAllPMsController);
router.get("/leaders", getAllLeadersController);

export default router;
