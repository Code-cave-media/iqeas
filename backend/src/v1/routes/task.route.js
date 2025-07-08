import express from "express";
import {
  createTaskHandler,
  getTaskHandler,
  updateTaskHandler,
} from "../controllers/task.controller.js";

const router = express.Router();

router.post("/task", createTaskHandler);
router.get("/task/:id", getTaskHandler);
router.patch("/task/:id", updateTaskHandler);

export default router;
