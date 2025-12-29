import express from "express";
import { getAllProjectsToBeApprovedController } from "../controllers/leader.controller.js";

const router = express.Router();

router.get(
  "/estimations/team-projects/to-be-approved",
  getAllProjectsToBeApprovedController
);

export default router;
