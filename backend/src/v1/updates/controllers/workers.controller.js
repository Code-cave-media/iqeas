import {
  getWorkersData,
  getWorkersWorkById,
} from "../services/workers.service.js";

export async function getWorkersController(req, res) {
  try {
    console.debug("[WORKERS][LIST] Fetching workers");

    const workers = await getWorkersData();

    return res.status(200).json({
      status: 200,
      success: true,
      data: workers,
    });
  } catch (error) {
    console.error("[WORKERS][LIST] Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch workers",
    });
  }
}

export async function getWorkerWorkByIdController(req, res) {
  try {
    const { worker_id } = req.params;

    if (!worker_id) {
      return res.status(400).json({
        success: false,
        message: "worker_id is required",
      });
    }

    console.debug("[WORKERS][WORK] Fetching work for worker_id:", worker_id);

    const work = await getWorkersWorkById(worker_id);

    return res.status(200).json({
      success: true,
      data: work,
    });
  } catch (error) {
    console.error("[WORKERS][WORK] Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch worker work",
    });
  }
}
