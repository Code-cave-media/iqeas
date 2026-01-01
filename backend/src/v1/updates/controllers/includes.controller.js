import {
  getUserNameById,
  searchClientsByName,
} from "../services/includes.service.js";
import { formatResponse } from "../../utils/response.js";


export const getID = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "projectId is required",
      });
    }

    const projectDbId = await ProjectIdTOID(projectId);

    if (!projectDbId) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: projectDbId,
      },
    });
  } catch (error) {
    console.error("ProjectIdTOID error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUserNameController = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
      return res.status(400).json(
        formatResponse({
          statusCode: 400,
          detail: "Invalid user ID",
        })
      );
    }

    const name = await getUserNameById(userId);

    if (!name) {
      return res.status(404).json(
        formatResponse({
          statusCode: 404,
          detail: "User not found",
        })
      );
    }

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "User name retrieved successfully",
        data: { id: userId, name },
      })
    );
  } catch (error) {
    console.error("Error fetching user name:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Internal Server Error",
      })
    );
  }
};


export async function searchClients(req, res) {
  const { q } = req.query;

  if (!q) return res.json([]);

  const data = await searchClientsByName(q);
  res.json(
    formatResponse({
      statusCode: 200,
      detail: "User name retrieved successfully",
      data
    })
  );
}