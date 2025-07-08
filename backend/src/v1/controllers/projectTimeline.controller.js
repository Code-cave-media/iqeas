import {
  createTimeline,
  updateTimeline,
  deleteTimeline,
  getTimelineById,
} from "../services/projectTimeline.service.js";
import { formatResponse } from "../utils/response.js";

export const createTimelineHandler = async (req, res) => {
  try {
    const timelineData = req.body;
    const newTimeline = await createTimeline(timelineData);
    return res
      .status(201)
      .json(formatResponse(201, "Timeline created", newTimeline));
  } catch (error) {
    console.error("Error creating timeline:", error);
    return res
      .status(500)
      .json(formatResponse(500, "Internal Server Error", error.message));
  }
};

export const updateTimelineHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedTimeline = await updateTimeline(id, updateData);

    if (!updatedTimeline) {
      return res.status(404).json(formatResponse(404, "Timeline not found"));
    }

    return res
      .status(200)
      .json(formatResponse(200, "Timeline updated", updatedTimeline));
  } catch (error) {
    console.error("Error updating timeline:", error);
    return res
      .status(500)
      .json(formatResponse(500, "Internal Server Error", error.message));
  }
};

export const deleteTimelineHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTimeline = await deleteTimeline(id);

    if (!deletedTimeline) {
      return res.status(404).json(formatResponse(404, "Timeline not found"));
    }

    return res
      .status(200)
      .json(formatResponse(200, "Timeline deleted", deletedTimeline));
  } catch (error) {
    console.error("Error deleting timeline:", error);
    return res
      .status(500)
      .json(formatResponse(500, "Internal Server Error", error.message));
  }
};

export const getTimelineHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const timeline = await getTimelineById(id);

    if (!timeline) {
      return res.status(404).json(formatResponse(404, "Timeline not found"));
    }

    return res
      .status(200)
      .json(formatResponse(200, "Timeline retrieved", timeline));
  } catch (error) {
    console.error("Error fetching timeline:", error);
    return res
      .status(500)
      .json(formatResponse(500, "Internal Server Error", error.message));
  }
};
