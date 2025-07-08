import {
  createTask,
  getTaskById,
  updateTask,
} from "../services/task.service.js";
import { formatResponse } from "../utils/response.js";

export const createTaskHandler = async (req, res) => {
  try {
    const taskData = req.body;

    if (
      !taskData.project_id ||
      !taskData.user_id ||
      !taskData.title ||
      !taskData.start_date
    ) {
      return res.status(400).json(
        formatResponse({
          statusCode: 400,
          detail: "project_id, user_id, title and start_date are required",
        })
      );
    }

    const task = await createTask(taskData);
    return res
      .status(201)
      .json(
        formatResponse({ statusCode: 201, detail: "Task created", data: task })
      );
  } catch (err) {
    console.error("Error creating task:", err);
    return res
      .status(500)
      .json(
        formatResponse({ statusCode: 500, detail: "Internal Server Error" })
      );
  }
};

export const getTaskHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await getTaskById(id);

    if (!task)
      return res
        .status(404)
        .json(formatResponse({ statusCode: 404, detail: "Task not found" }));

    return res
      .status(200)
      .json(
        formatResponse({ statusCode: 200, detail: "Task fetched", data: task })
      );
  } catch (err) {
    console.error("Error fetching task:", err);
    return res
      .status(500)
      .json(
        formatResponse({ statusCode: 500, detail: "Internal Server Error" })
      );
  }
};

export const updateTaskHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedTask = await updateTask(id, updates);

    if (!updatedTask)
      return res.status(404).json(
        formatResponse({
          statusCode: 404,
          detail: "Task not found or no updates",
        })
      );

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Task updated",
        data: updatedTask,
      })
    );
  } catch (err) {
    console.error("Error updating task:", err);
    return res
      .status(500)
      .json(
        formatResponse({ statusCode: 500, detail: "Internal Server Error" })
      );
  }
};
