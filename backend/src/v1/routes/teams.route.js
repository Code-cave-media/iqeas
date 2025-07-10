import express from "express";
import {
  createTeamHandler,
  EditTeamDataController,
  getAllTeamsHandler,
} from "../controllers/teams.controller.js";

const router = express.Router();

router.post("/teams", createTeamHandler);
router.patch("/teams/:id", EditTeamDataController);
router.get("/teams/get-all-teams", getAllTeamsHandler);

export default router;
