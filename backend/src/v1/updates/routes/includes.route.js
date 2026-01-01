import express from "express";
import {
  getID,
  getUserNameController,
  searchClients,
} from "../controllers/includes.controller.js";

import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);


router.get("/projects/:project_id/to_id", getID);

router.get("/username/:id", getUserNameController);

router.get("/clients/search", searchClients);


export default router;
