import express from "express";
import { searchEstimationsHandler } from "../controllers/search.controller.js";

const router = express.Router();

router.get("/query/search", searchEstimationsHandler); // <--- bind the handler here

export default router;
