import {
  createProject,
  updateProjectPartial,
  getProjectByPagination,
} from "../services/projects.service.js";
import { formatResponse } from "../utils/response.js";

export const createNewProject = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is in req.user
    const project = await createProject({...req.body,user_id: userId});
    return res.status(201).json(
      formatResponse({
        statusCode: 201,
        detail: "Project created successfully",
        data: project,
      })
    );
  } catch (error) {
    console.error("Error creating project:", error.message);
    return res
      .status(500)
      .json(
        formatResponse({ statusCode: 500, detail: "Internal Server Error" })
      );
  }
};

export const patchProject = async (req, res) => {
  const { id } = req.params;
  const fieldsToUpdate = req.body;

  if (!id) {
    return res
      .status(400)
      .json(
        formatResponse({ statusCode: 400, detail: "Project ID is required" })
      );
  }

  try {
    const updatedProject = await updateProjectPartial(id, fieldsToUpdate);

    if (!updatedProject) {
      return res
        .status(404)
        .json(formatResponse({ statusCode: 404, detail: "Project not found" }));
    }

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Project updated successfully",
        data: updatedProject,
      })
    );
  } catch (error) {
    console.error("Error updating project:", error);
    return res
      .status(500)
      .json(
        formatResponse({ statusCode: 500, detail: "Internal Server Error" })
      );
  }
};

export async function getProjectsPaginatedController(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;

    const data = await getProjectByPagination(page, size);

    res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Project fetched sucessfully",
        data: data,
      })
    );
  } catch (error) {
    res
      .status(500)
      .json(
        formatResponse({ statusCode: 500, detail: "Internal Server Error" })
      );
      console.error("Error fetching projects:", error.message);
  }
}
