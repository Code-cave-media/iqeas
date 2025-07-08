import express from "express";
import { createNewUser } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/admin/create/create-user", createNewUser);

export default router;
