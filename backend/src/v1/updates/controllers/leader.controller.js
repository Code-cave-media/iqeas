import { getAllProjectsToBeApproved } from "../services/leader.service.js";

export async function getAllProjectsToBeApprovedController(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const result = await getAllProjectsToBeApproved(page, limit);

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
