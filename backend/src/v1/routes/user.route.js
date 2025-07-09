import express from "express";
import {
  createNewUser,
  toggleUserStatus,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/admin/create/create-user", createNewUser);

router.patch("/admin/user/:id/status", toggleUserStatus);

export default router;
