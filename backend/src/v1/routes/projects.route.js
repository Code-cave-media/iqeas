import express from "express";
import {
  createNewProject,
  getProjectsPaginatedController,
  patchProject,
} from "../controllers/projects.controller.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/projects", authenticateToken, createNewProject);
router.patch("/projects/:id", authenticateToken, patchProject);
router.get("/projects", authenticateToken, getProjectsPaginatedController);

export default router;
