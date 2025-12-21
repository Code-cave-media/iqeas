import express from "express";
import {
  createRFQDeliverablesHandler,
  getRFQDeliverablesHandler,
  addHoursToDeliverablesHandler,
  addAmountsToDeliverablesHandler,
  addWorkPersonToDeliverablesHandler,
} from "../controllers/rfqDeliverables.controller.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

router.post(
  "/projects/:project_id/rfq-deliverables",
  createRFQDeliverablesHandler
);

router.get("/projects/:project_id/rfq-deliverables", getRFQDeliverablesHandler);

router.patch(
  "/projects/:project_id/rfq-deliverables/add-hours",
  addHoursToDeliverablesHandler
);


router.patch(
  "/projects/:project_id/rfq-deliverables/add-work-person",
  addWorkPersonToDeliverablesHandler
);


router.patch(
  "/estimation/:estimation_id/add-hours",
  addHoursToDeliverablesHandler
);

router.patch(
  "/estimation/:project_id/add-amounts",
  addAmountsToDeliverablesHandler
);

export default router;
