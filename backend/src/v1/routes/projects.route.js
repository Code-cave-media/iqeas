import express from "express";
import {
  createNewProject,
  patchProject,
} from "../controllers/projects.controller.js";

const router = express.Router();

router.post("/projects", createNewProject);
router.patch("/projects/:id", patchProject);

export default router;
