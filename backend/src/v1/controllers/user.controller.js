import { formatResponse } from "../utils/response.js";
import { createUser } from "../services/user.service.js";

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
      .json(formatResponse({statusCode: 500, detail: "Internal Server Error"}));
  }
};
