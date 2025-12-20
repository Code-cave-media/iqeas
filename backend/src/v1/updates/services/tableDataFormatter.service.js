/**
 * Service to format data for the workflow tables
 * Ensures data matches the exact table structure shown in the workflow
 */

/**
 * Format estimation deliverables for Table 0.0
 * Columns: Sno, Drawing no, Title, Deliverables, Discipline, Hours, Amount
 */
export function formatEstimationTable(deliverables) {
  return deliverables.map((d) => ({
    sno: d.sno,
    drawing_no: d.drawing_no || "",
    title: d.title,
    deliverables: d.deliverables,
    discipline: d.discipline,
    hours: parseFloat(d.hours || 0),
    amount: parseFloat(d.amount || 0),
  }));
}

/**
 * Format work allocation for Table 1.0 and Table 2.0
 * Columns: Sno, Drawing no, Title, Deliverables, Discipline, Stages, Revision, Hours, Work Person, Consumed Time
 */
export function formatWorkAllocationTable(deliverables) {
  return deliverables.map((d) => ({
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
    // Additional fields for reference
    work_person_id: d.work_person_id,
    stage_id: d.stage_id,
    status: d.status,
  }));
}

/**
 * Format work allocation grouped by main deliverable (for hierarchical view)
 * Shows main deliverable (1) and sub-deliverables (1.1, 1.2, 1.3, 1.4)
 */
export function formatWorkAllocationGrouped(deliverables) {
  const formatted = formatWorkAllocationTable(deliverables);
  
  // Group by main Sno (everything before the dot)
  const grouped = {};
  
  formatted.forEach((item) => {
    const mainSno = item.sno.split(".")[0];
    if (!grouped[mainSno]) {
      grouped[mainSno] = [];
    }
    grouped[mainSno].push(item);
  });
  
  // Flatten with main deliverable first, then sub-deliverables
  const result = [];
  Object.keys(grouped).sort().forEach((mainSno) => {
    const items = grouped[mainSno];
    // Main deliverable (without dot)
    const mainItem = items.find((i) => i.sno === mainSno);
    if (mainItem) {
      result.push(mainItem);
    }
    // Sub-deliverables (with dot)
    items
      .filter((i) => i.sno !== mainSno)
      .sort((a, b) => a.sno.localeCompare(b.sno))
      .forEach((subItem) => {
        result.push(subItem);
      });
  });
  
  return result;
}

/**
 * Format for Designer Dashboard (Table 2.0)
 * Same structure but filtered to show only tasks assigned to the designer
 */
export function formatDesignerDashboard(deliverables, userId) {
  const filtered = deliverables.filter(
    (d) => d.work_person_id === userId || d.work_person?.id === userId
  );
  return formatWorkAllocationTable(filtered);
}

