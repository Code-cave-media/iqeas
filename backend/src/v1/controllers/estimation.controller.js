import {
  createEstimation,
  getEstimationById,
  updateEstimation,
  getProjectsSentToPM,
  getProjectsApproved,
  getProjectsDraft,
  createEstimationCorrection,
  createInvoice,
  getEstimationByProjectId,
} from "../services/estimation.service.js";

import { updateProjectPartial } from "../services/projects.service.js";
import * as RFQDeliverablesService from "../updates/services/rfqDeliverables.service.js";
import { formatResponse } from "../utils/response.js";
import pool from "../config/db.js";

/* ========================= CREATE ESTIMATION ========================= */
export const createEstimationHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    const estimationData = req.body;

    if (!estimationData.project_id) {
      return res.status(400).json(
        formatResponse({
          statusCode: 400,
          detail: "Project ID is required",
        })
      );
    }

    const user_id = req.user.id;

    await client.query("BEGIN");

    const newEstimation = await createEstimation(
      { ...estimationData, user_id },
      client
    );

    if (estimationData.project_id) {
      await RFQDeliverablesService.linkRFQDeliverablesToEstimation(
        estimationData.project_id,
        newEstimation.id,
        client
      );
    }

    const projectUpdateData = await updateProjectPartial(
      estimationData.project_id,
      { estimation_status: "created" },
      client
    );

    const estimationResponse = await getEstimationById(
      newEstimation.id,
      client
    );

    await client.query("COMMIT");

    return res.status(201).json(
      formatResponse({
        statusCode: 201,
        detail: "Estimation created",
        data: {
          project: projectUpdateData,
          estimation: estimationResponse,
        },
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating estimation:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Internal Server Error",
      })
    );
  } finally {
    client.release();
  }
};

/* ========================= CREATE CORRECTION ========================= */
export const createEstimationCorrectionHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    const estimationData = req.body;

    if (!estimationData.estimation_id || !estimationData.project_id) {
      return res.status(400).json(
        formatResponse({
          statusCode: 400,
          detail: "Estimation ID and Project ID are required",
        })
      );
    }

    await client.query("BEGIN");

    const correction = await createEstimationCorrection(estimationData, client);

    const updatedProject = await updateProjectPartial(
      estimationData.project_id,
      { estimation_status: "back_to_you" },
      client
    );

    await client.query("COMMIT");

    return res.status(201).json(
      formatResponse({
        statusCode: 201,
        detail: "Estimation correction created",
        data: { project: updatedProject, correction },
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating estimation correction:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Internal Server Error",
      })
    );
  } finally {
    client.release();
  }
};

/* ========================= GET ESTIMATION BY ID ========================= */
export const getEstimationHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const estimation = await getEstimationById(id); // pool fallback

    if (!estimation) {
      return res.status(404).json(
        formatResponse({
          statusCode: 404,
          detail: "Estimation not found",
        })
      );
    }

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Estimation retrieved",
        data: estimation,
      })
    );
  } catch (error) {
    console.error("Error fetching estimation:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Internal Server Error",
      })
    );
  }
};

/* ========================= GET BY PROJECT ID ========================= */
export const getEstimationProjectHandler = async (req, res) => {
  try {
    const { project_id } = req.params;
    
    console.log(`sdk=> ${project_id}`);

    const estimation = await getEstimationByProjectId(project_id);


    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Estimation retrieved",
        data: estimation,
      })
    );
  } catch (error) {
    console.error("Error fetching estimation:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Internal Server Error",
      })
    );
  }
};

/* ========================= UPDATE ========================= */
export const updateEstimationHandler = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const updateData = req.body;

    await client.query("BEGIN");

    await updateEstimation(id, updateData, client);

    const estimationData = await getEstimationById(id, client);

    await client.query("COMMIT");

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Estimation updated",
        data: estimationData,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating estimation:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Internal Server Error",
      })
    );
  } finally {
    client.release();
  }
};

/* ========================= LISTINGS ========================= */
export const getPMProjects = async (req, res) => {
  const projects = await getProjectsSentToPM();
  return res.status(200).json(
    formatResponse({
      statusCode: 200,
      detail: "Projects sent to PM fetched",
      data: projects,
    })
  );
};

export const getApproved = async (req, res) => {
  const projects = await getProjectsApproved();
  return res.status(200).json(
    formatResponse({
      statusCode: 200,
      detail: "Approved projects fetched",
      data: projects,
    })
  );
};

export const getDraft = async (req, res) => {
  const projects = await getProjectsDraft();
  return res.status(200).json(
    formatResponse({
      statusCode: 200,
      detail: "Draft projects fetched",
      data: projects,
    })
  );
};

/* ========================= INVOICE ========================= */
export const createInvoiceController = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query("BEGIN");

    const invoice = await createInvoice(client, id, req.body, req.user.id);

    await client.query("COMMIT");

    return res.status(201).json(
      formatResponse({
        statusCode: 201,
        detail: "Invoice created",
        data: invoice,
      })
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating invoice:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Internal Server Error",
      })
    );
  } finally {
    client.release();
  }
};
