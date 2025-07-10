import express from "express";
import {
  createNewUser,
  getUsersController,
  toggleUserStatus,
} from "../controllers/user.controller.js";


import { authenticateToken } from "../middleware/authMiddleware.js"
import { allowRoles } from "../utils/verification.js";

const router = express.Router();

router.post("/admin/create/create-user", createNewUser);

router.patch("/admin/user/:id/status", toggleUserStatus);

router.get("/admin/get-users",authenticateToken, allowRoles("admin"), getUsersController);

export default router;
