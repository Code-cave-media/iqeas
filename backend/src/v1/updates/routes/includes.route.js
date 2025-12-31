import express from "express";
import {
  getID,
  getUserNameController,
} from "../controllers/includes.controller.js";

import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);


router.get("/projects/:project_id/to_id", getID);

router.get("/username/:id", getUserNameController);

export default router;
