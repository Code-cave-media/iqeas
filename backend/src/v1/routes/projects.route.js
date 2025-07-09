import express from "express";
import {
  createNewProject,
  getProjectsPaginatedController,
  patchProject,
} from "../controllers/projects.controller.js";

const router = express.Router();

router.post("/projects", createNewProject);
router.patch("/projects/:id", patchProject);
router.get("/projects", getProjectsPaginatedController)

export default router;
