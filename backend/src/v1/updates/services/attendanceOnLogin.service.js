import pool from "../../config/db.js";

/**
 * Register attendance automatically when user logs in
 */
export async function registerAttendanceOnLogin(userId, loginTime, ipAddress, userAgent) {
  const today = new Date(loginTime);
  today.setHours(0, 0, 0, 0);
  const dateStr = today.toISOString().split("T")[0];

  // Check if attendance already exists for today
  const existing = await pool.query(
    `SELECT * FROM attendance 
     WHERE user_id = $1 AND date = $2`,
    [userId, dateStr]
  );

  if (existing.rows.length > 0) {
    // Update existing attendance if status is not present
    if (existing.rows[0].status !== "present") {
      await pool.query(
        `UPDATE attendance 
         SET status = 'present', updated_at = NOW()
         WHERE user_id = $1 AND date = $2`,
        [userId, dateStr]
      );
    }
    return existing.rows[0];
  }

  // Create new attendance record
  const result = await pool.query(
    `INSERT INTO attendance (user_id, date, status, note)
     VALUES ($1, $2, 'present', 'Auto-registered on login')
     RETURNING *`,
    [userId, dateStr]
  );

  // Log login
  await pool.query(
    `INSERT INTO user_login_logs (user_id, login_time, ip_address, user_agent)
     VALUES ($1, $2, $3, $4)`,
    [userId, loginTime, ipAddress, userAgent]
  );

  return result.rows[0];
}

/**
 * Register logout time
 */
export async function registerLogout(userId, logoutTime) {
  // Get the most recent login log without logout
  const loginLog = await pool.query(
    `SELECT * FROM user_login_logs
     WHERE user_id = $1 AND logout_time IS NULL
     ORDER BY login_time DESC
     LIMIT 1`,
    [userId]
  );

  if (loginLog.rows.length > 0) {
    await pool.query(
      `UPDATE user_login_logs
       SET logout_time = $1
       WHERE id = $2`,
      [logoutTime, loginLog.rows[0].id]
    );
  }
}

