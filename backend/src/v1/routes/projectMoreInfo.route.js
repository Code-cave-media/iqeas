import express from "express";
import {
  createProjectMoreInfoHandler,
//   getProjectMoreInfoHandler,
} from "../controllers/projectMoreInfo.controller.js";

const router = express.Router();

router.post("/project-more-info", createProjectMoreInfoHandler);
// router.get("/project-more-info/:id", getProjectMoreInfoHandler);

export default router;
