import express from "express";
import {
  createTeamHandler,
  getAllTeamsHandler,
} from "../controllers/teams.controller.js";

const router = express.Router();

router.post("/teams", createTeamHandler);
router.get("/teams/get-all-teams", getAllTeamsHandler);

export default router;
