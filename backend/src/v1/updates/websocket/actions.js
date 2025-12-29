import { updateConsumedTime } from "../services/workers.service.js";

export const activeTimers = new Map();

/* ---------- START ---------- */
export function handleStart(ws, worker_id, estimation_deliverable_id) {
  const key = `${worker_id}:${estimation_deliverable_id}`;

  if (activeTimers.has(key)) {
    ws.send(
      JSON.stringify({
        status: "already_running",
        worker_id,
        estimation_deliverable_id,
      })
    );
    return;
  }

  activeTimers.set(key, { t1: new Date() });

  ws.send(
    JSON.stringify({
      status: "started",
      worker_id,
      estimation_deliverable_id,
      started_at: new Date(),
    })
  );
}

/* ---------- PAUSE ---------- */
export async function handlePause(ws, worker_id, estimation_deliverable_id) {
  const key = `${worker_id}:${estimation_deliverable_id}`;
  const timer = activeTimers.get(key);

  if (!timer) {
    ws.send(
      JSON.stringify({
        error: "Timer not running",
        worker_id,
        estimation_deliverable_id,
      })
    );
    return;
  }

  await updateConsumedTime(
    worker_id,
    estimation_deliverable_id,
    timer.t1,
    new Date()
  );

  activeTimers.delete(key);

  ws.send(
    JSON.stringify({
      status: "paused",
      worker_id,
      estimation_deliverable_id,
    })
  );
}

/* ---------- STOP ---------- */
export async function handleStop(ws, worker_id, estimation_deliverable_id) {
  const key = `${worker_id}:${estimation_deliverable_id}`;
  const timer = activeTimers.get(key);

  if (!timer) {
    ws.send(
      JSON.stringify({
        error: "Timer not running",
        worker_id,
        estimation_deliverable_id,
      })
    );
    return;
  }

  await updateConsumedTime(
    worker_id,
    estimation_deliverable_id,
    timer.t1,
    new Date()
  );

  activeTimers.delete(key);

  ws.send(
    JSON.stringify({
      status: "stopped",
      worker_id,
      estimation_deliverable_id,
    })
  );
}
