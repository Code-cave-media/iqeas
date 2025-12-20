import express from "express";
import {
  createWorkAllocationHandler,
  getWorkAllocationHandler,
  assignWorkPersonHandler,
  updateWorkAllocationHandler,
  updateConsumedTimeHandler,
} from "../controllers/workAllocation.controller.js";
import {
  getWorkAllocationTableHandler,
  getDesignerDashboardHandler,
} from "../controllers/tableData.controller.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
// router.use(authenticateToken);

// Create work allocation from estimation (with 10% hour reduction)
router.post("/projects/:project_id/work-allocation", createWorkAllocationHandler);

// Get work allocation dashboard
router.get("/projects/:project_id/work-allocation", getWorkAllocationHandler);

// Get work allocation table data (Table 1.0 format)
router.get("/projects/:project_id/work-allocation/table", getWorkAllocationTableHandler);

// Get designer dashboard (Table 2.0 format)
router.get("/projects/:project_id/designer-dashboard", getDesignerDashboardHandler);

// Assign work person
router.patch("/work-allocation/:id/assign", assignWorkPersonHandler);

// Update work allocation
router.patch("/work-allocation/:id", updateWorkAllocationHandler);

// Update consumed time
router.patch("/work-allocation/:id/consumed-time", updateConsumedTimeHandler);

export default router;

