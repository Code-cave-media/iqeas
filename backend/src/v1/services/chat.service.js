import pool from "../config/db.js";

export async function createTaskChat({
  task_id,
  user_id,
  message,
  uploaded_file_ids = [],
}) {
  const { rows } = await pool.query(
    `INSERT INTO task_chats (task_id, user_id, message)
     VALUES ($1, $2, $3) RETURNING *`,
    [task_id, user_id, message]
  );

  const chat = rows[0];

  const filePromises = uploaded_file_ids.map((fileId) =>
    pool.query(
      `INSERT INTO task_chat_files (task_chat_id, uploaded_file_id)
       VALUES ($1, $2)`,
      [chat.id, fileId]
    )
  );

  await Promise.all(filePromises);

  return chat;
}

export async function getTaskChats(task_id) {
  const { rows: chats } = await pool.query(
    `SELECT * FROM task_chats WHERE task_id = $1 ORDER BY created_at ASC`,
    [task_id]
  );

  for (const chat of chats) {
    const { rows: files } = await pool.query(
      `SELECT uf.* FROM uploaded_files uf
       JOIN task_chat_files tcf ON uf.id = tcf.uploaded_file_id
       WHERE tcf.task_chat_id = $1`,
      [chat.id]
    );
    chat.files = files;
  }

  return chats;
}
