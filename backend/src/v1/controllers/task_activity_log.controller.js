import { formatResponse } from "../utils/response.js";
import {
  createTaskActivity,
  getTaskActivityByTaskId,
} from "../services/task_activity_log.service.js";

export const postTaskActivity = async (req, res) => {
  try {
    const { task_id, user_id, action, note, uploaded_file_ids = [] } = req.body;

    const result = await createTaskActivity({
      task_id,
      user_id,
      action,
      note,
      uploaded_file_ids,
    });

    return res.status(201).json(
      formatResponse({
        statusCode: 201,
        detail: "Task activity created successfully",
        data: result,
      })
    );
  } catch (err) {
    console.error("Error creating task activity:", err);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Internal Server Error",
        data: err.message,
      })
    );
  }
};

export const getTaskActivities = async (req, res) => {
  try {
    const { task_id } = req.params;

    const result = await getTaskActivityByTaskId(task_id);

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Task activities fetched",
        data: result,
      })
    );
  } catch (err) {
    console.error("Error fetching task activities:", err);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Internal Server Error",
        data: err.message,
      })
    );
  }
};
