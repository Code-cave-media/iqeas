import { useEffect, useRef, useState } from "react";

type ActionType = "START" | "PAUSE" | "STOP";

interface Payload {
  estimation_deliverable_id: number;
}

export function useWorkTimerSocket(workerId?: number, onUpdate?: () => void) {
  const socketRef = useRef<WebSocket | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!workerId) return;

    const token = localStorage.getItem("auth_token");
    if (!token) {
      console.error("❌ Missing auth token for WS");
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(
      `${protocol}://localhost:8080?token=${encodeURIComponent(token)}`
    );

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("🟢 WS connected (client)");
      setIsReady(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("⏱ WS message:", data);

      if (data.status === "paused" || data.status === "stopped") {
        onUpdate?.();
      }
    };

    socket.onerror = (err) => {
      console.error("❌ WS error", err);
    };

    socket.onclose = () => {
      console.log("🔴 WS closed (client)");
      setIsReady(false);
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [workerId]);

  const sendAction = (action: ActionType, payload: Payload) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ WS not ready, action skipped:", action);
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        action,
        estimation_deliverable_id: payload.estimation_deliverable_id,
      })
    );
  };

  return { sendAction, isReady };
}
