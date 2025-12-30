import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";

import { handleStart, handlePause, handleStop } from "./actions.js";

export function initWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    try {
      // 🔐 Extract token from query
      const token = new URL(req.url, "http://localhost").searchParams.get(
        "token"
      );
      if (!token) throw new Error("Missing token");

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      ws.worker_id = decoded.id;

      console.log("🟢 WS connected:", ws.worker_id);
    } catch (err) {
      ws.close();
      return;
    }

    ws.on("message", async (message) => {
      try {
        const { action, estimation_deliverable_id } = JSON.parse(message);

        if (!action || !estimation_deliverable_id) {
          return ws.send(JSON.stringify({ error: "Invalid payload" }));
        }

        switch (action) {
          case "START":
            return handleStart(ws, ws.worker_id, estimation_deliverable_id);

          case "PAUSE":
            return await handlePause(
              ws,
              ws.worker_id,
              estimation_deliverable_id
            );

          case "STOP":
            return await handleStop(
              ws,
              ws.worker_id,
              estimation_deliverable_id
            );

          default:
            return ws.send(
              JSON.stringify({
                error: "Invalid action",
                received: action,
              })
            );
        }
      } catch (err) {
        ws.send(JSON.stringify({ error: err.message }));
      }
    });
  });
}
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";

import { handleStart, handlePause, handleStop } from "./actions.js";

export function initWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    try {
      // 🔐 Extract token from query
      const token = new URL(req.url, "http://localhost").searchParams.get(
        "token"
      );
      if (!token) throw new Error("Missing token");

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      ws.worker_id = decoded.id;

      console.log("🟢 WS connected:", ws.worker_id);
    } catch (err) {
      ws.close();
      return;
    }

    ws.on("message", async (message) => {
      try {
        const { action, estimation_deliverable_id } = JSON.parse(message);

        if (!action || !estimation_deliverable_id) {
          return ws.send(JSON.stringify({ error: "Invalid payload" }));
        }

        switch (action) {
          case "START":
            return handleStart(ws, ws.worker_id, estimation_deliverable_id);

          case "PAUSE":
            return await handlePause(
              ws,
              ws.worker_id,
              estimation_deliverable_id
            );

          case "STOP":
            return await handleStop(
              ws,
              ws.worker_id,
              estimation_deliverable_id
            );

          default:
            return ws.send(
              JSON.stringify({
                error: "Invalid action",
                received: action,
              })
            );
        }
      } catch (err) {
        ws.send(JSON.stringify({ error: err.message }));
      }
    });
  });
}
