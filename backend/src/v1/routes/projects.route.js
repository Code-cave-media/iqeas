import express from "express";
import {
  createNewProject,
  getProjectsPaginatedController,
  patchProject,
  getEstimationProjects,
} from "../controllers/projects.controller.js";


const router = express.Router();

router.post("/projects", createNewProject);
router.patch("/projects/:id", patchProject);
router.get("/projects", getProjectsPaginatedController)
router.get("/projects/estimation", getEstimationProjects); // This is the new route


export default router;
