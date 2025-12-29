import {
  getWorkersData,
  getWorkersWorkByProjectIdWorkId,
  getWorkerProjectIds,
  getProjectDetails,
  markEstimationDeliverableChecking,
  uploadWorkerFiles,
} from "../services/workers.service.js";

export async function getWorkersController(req, res) {
  try {
    console.debug("[WORKERS][LIST] Fetching workers");

    const workers = await getWorkersData();

    return res.status(200).json({
      status: 200,
      success: true,
      data: workers,
    });
  } catch (error) {
    console.error("[WORKERS][LIST] Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch workers",
    });
  }
}

export async function getWorkerWorkByIdAndProjectIdController(req, res) {
  try {
    const { worker_id, project_id } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (!worker_id) {
      return res.status(400).json({
        success: false,
        message: "worker_id is required",
      });
    }

    console.debug(
      "[WORKERS][WORK] Fetching work for worker_id:",
      worker_id,
      "page:",
      page
    );

    const { data, total } = await getWorkersWorkByProjectIdWorkId(
      worker_id,
      project_id,
      limit,
      offset
    );

    return res.status(200).json({
      status: 200,
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[WORKERS][WORK] Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch worker work",
    });
  }
}

// Controller to handle request and response with pagination
export async function getWorkersProjectWorkByIdController(req, res) {
  try {
    const { worker_id } = req.params;
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    if (!worker_id) {
      console.debug("[CONTROLLER][WORKERS][PROJECT] worker_id is missing");
      return res
        .status(400)
        .json({ success: false, message: "worker_id is required" });
    }

    const projectIds = await getWorkerProjectIds(worker_id, limit, offset);

    if (projectIds.length === 0) {
      console.debug("[CONTROLLER][WORKERS][PROJECT] No projects found");
      return res
        .status(404)
        .json({ success: false, message: "No projects found for this worker" });
    }

    // Fetch project details for each project_id
    const projects = [];
    for (const row of projectIds) {
      const project = await getProjectDetails(row.project_id);
      if (project) projects.push(project);
    }

    console.debug(
      "[CONTROLLER][WORKERS][PROJECT] Returning projects:",
      projects
    );

    return res.status(200).json({
      success: true,
      data: projects,
      pagination: { page, limit, total: projects.length },
    });
  } catch (error) {
    console.error("[CONTROLLER][WORKERS][PROJECT][ERROR]", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching projects",
    });
  }
}

export async function markDeliverableCheckingController(req, res) {
  try {
    const estimation_deliverable_id = Number(
      req.params.estimation_deliverable_id
    );
    const worker_id = Number(req.params.worker_id);

    if (!estimation_deliverable_id) {
      return res.status(400).json({
        success: false,
        message: "estimation_deliverable_id is required",
      });
    }

    const updatedDeliverable = await markEstimationDeliverableChecking(
      estimation_deliverable_id,
      worker_id
    );

    return res.status(200).json({
      success: true,
      message: "Estimation deliverable marked as checking",
      data: updatedDeliverable,
    });
  } catch (error) {
    console.error("markDeliverableCheckingController error:", error.message);

    return res.status(403).json({
      success: false,
      message: error.message || "Not authorized to update this deliverable",
    });
  }
}

export async function uploadWorkerFilesController(req, res) {
  try {
    const { worker_id, project_id } = req.params;
    const { uploaded_file_id } = req.body;

    if (!uploaded_file_id) {
      return res.status(400).json({
        message: "uploaded_file_id is required",
      });
    }

    const result = await uploadWorkerFiles(
      worker_id,
      uploaded_file_id,
      project_id
    );

    return res.status(201).json({
      message: "File uploaded successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || "Failed to upload file",
    });
  }
}
