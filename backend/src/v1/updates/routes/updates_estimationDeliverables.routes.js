import express from "express";
import {
  createEstimationDeliverablesHandler,
  getEstimationDeliverablesHandler,
  updateEstimationDeliverableHandler,
  deleteEstimationDeliverableHandler,
  sendDeliverablesToAdmin,
} from "../controllers/estimationDeliverables.controller.js";
import { getEstimationTableHandler } from "../controllers/tableData.controller.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

router.post(
  "/estimation/:project_id/deliverables",
  createEstimationDeliverablesHandler
);

router.get(
  "/estimation/:project_id/deliverables",
  getEstimationDeliverablesHandler
);

router.get("/estimation/:project_id/table", getEstimationTableHandler);

router.patch(
  "/estimation/deliverables/:id",
  updateEstimationDeliverableHandler
);

router.delete(
  "/estimation/deliverables/:id",
  deleteEstimationDeliverableHandler
);

router.patch(
  "/estimation/deliverables/send-to-admin/:project_id",
  sendDeliverablesToAdmin
);

export default router;
