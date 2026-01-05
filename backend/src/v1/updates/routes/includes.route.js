import express from "express";
import {
  getID,
  getUserNameController,
  searchClients,
  createHeaderController,
  getAllHeadersController,
  getArchivesController,
} from "../controllers/includes.controller.js";

import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);


router.get("/projects/:project_id/to_id", getID);

router.get("/username/:id", getUserNameController);

router.get("/clients/search", searchClients);



router.post("/create-new-fields", createHeaderController);
router.get("/fields", getAllHeadersController);


router.get("/pc-archived", getArchivesController);

export default router;
