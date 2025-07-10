import { createTeam, getAllTeams } from "../services/teams.service.js";
import { formatResponse } from "../utils/response.js";

export const createTeamHandler = async (req, res) => {
  try {
    const {
      title,
      users = [],
      active = true,
      role = "member",
      leader_id,
    } = req.body;

    if (!title) {
      return res
        .status(400)
        .json(formatResponse({ statusCode: 400, detail: "Title is required" }));
    }

    const team = await createTeam({ title, active, role, users, leader_id });

    return res.status(201).json(
      formatResponse({
        statusCode: 201,
        detail: "Team created successfully",
        data: team,
      })
    );
  } catch (err) {
    console.error("Error creating team:", err);
    return res
      .status(500)
      .json(
        formatResponse({ statusCode: 500, detail: "Internal Server Error" })
      );
  }
};

export const getAllTeamsHandler = async (_req, res) => {
  try {
    const teams = await getAllTeams();
    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Teams fetched",
        data: teams,
      })
    );
  } catch (err) {
    console.error("Error fetching teams:", err);
    return res
      .status(500)
      .json(
        formatResponse({ statusCode: 500, detail: "Internal Server Error" })
      );
  }
};
