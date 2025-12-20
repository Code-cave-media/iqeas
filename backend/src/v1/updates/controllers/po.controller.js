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

