import express from "express";
import {
  createRFQDeliverablesHandler,
  getRFQDeliverablesHandler,
  addHoursToDeliverablesHandler,
  addAmountsToDeliverablesHandler,
  addWorkPersonToDeliverablesHandler,
} from "../controllers/rfqDeliverables.controller.js";

import sendQuotationEmailToClient from "../../utils/sendMailToClient.js"
import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

router.post(
  "/projects/:project_id/rfq-deliverables",
  createRFQDeliverablesHandler
);

router.get("/projects/:project_id/rfq-deliverables", getRFQDeliverablesHandler);

router.patch(
  "/projects/:project_id/rfq-deliverables/add-hours",
  addHoursToDeliverablesHandler
);


router.patch(
  "/projects/:project_id/rfq-deliverables/add-work-person",
  addWorkPersonToDeliverablesHandler
);


router.patch(
  "/estimation/:estimation_id/add-hours",
  addHoursToDeliverablesHandler
);

router.patch(
  "/estimation/:project_id/add-amounts",
  addAmountsToDeliverablesHandler
);

router.post("/client/send-quotation", async (req, res) => {
  try {
    const { to_email, client_name, project_name, message, file_path } =
      req.body;

    if (!to_email || !client_name || !project_name || !message || !file_path) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const isSent = await sendQuotationEmailToClient(
      to_email,
      client_name,
      project_name,
      message,
      file_path
    );

    if (!isSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send quotation email",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Quotation email sent successfully",
    });
  } catch (error) {
    console.error("Send quotation route error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});


export default router;
