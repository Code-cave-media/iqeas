import * as POService from "../services/po.service.js";
import { formatResponse } from "../../utils/response.js";
import pool from "../../config/db.js";

export const createPOHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const poData = {
      ...req.body,
      received_by_user_id: req.user.id,
    };

    const po = await POService.createPurchaseOrder(poData, client);

    await client.query("COMMIT");

    const poDetails = await POService.getPurchaseOrderById(po.id, client);

    return res.status(201).json(
      formatResponse({
        statusCode: 201,
        detail: "Purchase Order created successfully",
        data: poDetails,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating PO:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: error.message || "Internal Server Error",
      })
    );
  } finally {
    client.release();
  }
};

export const getPOByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const po = await POService.getPurchaseOrderById(id);

    if (!po) {
      return res.status(404).json(
        formatResponse({
          statusCode: 404,
          detail: "Purchase Order not found",
        })
      );
    }

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Purchase Order retrieved successfully",
        data: po,
      })
    );
  } catch (error) {
    console.error("Error fetching PO:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Internal Server Error",
      })
    );
  }
};

export const getPOsByProjectHandler = async (req, res) => {
  try {
    const { project_id } = req.params;
    const pos = await POService.getPOsByProjectId(project_id);

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Purchase Orders retrieved successfully",
        data: pos,
      })
    );
  } catch (error) {
    console.error("Error fetching POs:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Internal Server Error",
      })
    );
  }
};

export const forwardPOToAdminHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const forwardedByUserId = req.user.id;

    const po = await POService.forwardPOToAdmin(id, forwardedByUserId, client);

    await client.query("COMMIT");

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "PO forwarded to Admin successfully",
        data: po,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error forwarding PO:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: error.message || "Internal Server Error",
      })
    );
  } finally {
    client.release();
  }
};

export const forwardPOToPMHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const forwardedByUserId = req.user.id;

    const po = await POService.forwardPOToPM(id, forwardedByUserId, client);

    await client.query("COMMIT");

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "PO forwarded to PM successfully",
        data: po,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error forwarding PO:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: error.message || "Internal Server Error",
      })
    );
  } finally {
    client.release();
  }
};

export const acceptPOHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const acceptedByUserId = req.user.id;

    const po = await POService.acceptPO(id, acceptedByUserId, client);

    await client.query("COMMIT");

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "PO accepted successfully",
        data: po,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error accepting PO:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: error.message || "Internal Server Error",
      })
    );
  } finally {
    client.release();
  }
};

export const updatePOHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const updates = req.body;

    const po = await POService.updatePO(id, updates, client);

    await client.query("COMMIT");

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "PO updated successfully",
        data: po,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating PO:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: error.message || "Internal Server Error",
      })
    );
  } finally {
    client.release();
  }
};

export async function getCoordinatorWorksController(req, res) {
  try {
    const { project_coordinator_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!project_coordinator_id) {
      return res.status(400).json({
        status_code: 400,
        detail: "Project coordinator ID is required",
      });
    }

    const result = await POService.getProjectCoordinatorWorks(
      project_coordinator_id,
      Number(page),
      Number(limit)
    );

    return res.status(200).json({
      status_code: 200,
      detail: "Coordinator works fetched successfully",
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    console.error("Error fetching coordinator works:", error);

    return res.status(500).json({
      status_code: 500,
      detail: "Internal server error",
    });
  }
}

export async function getAllCoordinatorsController(req, res) {
  try {
    const coordinators = await POService.getAllCoordinators();

    return res.status(200).json({
      status_code: 200,
      detail: "Project coordinators fetched successfully",
      data: coordinators,
    });
  } catch (error) {
    console.error("Error fetching coordinators:", error);

    return res.status(500).json({
      status_code: 500,
      detail: "Internal server error",
    });
  }
}

export async function getAllPMsController(req, res) {
  try {
    const pms = await POService.getAllPMs();

    return res.status(200).json({
      status_code: 200,
      detail: "Project managers fetched successfully",
      data: pms,
    });
  } catch (error) {
    console.error("Error fetching PMs:", error);

    return res.status(500).json({
      status_code: 500,
      detail: "Internal server error",
    });
  }
}

export async function getAllLeadersController(req, res) {
  try {
    const leaders = await POService.getAllleaders();

    return res.status(200).json({
      status_code: 200,
      detail: "Project managers fetched successfully",
      data: leaders,
    });
  } catch (error) {
    console.error("Error fetching Leaders:", error);

    return res.status(500).json({
      status_code: 500,
      detail: "Internal server error",
    });
  }
}

export async function fetchProjectCoordinators(req, res) {
  try {
    const { project_id } = req.params;
    if (!project_id)
      return res.status(400).json({ message: "project_id is required" });

    const data = await POService.getProjectCoordinatorsByProject(project_id);
    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ======================

export async function patchPurchaseOrder(req, res) {
  try {
    const poId = Number(req.params.id);
    const {
      po_number,
      received_date,
      received_by_user_id,
      notes,
      terms_and_conditions,
      uploaded_file_id, // optional, if provided replace file
    } = req.body;

    if (!poId) return res.status(400).json({ error: "PO ID is required" });

    const updateData = {
      po_number,
      received_date,
      received_by_user_id,
      notes,
      terms_and_conditions,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const result = await POService.updatePurchaseOrder(
      poId,
      updateData,
      uploaded_file_id
    );

    res.json({
      status: 200,
      message: "Purchase order updated successfully",
      result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update purchase order" });
  }
}
