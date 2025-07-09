import express from "express";
import { getCurrentUser, login } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/auth/login", login);
router.get("/auth/me", authenticateToken, getCurrentUser);

export default router;
