import { Server } from "socket.io";
import { createTaskChat } from "../services/chat.service";

export function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected: ", socket.id);

    socket.on("Join-task", (taskId) => {
      socket.join(`task-${taskId}`);
    });
  });

  socket.on("send_message", async (data) => {
    const { task_id, user_id, message, uploaded_files_ids = [] } = data;

    try {
      const savedMessage = await createTaskChat({
        task_id,
        user_id,
        message,
        uploaded_files_ids,
      });
      io.to(`task-${task_id}`).emit("receive-message", savedMessage);
    } catch (e) {
      console.error("Socket chat error:", e.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
}
