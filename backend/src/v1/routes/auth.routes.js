import express from "express";
import {
  forgotPasswordController,
  getCurrentUser,
  login,
  resetPasswordController,
  switchUserController,
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { resetPassword } from "../services/auth.service.js";
import { getAllUsers } from "../services/user.service.js";
import { getUsersController } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/auth/login", login);
router.get("/auth/me", authenticateToken, getCurrentUser);
router.post("/auth/forgot-password", forgotPasswordController);
router.post("/auth/reset-password", resetPasswordController);
router.post("/auth/switch-user", authenticateToken, switchUserController);
router.get("/auth/all-users", authenticateToken, getUsersController);

export default router;
