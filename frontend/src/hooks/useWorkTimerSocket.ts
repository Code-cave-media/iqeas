import { useEffect, useRef } from "react";

type ActionType = "START" | "PAUSE" | "STOP";

export function useWorkTimerSocket(workerId?: number, onUpdate?: () => void) {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!workerId) return;

    const socket = new WebSocket("ws://localhost:8080");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("🟢 WS connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("⏱ WS message:", data);

      if (data.status === "paused" || data.status === "stopped") {
        onUpdate?.(); // refresh work data
      }
    };

    socket.onerror = (err) => {
      console.error("❌ WS error", err);
    };

    socket.onclose = () => {
      console.log("🔴 WS closed");
    };

    return () => {
      socket.close();
    };
  }, [workerId]);

  const sendAction = (action: ActionType) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn("WS not ready");
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        action,
        worker_id: workerId,
      })
    );
  };

  return { sendAction };
}
