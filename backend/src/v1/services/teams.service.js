import pool from "../config/db.js";

export async function createTeam({
  title,
  description = "",
  active = true,
  role = "",
  users = [],
}) {
  const result = await pool.query(
    `INSERT INTO teams (title, description, active, role, users)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [title, description, active, role, JSON.stringify(users)]
  );

  return result.rows[0];
}

export async function getAllTeams() {
  const result = await pool.query(
    `SELECT * FROM teams ORDER BY created_at DESC`
  );

  return await Promise.all(
    result.rows.map(async (row) => {
      const userIds = row.users ? row.users.map(Number) : [];

      const userResult = userIds.length
        ? await pool.query(
            `SELECT name, id FROM users WHERE id = ANY($1::int[])`,
            [userIds]
          )
        : { rows: [] };

      return {
        ...row,
        users: userResult.rows,
      };
    })
  );
}
export async function updateTeamActiveStatus(id, isActive) {
  const result = await pool.query(
    `UPDATE teams SET active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, title, users, active`,
    [isActive, id]
  );

  if (result.rows.length === 0) {
    throw new Error("Team not found");
  }

  return result.rows[0];
}

export async function updateTeamData(id, { title, users, active }) {
  const result = await pool.query(
    `UPDATE teams SET
      title = COALESCE($1, title),
      active = COALESCE($2, active),
      users = COALESCE($3, users),
      updated_at = NOW()
    WHERE id = $4
    RETURNING id, users, title, active`,
    [title, active, users, id]
  );
  if (result.rows.length === 0) {
    throw new Error("Team not found");
  }

  const row = result.rows[0];
  const userIds = row.users ? row.users.map(Number) : [];
  const userResult = userIds.length
    ? await pool.query(`SELECT name, id FROM users WHERE id = ANY($1::int[])`, [
        userIds,
      ])
    : { rows: [] };
  return {
    ...row,
    users: userResult.rows,
  };
}
