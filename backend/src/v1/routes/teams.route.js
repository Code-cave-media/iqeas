import express from "express";
import {
  createTeamHandler,
  getAllTeamsHandler,
} from "../controllers/teams.controller.js";

const router = express.Router();

router.post("/teams", createTeamHandler);
router.get("/", getAllTeamsHandler);

export default router;
