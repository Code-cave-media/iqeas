import pool from "../../config/db.js";
import { updateConsumedTime } from "../services/workers.service.js";

export const activeTimers = new Map();

/* ---------- START ---------- */
export async function handleStart(ws, worker_id, estimation_deliverable_id) {
  try {
    console.log("▶ START requested", {
      worker_id,
      estimation_deliverable_id,
    });

    const key = `${worker_id}:${estimation_deliverable_id}`;

    console.log("▶ Active timers keys:", [...activeTimers.keys()]);

    if (activeTimers.has(key)) {
      console.log("⛔ Timer already running for key:", key);
      return ws.send(JSON.stringify({ error: "Timer already running" }));
    }

    const statusQuery = `
      SELECT status
      FROM estimation_deliverables
      WHERE id = $1 AND worker_id = $2
    `;

    const { rows } = await pool.query(statusQuery, [
      estimation_deliverable_id,
      worker_id,
    ]);

    console.log("▶ DB rows:", rows);

    if (!rows.length) {
      console.log("⛔ Task not found in DB");
      return ws.send(JSON.stringify({ error: "Task not found" }));
    }

    const status = rows[0].status;
    console.log("▶ Current status from DB:", status);

    if (!["under progress", "rework"].includes(status)) {
      console.log("⛔ Status not allowed to start:", status);

      return ws.send(
        JSON.stringify({
          error: "Cannot start timer in current status",
          status,
        })
      );
    }

    const startedAt = new Date();

    activeTimers.set(key, { started_at: startedAt });

    console.log("✅ Timer started:", {
      key,
      started_at: startedAt,
    });

    ws.send(
      JSON.stringify({
        status: "started",
        estimation_deliverable_id,
        started_at: startedAt,
      })
    );
  } catch (err) {
    console.error("❌ START ERROR:", err);
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
