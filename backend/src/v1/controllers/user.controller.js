import { formatResponse } from "../utils/response.js";
import {
  createUser,
  updateUserActiveStatus,
  getAllUsers,
  updateUserData,
  DeleteUser,
} from "../services/user.service.js";

import { getAllTeams } from "../services/teams.service.js";

export const createNewUser = async (req, res) => {
  const { email, phoneNumber, name, role, active } = req.body;
  console.log(email, phoneNumber, name, role, active);
  if (!email || !phoneNumber || !name || !role || active === null) {
    return res.status(400).json(
      formatResponse({
        statusCode: 400,
        detail: "Missing required fields",
      })
    );
  }

  try {
    const { user, password } = await createUser(
      email,
      phoneNumber,
      name,
      role,
      active
    );
    console.log(password);
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
        detail: "`active` must be a boolean (true/false)",
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
  } catch (error) {
    console.error("Error updating user status:", error.message);

    return res
      .status(500)
      .json(formatResponse({ statusCode: 500, detail: error.message }));
  }
};

export const getUsersController = async (req, res) => {
  try {
    const [users, teams] = await Promise.all([getAllUsers(), getAllTeams()]);

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Users and teams fetched successfully",
        data: {
          users,
          teams,
        },
      })
    );
  } catch (error) {
    console.error("Error fetching users and teams:", error.message);
    return res
      .status(500)
      .json(
        formatResponse({ statusCode: 500, detail: "Internal Server Error" })
      );
  }
};

export const EditUserDataController = async (req, res) => {
  const { id } = req.params;
  const { name, email, phoneNumber, active, role } = req.body;

  if (!id) {
    return res
      .status(400)
      .json(formatResponse({ statusCode: 400, detail: "User id is required" }));
  }

  try {
    const updatedUser = await updateUserData(id, {
      name,
      email,
      phoneNumber,
      active,
      role,
    });
    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "User updated successfully",
        data: updatedUser,
      })
    );
  } catch (error) {
    console.error("Error updating user:", error.message);
    return res
      .status(500)
      .json(formatResponse({ statusCode: 500, detail: error.message }));
  }
};

export const DeleteUserController = async (res, red) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json(
          formatResponse({ statusCode: 400, detail: "User id is required" })
        );
    }
    await DeleteUser(id);
    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "User deleted successfully",
        data: null,
      })
    );
  } catch (error) {
    console.error("Error updating user:", error.message);
    return res
      .status(500)
      .json(formatResponse({ statusCode: 500, detail: error.message }));
  }
};
