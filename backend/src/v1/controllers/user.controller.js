import { formatResponse } from "../utils/response.js";
import { createUser } from "../services/user.service.js";

export const createNewUser = async (req, res) => {
  const { email, phoneNumber, name, role, active } = req.body;

  if (!email || !phoneNumber || !name || !role || !active) {
    return res.status(400).json(
      formatResponse({
        statusCode: 400,
        detail: "Missing required fields",
      })
    );
  }

  try {
    const { user, password } = await createUser(email, phoneNumber, name, role,active);

    return res.status(201).json(
      formatResponse({
        statusCode: 201,
        detail: "User created successfully",
        data: { user, password },
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
