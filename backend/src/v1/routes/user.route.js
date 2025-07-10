import express from "express";
import {
  createNewUser,
  EditUserDataController,
  getUsersController,
  toggleUserStatus,
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../utils/verification.js";
import { DeleteUser } from "../services/user.service.js";

const router = express.Router();

router.post(
  "/admin/create/create-user",
  authenticateToken,
  allowRoles("admin"),
  createNewUser
);

router.patch(
  "/admin/user/:id/status",
  authenticateToken,
  allowRoles("admin"),
  toggleUserStatus
);

router.get(
  "/admin/get-users",
  authenticateToken,
  allowRoles("admin"),
  getUsersController
);

router.patch(
  "/admin/users/:id",
  authenticateToken,
  allowRoles("admin"),
  EditUserDataController
);

router.delete(
  "/admin/users/:id",
  authenticateToken,
  allowRoles("admin"),
  DeleteUser
);

export default router;
