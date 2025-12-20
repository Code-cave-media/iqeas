import express from "express";
import authRoute from "./routes/auth.routes.js";
import userRoute from "./routes/user.route.js";
import projectRoute from "./routes/projects.route.js";
import projectMoreInfoRoute from "./routes/projectMoreInfo.route.js";
import estimationRoute from "./routes/estimation.route.js";
import projectTimelineRoute from "./routes/projectTimeline.routes.js";
import deliverablesRoute from "./routes/deliverables.route.js";
import teamsRoute from "./routes/teams.route.js";
import taskRoute from "./routes/task.route.js";
import taskActivityLogRoute from "./routes/task_activity_log.route.js";
import chatRoute from "./routes/chat.route.js";
import uploadFileRoute from "./routes/uploadfiles.route.js";
import searchRoute from "./routes/search.route.js";
import workflowRoute from "./routes/workflow.route.js";
import documentRoute from "./routes/documents.route.js";
import documentFileRoute from "./routes/documentFiles.route.js";
import attendanceRoute from "./routes/attendance.routes.js";
import salaryRoute from "./routes/salary.routes.js";
import leaveRoute from "./routes/leave.route.js";

// Workflow Updates Routes
import updatesPORoute from "./updates/routes/updates_po.routes.js";
import updatesRFQDeliverablesRoute from "./updates/routes/updates_rfqDeliverables.routes.js";
import updatesEstimationDeliverablesRoute from "./updates/routes/updates_estimationDeliverables.routes.js";
import updatesEstimationWorkflowRoute from "./updates/routes/updates_estimationWorkflow.routes.js";
import updatesWorkAllocationRoute from "./updates/routes/updates_workAllocation.routes.js";
import updatesTimeTrackingRoute from "./updates/routes/updates_timeTracking.routes.js";
import updatesWeeklyTimesheetRoute from "./updates/routes/updates_weeklyTimesheet.routes.js";
import updatesStageBillingRoute from "./updates/routes/updates_stageBilling.routes.js";
import UpdatesGetId from "./updates/routes/includes.route.js";

import cors from "cors";
import createInitialAdmin from "./utils/seed.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1", authRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1", projectRoute);
app.use("/api/v1", projectMoreInfoRoute);
app.use("/api/v1", estimationRoute);
app.use("/api/v1", projectTimelineRoute);
app.use("/api/v1", deliverablesRoute);
app.use("/api/v1", teamsRoute);
app.use("/api/v1", taskRoute);
app.use("/api/v1", taskActivityLogRoute);
app.use("/api/v1", chatRoute);
app.use("/api/v1", uploadFileRoute);
app.use("/api/v1", searchRoute);
app.use("/api/v1", workflowRoute);
app.use("/api/v1", documentRoute);
app.use("/api/v1", documentFileRoute);
app.use("/api/v1", attendanceRoute);
app.use("/api/v1", salaryRoute);
app.use("/api/v1", leaveRoute);

// Workflow Updates Routes
app.use("/api/v1/updates", updatesPORoute);
app.use("/api/v1/updates", updatesRFQDeliverablesRoute);
app.use("/api/v1/updates", updatesEstimationDeliverablesRoute);
app.use("/api/v1/updates", updatesEstimationWorkflowRoute);
app.use("/api/v1/updates", updatesWorkAllocationRoute);
app.use("/api/v1/updates", updatesTimeTrackingRoute);
app.use("/api/v1/updates", updatesWeeklyTimesheetRoute);
app.use("/api/v1/updates", updatesStageBillingRoute);
app.use("/api/v1/updates", UpdatesGetId);

const PORT = process.env.PORT || 8080;

// (async () => {
//   await createInitialAdmin();
// })();

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
export default app;
