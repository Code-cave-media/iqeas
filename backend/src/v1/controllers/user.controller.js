import { formatResponse } from "../utils/response.js";
import {
  createUser,
  updateUserActiveStatus,
} from "../services/user.service.js";

export const createNewUser = async (req, res) => {
  const { email, phonenumber, name, role } = req.body;

  if (!email || !phonenumber || !name || !role) {
    return res.status(400).json(formatResponse(400, "Missing required fields"));
  }

  try {
    const { user } = await createUser(email, phonenumber, name, role);

    return res.status(201).json(
      formatResponse({
        statusCode: 201,
        detail: "User created successfully",
        data: { user },
      })
    );
  } catch (e) {
    console.error("Error creating user:", e.message);

    return res
      .status(500)
      .json(
        formatResponse({ statusCode: 500, detail: "Internal Server Error" })
      );
  }
};

export const toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;

  if (typeof active !== "boolean") {
    return res.status(400).json(
      formatResponse({
        statusCode: 400,
        detail: "`active` must be boolean (true/false)",
      })
    );
  }

  try {
    const user = await updateUserActiveStatus(id, active);

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: `User status updated to ${active ? "active" : "inactive"}`,
        data: user,
      })
    );
  } catch (e) {
    console.error("Error updating user status:", e.message);

    return res
      .status(500)
      .json(
        formatResponse({ statusCode: 500, detail: "Internal Server Error" })
      );
  }
};
