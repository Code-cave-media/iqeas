import {
  createDeliverablesSubmission,
  getDeliverablesSubmission,
} from "../services/deliverables.service.js";
import { formatResponse } from "../utils/response.js";

export const createDeliverablesHandler = async (req, res) => {
  try {
    const { uploaded_file_ids = [], selected_file_ids = [] } = req.body;

    const result = await createDeliverablesSubmission({
      uploaded_file_ids,
      selected_file_ids,
    });

    return res
      .status(201)
      .json(
        formatResponse({
          statusCode: 201,
          detail: "Deliverables created",
          data: result,
        })
      );
  } catch (err) {
    console.error("Error creating Deliverables:", err);
    return res
      .status(500)
      .json(
        formatResponse({ statusCode: 500, detail: "Internal Server Error" })
      );
  }
};

export const getDeliverablesHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getDeliverablesSubmission(id);

    if (!result) {
      return res
        .status(404)
        .json(
          formatResponse({ statusCode: 404, detail: "Deliverables not found" })
        );
    }

    return res
      .status(200)
      .json(
        formatResponse({
          statusCode: 200,
          detail: "Deliverables fetched",
          data: result,
        })
      );
  } catch (err) {
    console.error("Error fetching Deliverables:", err);
    return res
      .status(500)
      .json(
        formatResponse({ statusCode: 500, detail: "Internal Server Error" })
      );
  }
};
