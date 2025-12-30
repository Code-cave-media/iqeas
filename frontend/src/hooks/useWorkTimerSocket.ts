import { useEffect, useRef, useState } from "react";

type ActionType = "START" | "PAUSE" | "STOP";

interface Payload {
  estimation_deliverable_id: number;
}

export function useWorkTimerSocket(workerId?: number, onUpdate?: () => void) {
  const socketRef = useRef<WebSocket | null>(null);
  const initializedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!workerId) return;

    if (initializedRef.current) return;
    initializedRef.current = true;

    const token = localStorage.getItem("auth_token");
    console.log(token);
    if (!token) {
      console.error("❌ Missing auth token for WS");
      return;
    }

    // ✅ TOKEN PASSED HERE
    const socket = new WebSocket(
      `ws://localhost:8080?token=${encodeURIComponent(token)}`
    );

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("🟢 WS connected");
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
      console.log("🔴 WS closed");
      setIsReady(false);
    };

    return () => {
      socket.close();
      socketRef.current = null;
      initializedRef.current = false;
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
