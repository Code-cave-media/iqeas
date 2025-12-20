# Workflow Updates - Implementation Guide

This folder contains all the updates to implement the complete workflow as specified in the requirements.

## Database Migrations

Run the SQL file `schema_updates.sql` to create all necessary tables:

```bash
psql -U your_user -d your_database -f src/v1/updates/schema_updates.sql
```

Or execute it through your database management tool.

## New Features Implemented

### 1. Purchase Order (PO) Management
- **Service**: `services/po.service.js`
- **Controller**: `controllers/po.controller.js`
- **Routes**: `routes/updates_po.routes.js`
- **Endpoints**:
  - `POST /api/v1/updates/` - Create PO
  - `GET /api/v1/updates/:id` - Get PO by ID
  - `GET /api/v1/updates/project/:project_id` - Get POs by project
  - `PATCH /api/v1/updates/:id/forward-to-admin` - Forward to Admin
  - `PATCH /api/v1/updates/:id/forward-to-pm` - Forward to PM
  - `PATCH /api/v1/updates/:id/accept` - Accept PO

### 2. Estimation Deliverables
- **Service**: `services/estimationDeliverables.service.js`
- **Controller**: `controllers/estimationDeliverables.controller.js`
- **Routes**: `routes/updates_estimationDeliverables.routes.js`
- **Endpoints**:
  - `POST /api/v1/updates/estimation/:estimation_id/deliverables` - Create deliverables
  - `GET /api/v1/updates/estimation/:estimation_id/deliverables` - Get deliverables
  - `PATCH /api/v1/updates/estimation/deliverables/:id` - Update deliverable
  - `DELETE /api/v1/updates/estimation/deliverables/:id` - Delete deliverable

### 3. Work Allocation (with 10% Hour Reduction)
- **Service**: `services/workAllocation.service.js`
- **Controller**: `controllers/workAllocation.controller.js`
- **Routes**: `routes/updates_workAllocation.routes.js`
- **Endpoints**:
  - `POST /api/v1/updates/projects/:project_id/work-allocation` - Create from estimation (10% reduction)
  - `GET /api/v1/updates/projects/:project_id/work-allocation` - Get dashboard
  - `PATCH /api/v1/updates/work-allocation/:id/assign` - Assign work person
  - `PATCH /api/v1/updates/work-allocation/:id` - Update allocation
  - `PATCH /api/v1/updates/work-allocation/:id/consumed-time` - Update consumed time

### 4. Time Tracking
- **Service**: `services/timeTracking.service.js`
- **Controller**: `controllers/timeTracking.controller.js`
- **Routes**: `routes/updates_timeTracking.routes.js`
- **Endpoints**:
  - `POST /api/v1/updates/time-tracking/start` - Start task
  - `POST /api/v1/updates/time-tracking/pause` - Pause task
  - `POST /api/v1/updates/time-tracking/resume` - Resume task
  - `POST /api/v1/updates/time-tracking/finish` - Finish task
  - `GET /api/v1/updates/time-tracking/logs` - Get logs

### 5. Weekly Timesheet
- **Service**: `services/weeklyTimesheet.service.js`
- **Controller**: `controllers/weeklyTimesheet.controller.js`
- **Routes**: `routes/updates_weeklyTimesheet.routes.js`
- **Endpoints**:
  - `GET /api/v1/updates/timesheet/weekly` - Get/create weekly timesheet
  - `PATCH /api/v1/updates/timesheet/weekly/:id/submit` - Submit timesheet
  - `GET /api/v1/updates/timesheet/weekly/list` - Get all timesheets

### 6. Stage-Based Billing
- **Service**: `services/stageBilling.service.js`
- **Controller**: `controllers/stageBilling.controller.js`
- **Routes**: `routes/updates_stageBilling.routes.js`
- **Endpoints**:
  - `POST /api/v1/updates/projects/:project_id/stages/:stage_id/invoice` - Generate invoice
  - `GET /api/v1/updates/projects/:project_id/billings` - Get billings
  - `PATCH /api/v1/updates/billings/:id/forward-to-proposal` - Forward to Proposal
  - `PATCH /api/v1/updates/billings/:id/forward-to-client` - Forward to Client
  - `PATCH /api/v1/updates/billings/:id/mark-paid` - Mark as paid

### 7. Automatic Attendance on Login
- **Service**: `services/attendanceOnLogin.service.js`
- **Integration**: Updated `auth.service.js` to automatically register attendance on login

## Role Updates

The schema updates include new roles:
- `project_leader` - For Project Leader functionality
- `account` - For accounting team
- `hr` - For HR functions

The `documentation` role should be removed (as per workflow requirements).

## Workflow Implementation

### Complete Workflow Steps:

1. **Enquiry → Proposal**: ✅ Existing
2. **Estimation with Deliverables**: ✅ New - Use estimation deliverables endpoints
3. **PO Handling**: ✅ New - Use PO endpoints
4. **Work Allocation (10% reduction)**: ✅ New - Use work allocation endpoints
5. **Time Tracking**: ✅ New - Use time tracking endpoints
6. **Weekly Timesheet**: ✅ New - Use timesheet endpoints
7. **Stage-Based Billing**: ✅ New - Use billing endpoints
8. **Attendance on Login**: ✅ New - Automatic

## Usage Examples

### Creating Estimation Deliverables
```javascript
POST /api/v1/updates/estimation/:estimation_id/deliverables
{
  "deliverables": [
    {
      "sno": 1,
      "drawing_no": "453453453",
      "title": "Door",
      "deliverables": "Door Panel Cutout",
      "discipline": "Arch",
      "hours": 10,
      "amount": 5000
    }
  ]
}
```

### Creating Work Allocation from Estimation
```javascript
POST /api/v1/updates/projects/:project_id/work-allocation
{
  "estimation_id": 123,
  "stages": ["IDC", "IFR", "IFA", "IFC", "AS-Built"]
}
// Automatically applies 10% hour reduction
```

### Starting a Task
```javascript
POST /api/v1/updates/time-tracking/start
{
  "deliverable_id": 456,
  "drawing_log_id": 789
}
```

### Generating Stage Invoice
```javascript
POST /api/v1/updates/projects/:project_id/stages/:stage_id/invoice
// Generates invoice when stage is completed
```

## Notes

- All routes are prefixed with `/api/v1/updates`
- All routes require authentication
- Database transactions are used for data consistency
- The 10% hour reduction is automatically applied when creating work allocation from estimation

