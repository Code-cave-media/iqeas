import { saveUploadedFile } from "../services/uploadfiles.service.js";
import { formatResponse } from "../utils/response.js";

export const uploadFileHandler = async (req, res) => {
  try {
    const { label } = req.body;
    const file = req.file;
    const uploaded_by = req.user.id; 

    if (!file) {
      return res
        .status(400)
        .json(formatResponse({ statusCode: 400, detail: "No file uploaded" }));
    }

    const saved = await saveUploadedFile({
      label,
      filename: file.filename,
      uploaded_by,
    });

    return res
      .status(201)
      .json(
        formatResponse({
          statusCode: 201,
          detail: "File uploaded",
          data: saved,
        })
      );
  } catch (err) {
    console.error("Upload Error:", err);
    return res
      .status(500)
      .json(
        formatResponse({
          statusCode: 500,
          detail: "Upload failed",
          data: err.message,
        })
      );
  }
};
