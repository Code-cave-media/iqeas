import express from "express";
import { login } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../utils/verification.js";

const router = express.Router();

router.post("/auth/login", login);

export default router;
