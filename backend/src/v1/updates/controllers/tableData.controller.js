import * as EstimationDeliverablesService from "../services/estimationDeliverables.service.js";
import * as WorkAllocationService from "../services/workAllocation.service.js";
import { formatResponse } from "../../utils/response.js";

/**
 * Get estimation deliverables formatted for Table 0.0
 * GET /api/v1/updates/estimation/:project_id/table
 */
export const getEstimationTableHandler = async (req, res) => {
  try {
    const { project_id } = req.params;
    const result =
      await EstimationDeliverablesService.getDeliverablesWithTotals(project_id);

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Estimation table data retrieved successfully",
        data: {
          table: result.table_data, // Formatted for Table 0.0
          totals: result.totals,
        },
      })
    );
  } catch (error) {
    console.error("Error fetching estimation table:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Internal Server Error",
      })
    );
  }
};

/**
 * Get work allocation formatted for Table 1.0 (PM/Project Leader Dashboard)
 * GET /api/v1/updates/projects/:project_id/work-allocation/table
 */
export const getWorkAllocationTableHandler = async (req, res) => {
  try {
    const { project_id } = req.params;
    const dashboard = await WorkAllocationService.getWorkAllocationDashboard(
      project_id
    );

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Work allocation table data retrieved successfully",
        data: {
          table: dashboard.table_data, // Formatted for Table 1.0
          grouped: dashboard.deliverables, // Grouped by main deliverable
          summary: dashboard.summary,
        },
      })
    );
  } catch (error) {
    console.error("Error fetching work allocation table:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Internal Server Error",
      })
    );
  }
};

/**
 * Get designer dashboard formatted for Table 2.0
 * GET /api/v1/updates/projects/:project_id/designer-dashboard
 */
export const getDesignerDashboardHandler = async (req, res) => {
  try {
    const { project_id } = req.params;
    const userId = req.user.id;

    const deliverables = await WorkAllocationService.getWorkAllocationByProject(
      project_id
    );

    // Filter for this designer
    const designerTasks = deliverables
      .filter((d) => d.work_person_id === userId)
      .map((d) => ({
        sno: d.sno,
        drawing_no: d.drawing_no || "",
        title: d.title,
        deliverables: d.deliverables,
        discipline: d.discipline,
        stages: d.stage_name || "",
        revision: d.revision || "",
        hours: parseFloat(d.allocated_hours || 0),
        work_person: d.work_person?.name || "",
        consumed_time: parseFloat(d.consumed_time || 0),
        work_person_id: d.work_person_id,
        stage_id: d.stage_id,
        status: d.status,
      }));

    return res.status(200).json(
      formatResponse({
        statusCode: 200,
        detail: "Designer dashboard data retrieved successfully",
        data: {
          table: designerTasks, // Formatted for Table 2.0
          summary: {
            total_tasks: designerTasks.length,
            total_hours: designerTasks.reduce(
              (sum, t) => sum + t.hours,
              0
            ),
            total_consumed: designerTasks.reduce(
              (sum, t) => sum + t.consumed_time,
              0
            ),
            completed: designerTasks.filter((t) => t.status === "completed")
              .length,
            in_progress: designerTasks.filter(
              (t) => t.status === "in_progress"
            ).length,
          },
        },
      })
    );
  } catch (error) {
    console.error("Error fetching designer dashboard:", error);
    return res.status(500).json(
      formatResponse({
        statusCode: 500,
        detail: "Internal Server Error",
      })
    );
  }
};

