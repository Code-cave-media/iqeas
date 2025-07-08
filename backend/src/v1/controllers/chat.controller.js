import { formatResponse } from "../utils/response.js";
import { createTaskChat, getTaskChats } from "../services/chat.service.js";

export const postTaskChat = async (req, res) => {
  try {
    const { task_id, user_id, message, uploaded_file_ids = [] } = req.body;

    const chat = await createTaskChat({
      task_id,
      user_id,
      message,
      uploaded_file_ids,
    });

    return res.status(201).json(
      formatResponse({
        statusCode: 201,
        detail: "Message sent",
        data: chat,
      })
    );
  } catch (err) {
    console.error("Error posting chat:", err.message);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Internal Server Error",
        data: err.message,
      })
    );
  }
};

export const getTaskChatMessages = async (req, res) => {
  try {
    const { task_id } = req.params;

    const chats = await getTaskChats(task_id);

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Chat history fetched",
        data: chats,
      })
    );
  } catch (err) {
    console.error("Error fetching chat history:", err.message);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Internal Server Error",
        data: err.message,
      })
    );
  }
};
