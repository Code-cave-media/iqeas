import express from "express";
import {
  createProjectMoreInfoHandler,
  getProjectMoreInfoHandler,
  updateProjectMoreInfoHandler,
} from "../controllers/projectMoreInfo.controller.js";

const router = express.Router();

router.post("/project-more-info", createProjectMoreInfoHandler);
router.get("/project-more-info/:id", getProjectMoreInfoHandler);
router.patch("/project-more-info/:id", updateProjectMoreInfoHandler);

export default router;
