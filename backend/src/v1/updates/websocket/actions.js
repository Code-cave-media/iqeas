import { updateConsumedTime } from "../services/workers.service.js";

export const activeTimers = new Map();

export function handleStart(ws, worker_id) {
  if (activeTimers.has(worker_id)) {
    ws.send(
      JSON.stringify({
        status: "already_running",
        worker_id,
      })
    );
    return;
  }

  activeTimers.set(worker_id, {
    t1: new Date(),
  });

  ws.send(
    JSON.stringify({
      status: "started",
      worker_id,
      started_at: new Date(),
    })
  );
}

export async function handlePause(ws, worker_id) {
  const timer = activeTimers.get(worker_id);

  if (!timer) {
    ws.send(
      JSON.stringify({
        error: "Timer not running",
        worker_id,
      })
    );
    return;
  }

  await updateConsumedTime(worker_id, timer.t1, new Date());

  activeTimers.delete(worker_id);

  ws.send(
    JSON.stringify({
      status: "paused",
      worker_id,
    })
  );
}

export async function handleStop(ws, worker_id) {
  const timer = activeTimers.get(worker_id);

  if (!timer) {
    ws.send(
      JSON.stringify({
        error: "Timer not running",
        worker_id,
      })
    );
    return;
  }

  await updateConsumedTime(worker_id, timer.t1, new Date());

  activeTimers.delete(worker_id);

  ws.send(
    JSON.stringify({
      status: "stopped",
      worker_id,
    })
  );
}
