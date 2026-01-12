import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";

import { handleStart, handlePause, handleStop } from "./actions.js";

export function initWebSocketServer(server) {

  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
  try {
    const token = new URL(req.url, "http://localhost").searchParams.get("token");

    console.log("🔑 WS token received:", token);

    if (!token) throw new Error("Missing token");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
``
    console.log("✅ WS token decoded:", decoded);

    ws.worker_id = decoded.id;

    console.log("🟢 WS connected:", ws.worker_id);
  } catch (err) {
    console.error("❌ WS auth failed:", err.message);
    ws.close();
    return;
  }

    ws.on("message", async (message) => {
      console.log("📩 WS raw message:", message.toString());

      let payload;

      try {
        payload = JSON.parse(message.toString());
      } catch (err) {
        console.error("❌ Invalid JSON");
        return ws.send(JSON.stringify({ error: "Invalid JSON" }));
      }

      const { action, estimation_deliverable_id } = payload;

      console.log("📦 Parsed payload:", payload);

      if (!action || !estimation_deliverable_id) {
        console.error("❌ Invalid payload structure");
        return ws.send(
          JSON.stringify({
            error: "Invalid payload",
            required: ["action", "estimation_deliverable_id"],
          })
        );
      }

      const normalizedAction = action.trim().toLowerCase();

      console.log("➡️ Normalized action:", normalizedAction);

      try {
        switch (normalizedAction) {
          case "start":
            console.log("🟢 Routing START");
            return await handleStart(
              ws,
              ws.worker_id,
              estimation_deliverable_id
            );

          case "pause":
            console.log("⏸ Routing PAUSE");
            return await handlePause(
              ws,
              ws.worker_id,
              estimation_deliverable_id
            );

          case "stop":
            console.log("⏹ Routing STOP");
            return await handleStop(
              ws,
              ws.worker_id,
              estimation_deliverable_id
            );

          default:
            console.error("❌ Unknown action:", action);
            return ws.send(
              JSON.stringify({
                error: "Invalid action",
                received: action,
              })
            );
        }
      } catch (err) {
        console.error("❌ Action handler error:", err);
        ws.send(JSON.stringify({ error: err.message }));
      }
    });

    ws.on("close", () => {
      console.log("🔴 WS disconnected:", ws.worker_id);
    });
  });
}
