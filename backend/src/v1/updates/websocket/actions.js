import pool from "../../config/db.js";
import { updateConsumedTime } from "../services/workers.service.js";

export const activeTimers = new Map();

/* ---------- START ---------- */
export async function handleStart(ws, worker_id, estimation_deliverable_id) {
  try {
    const key = `${worker_id}:${estimation_deliverable_id}`;

    if (activeTimers.has(key)) {
      return ws.send(JSON.stringify({ error: "Timer already running" }));
    }

    // ✅ Check DB status before starting
    const statusQuery = `
      SELECT status
      FROM estimation_deliverables
      WHERE id = $1 AND worker_id = $2
    `;

    const { rows } = await pool.query(statusQuery, [
      estimation_deliverable_id,
      worker_id,
    ]);

    if (!rows.length) {
      return ws.send(JSON.stringify({ error: "Task not found" }));
    }

    const status = rows[0].status;

    if (!["under_progress", "rework"].includes(status)) {
      return ws.send(
        JSON.stringify({
          error: "Cannot start timer in current status",
          status,
        })
      );
    }

    activeTimers.set(key, { started_at: new Date() });

    ws.send(
      JSON.stringify({
        status: "started",
        estimation_deliverable_id,
        started_at: new Date(),
      })
    );
  } catch (err) {
    ws.send(JSON.stringify({ error: err.message }));
  }
}

/* ---------- PAUSE ---------- */
export async function handlePause(ws, worker_id, estimation_deliverable_id) {
  const key = `${worker_id}:${estimation_deliverable_id}`;
  const timer = activeTimers.get(key);

  if (!timer) {
    return ws.send(JSON.stringify({ error: "Timer not running" }));
  }

  await updateConsumedTime(
    worker_id,
    estimation_deliverable_id,
    timer.started_at,
    new Date()
  );

  activeTimers.delete(key);

  ws.send(
    JSON.stringify({
      status: "paused",
      estimation_deliverable_id,
    })
  );
}

/* ---------- STOP ---------- */
export async function handleStop(ws, worker_id, estimation_deliverable_id) {
  const key = `${worker_id}:${estimation_deliverable_id}`;
  const timer = activeTimers.get(key);

  if (!timer) {
    return ws.send(JSON.stringify({ error: "Timer not running" }));
  }

  await updateConsumedTime(
    worker_id,
    estimation_deliverable_id,
    timer.started_at,
    new Date()
  );

  activeTimers.delete(key);

  ws.send(
    JSON.stringify({
      status: "stopped",
      estimation_deliverable_id,
    })
  );
}
