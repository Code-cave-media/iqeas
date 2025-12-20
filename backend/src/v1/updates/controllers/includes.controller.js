import { ProjectIdTOID } from "../services/includes.service.js"

import { formatResponse } from "../../utils/response.js";

export const getID = async (req, res) => {
    try {
        const { project_id } = req.params;
        const deliverables = await ProjectIdTOID(project_id);
        return res.status(200).json(
            formatResponse({
                statusCode: 200,
                detail: "id retrieved",
                data: deliverables,
            })
        );
    } catch (error) {
        console.error("Error fetching id:", error);
        return res.status(500).json(
            formatResponse({
                statusCode: 500,
                detail: "Internal Server Error",
            })
        );
    }
}