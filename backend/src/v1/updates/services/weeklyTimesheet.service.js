import pool from "../../config/db.js";

export function getWeekStartDate(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  return new Date(d.setDate(diff));
}

export function getWeekEndDate(date = new Date()) {
  const weekStart = getWeekStartDate(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6); // Sunday
  return weekEnd;
}

export async function createOrUpdateWeeklyTimesheet(
  userId,
  weekStartDate,
  client = pool
) {
  const weekStart = getWeekStartDate(weekStartDate);
  const weekEnd = getWeekEndDate(weekStart);

  // Check if timesheet exists
  const existing = await client.query(
    `SELECT * FROM weekly_timesheets 
     WHERE user_id = $1 AND week_start_date = $2`,
    [userId, weekStart]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  // Get tasks for the week
  const tasks = await getTasksForWeek(userId, weekStart, weekEnd, client);

  const totalHours = tasks.reduce(
    (sum, t) => sum + parseFloat(t.hours_spent || 0),
    0
  );
  const tasksCompleted = tasks.filter((t) => t.status === "completed").length;
  const tasksInProgress = tasks.filter((t) => t.status === "in_progress").length;

  // Create timesheet
  const result = await client.query(
    `INSERT INTO weekly_timesheets (
      user_id, week_start_date, week_end_date,
      total_hours, tasks_completed, tasks_in_progress
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [userId, weekStart, weekEnd, totalHours, tasksCompleted, tasksInProgress]
  );

  const timesheet = result.rows[0];

  // Add tasks to timesheet
  if (tasks.length > 0) {
    const taskPromises = tasks.map((task) =>
      client.query(
        `INSERT INTO weekly_timesheet_tasks (
          timesheet_id, work_allocation_deliverable_id, drawing_stage_log_id,
          task_description, hours_spent, status
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          timesheet.id,
          task.work_allocation_deliverable_id,
          task.drawing_stage_log_id,
          task.description,
          task.hours_spent,
          task.status,
        ]
      )
    );
    await Promise.all(taskPromises);
  }

  return timesheet;
}

async function getTasksForWeek(userId, weekStart, weekEnd, client) {
  // Get tasks from work allocation deliverables
  const deliverableTasks = await client.query(
    `SELECT 
      wad.id AS work_allocation_deliverable_id,
      NULL AS drawing_stage_log_id,
      CONCAT(wad.title, ' - ', wad.deliverables) AS description,
      wad.consumed_time AS hours_spent,
      CASE 
        WHEN wad.status = 'completed' THEN 'completed'
        WHEN wad.status = 'in_progress' THEN 'in_progress'
        ELSE 'in_progress'
      END AS status
    FROM work_allocation_deliverables wad
    WHERE wad.work_person_id = $1
      AND wad.updated_at >= $2
      AND wad.updated_at <= $3
      AND wad.consumed_time > 0
    `,
    [userId, weekStart, weekEnd]
  );

  // Get tasks from drawing stage logs
  const drawingTasks = await client.query(
    `SELECT 
      NULL AS work_allocation_deliverable_id,
      dsl.id AS drawing_stage_log_id,
      CONCAT(d.title, ' - ', dsl.step_name) AS description,
      dsl.consumed_time AS hours_spent,
      CASE 
        WHEN dsl.status = 'completed' THEN 'completed'
        WHEN dsl.status = 'in_progress' THEN 'in_progress'
        ELSE 'in_progress'
      END AS status
    FROM drawing_stage_logs dsl
    JOIN drawings d ON dsl.drawing_id = d.id
    WHERE dsl.forwarded_user_id = $1
      AND dsl.updated_at >= $2
      AND dsl.updated_at <= $3
      AND dsl.consumed_time > 0
    `,
    [userId, weekStart, weekEnd]
  );

  return [...deliverableTasks.rows, ...drawingTasks.rows];
}

export async function getWeeklyTimesheet(userId, weekStartDate, client = pool) {
  const weekStart = getWeekStartDate(weekStartDate);

  const timesheetResult = await client.query(
    `SELECT * FROM weekly_timesheets 
     WHERE user_id = $1 AND week_start_date = $2`,
    [userId, weekStart]
  );

  if (timesheetResult.rows.length === 0) {
    // Create if doesn't exist
    return await createOrUpdateWeeklyTimesheet(userId, weekStartDate, client);
  }

  const timesheet = timesheetResult.rows[0];

  // Get tasks
  const tasksResult = await client.query(
    `SELECT * FROM weekly_timesheet_tasks 
     WHERE timesheet_id = $1
     ORDER BY id ASC`,
    [timesheet.id]
  );

  return {
    ...timesheet,
    tasks: tasksResult.rows,
  };
}

export async function submitWeeklyTimesheet(timesheetId, client = pool) {
  const result = await client.query(
    `UPDATE weekly_timesheets
     SET status = 'submitted', updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [timesheetId]
  );
  return result.rows[0];
}

export async function getWeeklyTimesheetsByUser(
  userId,
  page = 1,
  size = 10,
  client = pool
) {
  const offset = (page - 1) * size;

  const result = await client.query(
    `SELECT * FROM weekly_timesheets
     WHERE user_id = $1
     ORDER BY week_start_date DESC
     LIMIT $2 OFFSET $3`,
    [userId, size, offset]
  );

  const countResult = await client.query(
    `SELECT COUNT(*) FROM weekly_timesheets WHERE user_id = $1`,
    [userId]
  );

  return {
    timesheets: result.rows,
    total: parseInt(countResult.rows[0].count),
    total_pages: Math.ceil(parseInt(countResult.rows[0].count) / size),
  };
}

