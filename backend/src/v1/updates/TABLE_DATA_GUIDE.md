# Table Data API Guide

This guide shows which endpoints provide data for building the workflow tables.

## Table 0.0 - Estimation Deliverables Table

**Endpoint**: `GET /api/v1/updates/estimation/:estimation_id/table`

**Response Format**:
```json
{
  "status_code": 200,
  "detail": "Estimation table data retrieved successfully",
  "data": {
    "table": [
      {
        "sno": 1,
        "drawing_no": "453453453",
        "title": "Door",
        "deliverables": "Door Panel Cutout",
        "discipline": "Arch",
        "hours": 10,
        "amount": 5000
      },
      {
        "sno": 2,
        "drawing_no": "3154363",
        "title": "Wall panel",
        "deliverables": "Wall Panel Detailed Drawing",
        "discipline": "Arch",
        "hours": 5,
        "amount": 25000
      }
    ],
    "totals": {
      "total_hours": 39,
      "total_amount": 48200
    }
  }
}
```

**Columns**: Sno, Drawing no, Title, Deliverables, Discipline, Hours, Amount

---

## Table 1.0 - Work Allocation Table (PM/Project Leader Dashboard)

**Endpoint**: `GET /api/v1/updates/projects/:project_id/work-allocation/table`

**Response Format**:
```json
{
  "status_code": 200,
  "detail": "Work allocation table data retrieved successfully",
  "data": {
    "table": [
      {
        "sno": "1",
        "drawing_no": "453453453",
        "title": "Door",
        "deliverables": "Door Panel Cutout",
        "discipline": "Arch",
        "stages": "IDC",
        "revision": "0",
        "hours": 3,
        "work_person": "Vijth",
        "consumed_time": 0
      },
      {
        "sno": "1.1",
        "drawing_no": "",
        "title": "Door",
        "deliverables": "Door Panel Cutout",
        "discipline": "Arch",
        "stages": "IFR",
        "revision": "1",
        "hours": 1,
        "work_person": "Vijth",
        "consumed_time": 0
      },
      {
        "sno": "1.2",
        "drawing_no": "",
        "title": "Door",
        "deliverables": "Door Panel Cutout",
        "discipline": "Arch",
        "stages": "IFA",
        "revision": "A1",
        "hours": 1,
        "work_person": "Vijth",
        "consumed_time": 0
      }
    ],
    "grouped": [
      [
        {
          "sno": "1",
          "drawing_no": "453453453",
          "title": "Door",
          ...
        },
        {
          "sno": "1.1",
          ...
        }
      ]
    ],
    "summary": {
      "total_deliverables": 30,
      "total_hours": 27.0,
      "total_consumed": 0,
      "assigned": 5,
      "unassigned": 25
    }
  }
}
```

**Columns**: Sno, Drawing no, Title, Deliverables, Discipline, Stages, Revision, Hours, Work Person, Consumed Time

**Note**: The `table` array contains all rows in flat format. The `grouped` array contains the same data grouped by main deliverable (1, 1.1, 1.2, etc.).

---

## Table 2.0 - Designer Dashboard

**Endpoint**: `GET /api/v1/updates/projects/:project_id/designer-dashboard`

**Response Format**:
```json
{
  "status_code": 200,
  "detail": "Designer dashboard data retrieved successfully",
  "data": {
    "table": [
      {
        "sno": "1",
        "drawing_no": "453453453",
        "title": "Door",
        "deliverables": "Door Panel Cutout",
        "discipline": "Arch",
        "stages": "IDC",
        "revision": "0",
        "hours": 3,
        "work_person": "Vijth",
        "consumed_time": 3
      },
      {
        "sno": "1.1",
        "drawing_no": "",
        "title": "Door",
        "deliverables": "Door Panel Cutout",
        "discipline": "Arch",
        "stages": "IFR",
        "revision": "1",
        "hours": 1,
        "work_person": "Vijth",
        "consumed_time": 2
      },
      {
        "sno": "1.2",
        "drawing_no": "",
        "title": "Door",
        "deliverables": "Door Panel Cutout",
        "discipline": "Arch",
        "stages": "IFA",
        "revision": "A1",
        "hours": 1,
        "work_person": "Vijth",
        "consumed_time": 1.5
      }
    ],
    "summary": {
      "total_tasks": 3,
      "total_hours": 5,
      "total_consumed": 6.5,
      "completed": 1,
      "in_progress": 2
    }
  }
}
```

**Columns**: Sno, Drawing no, Title, Deliverables, Discipline, Stages, Revision, Hours, Work Person, Consumed Time

**Note**: This endpoint automatically filters tasks assigned to the logged-in user (designer). The `consumed_time` field is populated when the designer tracks time using the time tracking endpoints.

---

## Alternative Endpoints

### Get Full Estimation Deliverables
**Endpoint**: `GET /api/v1/updates/estimation/:estimation_id/deliverables`

Returns full deliverable objects with additional metadata.

### Get Full Work Allocation Dashboard
**Endpoint**: `GET /api/v1/updates/projects/:project_id/work-allocation`

Returns full dashboard with grouped data and summary statistics.

---

## Usage Examples

### Frontend Implementation

```javascript
// Table 0.0 - Estimation
const fetchEstimationTable = async (estimationId) => {
  const response = await fetch(
    `/api/v1/updates/estimation/${estimationId}/table`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  const data = await response.json();
  return data.data.table; // Array ready for table display
};

// Table 1.0 - Work Allocation
const fetchWorkAllocationTable = async (projectId) => {
  const response = await fetch(
    `/api/v1/updates/projects/${projectId}/work-allocation/table`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  const data = await response.json();
  return data.data.table; // Array ready for table display
};

// Table 2.0 - Designer Dashboard
const fetchDesignerDashboard = async (projectId) => {
  const response = await fetch(
    `/api/v1/updates/projects/${projectId}/designer-dashboard`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  const data = await response.json();
  return data.data.table; // Array ready for table display
};
```

---

## Data Flow

1. **Estimation Phase**: Create deliverables using `POST /api/v1/updates/estimation/:estimation_id/deliverables`
2. **PO Received**: Create PO using `POST /api/v1/updates/`
3. **Work Allocation**: Create from estimation with 10% reduction using `POST /api/v1/updates/projects/:project_id/work-allocation`
4. **Assignment**: Assign work persons using `PATCH /api/v1/updates/work-allocation/:id/assign`
5. **Time Tracking**: Designer tracks time using time tracking endpoints
6. **Dashboard Views**: Use table endpoints to display data in the required format

