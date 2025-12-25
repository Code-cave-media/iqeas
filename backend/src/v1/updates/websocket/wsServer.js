import { WebSocketServer } from "ws";

import { handleStart, handlePause, handleStop } from "./actions.js";

export function initWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("WebSocket connected");

    ws.on("message", async (message) => {
      try {
        const { action, worker_id } = JSON.parse(message);

        switch (action) {
          case "START":
            handleStart(ws, worker_id);
            break;

          case "PAUSE":
            await handlePause(ws, worker_id);
            break;

          case "STOP":
            await handleStop(ws, worker_id);
            break;

          default:
            ws.send(JSON.stringify({ error: "Invalid action" }));
        }
      } catch (err) {
        ws.send(JSON.stringify({ error: "Invalid payload" }));
      }
    });
  });
}
