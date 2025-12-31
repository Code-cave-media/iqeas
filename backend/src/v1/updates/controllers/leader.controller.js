import {
  getAllProjectsToBeApproved,
  markEstimationDeliverableApproved,
  markEstimationDeliverableRejected,
  AddReworkNote,
  getProjectDetails
} from "../services/leader.service.js";

export async function getAllProjectsToBeApprovedController(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const leader_id = req.user.id;
    const result = await getAllProjectsToBeApproved(leader_id, page, limit);

    return res.status(200).json({
      success: true,
      message: "Projects to be approved fetched successfully",
      ...result,
    });
  } catch (error) {
    console.error("Error fetching projects to be approved:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects to be approved",
    });
  }
}

export async function approveEstimationDeliverable(req, res) {
  try {
    const { estimation_deliverable_id, worker_id } = req.params;

    const result = await markEstimationDeliverableApproved(
      Number(estimation_deliverable_id),
      worker_id
    );

    return res.status(200).json({
      success: true,
      message: "Deliverable approved successfully",
      data: result,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message,
    });
  }
}

export async function rejectEstimationDeliverable(req, res) {
  try {
    const { estimation_deliverable_id, worker_id } = req.params;

    const result = await markEstimationDeliverableRejected(
      Number(estimation_deliverable_id),
      worker_id
    );

    return res.status(200).json({
      success: true,
      message: "Deliverable marked for rework",
      data: result,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message,
    });
  }
}

export async function addReworkNoteController(req, res) {
  try {
    const { estimation_deliverable_id, worker_id } = req.params;
    const { note } = req.body;

    if (!note || note.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Note cannot be empty",
      });
    }

    const updatedDeliverable = await AddReworkNote(
      note,
      estimation_deliverable_id,
      worker_id
    );

    res.json({
      success: true,
      message: "Rework note added successfully",
      data: updatedDeliverable,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getProjectDetailsController(req, res) {
  try {
    const project_id = parseInt(req.params.project_id, 10);
    if (isNaN(project_id)) {
      return res.status(400).json({ success: false, message: "Invalid project ID" });
    }

    const result = await getProjectDetails(project_id);
    return res.status(200).json({
      success: true,
      message: "Project details fetched successfully",
      data: result.data
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
}