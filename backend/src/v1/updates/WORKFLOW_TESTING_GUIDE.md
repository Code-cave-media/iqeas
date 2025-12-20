# Complete Workflow Testing Guide

This guide walks you through testing the entire workflow from start to finish, including both existing and new features.

**Base URL**: `http://localhost:8080/api/v1` (adjust if different)

**Authentication**: Most endpoints require a Bearer token. Get it from the login endpoint first.

---

## STEP 0: Setup & Authentication

### 0.1 Login to Get Token
**Endpoint**: `POST /auth/login`

**Postman Request**:
```json
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Expected Response**:
```json
{
  "status_code": 200,
  "detail": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "role": "admin",
      "name": "Admin User"
    }
  }
}
```

**Save the token** - You'll need it for all subsequent requests. Add it to Postman as:
- Header: `Authorization: Bearer <your_token>`

---

## PART 1: THE BEGINNING - Enquiry to Estimation

### 1.1 Create Project (Enquiry from Client)
**Endpoint**: `POST /projects`

**Postman Request**:
```json
{
  "name": "Coco 1 Project",
  "received_date": "2025-01-15",
  "client_name": "John Doe",
  "client_company": "ABC Construction",
  "location": "Mumbai, India",
  "project_type": "plant",
  "priority": "high",
  "contact_person": "John Doe",
  "contact_person_phone": "+91-1234567890",
  "contact_person_email": "john@abcconstruction.com",
  "notes": "Initial enquiry for Coco 1 project",
  "uploaded_files": []
}
```

**Expected Response**:
```json
{
  "status_code": 201,
  "detail": "Project created successfully",
  "data": {
    "id": 1,
    "project_id": "PROJ-2025-001",
    "name": "Coco 1 Project",
    "status": "draft",
    ...
  }
}
```

**Save**: `project_id` (e.g., 1) for next steps

---

### 1.2 RFQ Creates Deliverables List (Without Hours and Amounts)
**Endpoint**: `POST /updates/projects/:project_id/rfq-deliverables`

**Postman Request** (replace `:project_id` with project ID from 1.1):
```json
{
  "deliverables": [
    {
      "sno": 1,
      "drawing_no": "453453453",
      "title": "Door",
      "deliverables": "Door Panel Cutout",
      "discipline": "Arch"
    },
    {
      "sno": 2,
      "drawing_no": "3154363",
      "title": "Wall panel",
      "deliverables": "Wall Panel Detailed Drawing",
      "discipline": "Arch"
    },
    {
      "sno": 3,
      "drawing_no": "453453453",
      "title": "Insulation",
      "deliverables": "Insulation Detailed Drawing",
      "discipline": "Arch"
    },
    {
      "sno": 4,
      "drawing_no": "413653",
      "title": "Flooring",
      "deliverables": "Flooring Detailed Drawing",
      "discipline": "Arch"
    },
    {
      "sno": 5,
      "drawing_no": "41333453",
      "title": "Insulation",
      "deliverables": "Insulation MTO",
      "discipline": "Arch"
    },
    {
      "sno": 6,
      "drawing_no": "45363",
      "title": "Flooring",
      "deliverables": "Flooring MTO",
      "discipline": "Arch"
    }
  ]
}
```

**Note**: RFQ deliverables should NOT include `hours` or `amount` fields - only: `sno`, `drawing_no`, `title`, `deliverables`, `discipline`.

**Expected Response**:
```json
{
  "status_code": 201,
  "detail": "RFQ deliverables created successfully",
  "data": [
    {
      "id": 1,
      "project_id": 1,
      "estimation_id": null,
      "sno": 1,
      "drawing_no": "453453453",
      "title": "Door",
      "deliverables": "Door Panel Cutout",
      "discipline": "Arch",
      "hours": null,
      "amount": null,
      ...
    },
    ...
  ]
}
```

---

### 1.3 Send Project to Estimation
**Endpoint**: `PATCH /projects/:id`

**Postman Request** (replace `:id` with project ID from 1.1):
```json
{
  "send_to_estimation": true
}
```

**Expected Response**:
```json
{
  "status_code": 200,
  "detail": "Project updated successfully",
  "data": {
    "id": 1,
    "status": "estimating",
    "send_to_estimation": true,
    ...
  }
}
```

---

### 1.4 Create Estimation
**Endpoint**: `POST /estimation`

**Postman Request**:
```json
{
  "project_id": 1,
  "status": "draft",
  "deadline": "2025-03-15",
  "notes": "Initial estimation for Coco 1 project",
  "uploaded_file_ids": []
}
```

**Note**: Do NOT include `cost` field. The deliverables from RFQ will be automatically linked to this estimation.

**Expected Response**:
```json
{
  "status_code": 201,
  "detail": "Estimation created",
  "data": {
    "project": {...},
    "estimation": {
      "id": 1,
      "project_id": 1,
      "status": "draft",
      "cost": null,
      ...
    }
  }
}
```

**Save**: `estimation.id` (e.g., 1) for next step

---

### 1.5 Estimation Person Adds Hours to Deliverables
**Endpoint**: `PATCH /updates/estimation/:estimation_id/add-hours`

**Postman Request** (replace `:estimation_id` with estimation ID from 1.4):
```json
{
  "deliverables": [
    {
      "sno": 1,
      "hours": 10
    },
    {
      "sno": 2,
      "hours": 5
    },
    {
      "sno": 3,
      "hours": 3
    },
    {
      "sno": 4,
      "hours": 8
    },
    {
      "sno": 5,
      "hours": 12
    },
    {
      "sno": 6,
      "hours": 1
    }
  ]
}
```

**Note**: Estimation person only adds `hours`, NOT `amounts`.

**Expected Response**:
```json
{
  "status_code": 200,
  "detail": "Hours added to deliverables successfully",
  "data": [
    {
      "id": 1,
      "estimation_id": 1,
      "sno": 1,
      "drawing_no": "453453453",
      "title": "Door",
      "deliverables": "Door Panel Cutout",
      "discipline": "Arch",
      "hours": 10,
      "amount": null,
      ...
    },
    ...
  ]
}
```

---

### 1.6 Send Estimation to Admin
**Endpoint**: `PATCH /updates/estimation/:estimation_id/send-to-admin`

**Postman Request** (replace `:estimation_id` with estimation ID):
```json
{
  "project_id": 1
}
```

**Expected Response**:
```json
{
  "status_code": 200,
  "detail": "Estimation sent to Admin successfully",
  "data": {
    "id": 1,
    "status": "pending_admin_verification",
    ...
  }
}
```

---

### 1.7 Admin Adds Amounts to Deliverables
**Endpoint**: `PATCH /updates/estimation/:estimation_id/add-amounts`

**Postman Request** (replace `:estimation_id` with estimation ID):
```json
{
  "deliverables": [
    {
      "sno": 1,
      "amount": 5000
    },
    {
      "sno": 2,
      "amount": 25000
    },
    {
      "sno": 3,
      "amount": 1500
    },
    {
      "sno": 4,
      "amount": 2500
    },
    {
      "sno": 5,
      "amount": 0
    },
    {
      "sno": 6,
      "amount": 8200
    }
  ]
}
```

**Expected Response**:
```json
{
  "status_code": 200,
  "detail": "Amounts added to deliverables successfully",
  "data": [
    {
      "id": 1,
      "estimation_id": 1,
      "sno": 1,
      "drawing_no": "453453453",
      "title": "Door",
      "deliverables": "Door Panel Cutout",
      "discipline": "Arch",
      "hours": 10,
      "amount": 5000,
      ...
    },
    ...
  ]
}
```

---

### 1.8 Admin Verifies Estimation and Adds Cost
**Endpoint**: `PATCH /updates/estimation/:estimation_id/admin-verify`

**Postman Request** (replace `:estimation_id` with estimation ID):
```json
{
  "project_id": 1,
  "cost": 48200,
  "terms_and_conditions": "Payment: 30 days net",
  "notes": "Verified by admin. Total calculated from deliverables."
}
```

**Note**: If `cost` is not provided, it will be automatically calculated from the sum of all deliverable amounts.

**Expected Response**:
```json
{
  "status_code": 200,
  "detail": "Estimation verified and cost added successfully",
  "data": {
    "id": 1,
    "project_id": 1,
    "status": "verified_by_admin",
    "cost": 48200,
    ...
  }
}
```

---

### 1.4 Create Estimation Deliverables (Table 0.0 Data)
**Endpoint**: `POST /updates/estimation/:estimation_id/deliverables`

**Postman Request** (replace `:estimation_id` with estimation ID from 1.3):
```json
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
    },
    {
      "sno": 2,
      "drawing_no": "3154363",
      "title": "Wall panel",
      "deliverables": "Wall Panel Detailed Drawing",
      "discipline": "Arch",
      "hours": 5,
      "amount": 25000
    },
    {
      "sno": 3,
      "drawing_no": "453453453",
      "title": "Insulation",
      "deliverables": "Insulation Detailed Drawing",
      "discipline": "Arch",
      "hours": 3,
      "amount": 1500
    },
    {
      "sno": 4,
      "drawing_no": "413653",
      "title": "Flooring",
      "deliverables": "Flooring Detailed Drawing",
      "discipline": "Arch",
      "hours": 8,
      "amount": 2500
    },
    {
      "sno": 5,
      "drawing_no": "41333453",
      "title": "Insulation",
      "deliverables": "Insulation MTO",
      "discipline": "Arch",
      "hours": 12,
      "amount": 6000
    },
    {
      "sno": 6,
      "drawing_no": "45363",
      "title": "Flooring",
      "deliverables": "Flooring MTO",
      "discipline": "Arch",
      "hours": 1,
      "amount": 8200
    }
  ]
}
```

**Expected Response**:
```json
{
  "status_code": 201,
  "detail": "Estimation deliverables created successfully",
  "data": [
    {
      "id": 1,
      "estimation_id": 1,
      "sno": 1,
      "drawing_no": "453453453",
      "title": "Door",
      "deliverables": "Door Panel Cutout",
      "discipline": "Arch",
      "hours": 10,
      "amount": 5000
    },
    ...
  ]
}
```

---

### 1.5 View Estimation Table (Table 0.0)
**Endpoint**: `GET /updates/estimation/:estimation_id/table`

**Postman Request**: GET request (no body)

**Expected Response**:
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
      ...
    ],
    "totals": {
      "total_hours": 39,
      "total_amount": 48200
    }
  }
}
```

**✅ This matches Table 0.0 format!**

---

### 1.6 Send Estimation to Admin (Estimation Person)
**Endpoint**: `PATCH /updates/estimation/:id/send-to-admin`

**Postman Request** (replace `:id` with estimation ID):
```json
{
  "project_id": 1
}
```

**Expected Response**:
```json
{
  "status_code": 200,
  "detail": "Estimation sent to Admin successfully",
  "data": {
    "id": 1,
    "status": "sent_to_admin",
    "cost": null,
    ...
  }
}
```

---

### 1.7 Admin Verifies and Adds Cost
**Endpoint**: `PATCH /updates/estimation/:id/admin-verify`

**Postman Request** (Login as Admin user):
```json
{
  "project_id": 1,
  "cost": 48200,
  "terms_and_conditions": "Payment terms: 30 days net",
  "notes": "Cost verified and added by admin"
}
```

**Expected Response**:
```json
{
  "status_code": 200,
  "detail": "Estimation verified and cost added successfully",
  "data": {
    "id": 1,
    "status": "verified_by_admin",
    "cost": 48200,
    "notes": "Cost verified and added by admin",
    ...
  }
}
```

---

### 1.8 Send from Admin to Proposals
**Endpoint**: `PATCH /updates/estimation/:id/send-to-proposals`

**Postman Request**:
```json
{
  "project_id": 1
}
```

**Expected Response**:
```json
{
  "status_code": 200,
  "detail": "Estimation sent to Proposals successfully",
  "data": {
    "id": 1,
    "status": "sent_to_proposals",
    "cost": 48200,
    ...
  }
}
```

---

### 1.9 Send from Proposals to Client
**Endpoint**: `PATCH /updates/estimation/:id/send-to-client`

**Postman Request** (Login as RFQ/Proposal user):
```json
{
  "project_id": 1
}
```

**Expected Response**:
```json
{
  "status_code": 200,
  "detail": "Estimation sent to Client successfully",
  "data": {
    "id": 1,
    "status": "sent_to_client",
    "cost": 48200,
    ...
  }
}
```

**✅ Now Client receives the estimation with cost and can provide PO**

---

## PART 2: PO (Purchase Order) Handling

**Note**: PO is created AFTER client receives the estimation (step 1.9) and accepts it.

### 2.1 Create PO (When Received from Client)
**Endpoint**: `POST /updates/`

**Postman Request**:
```json
{
  "project_id": 1,
  "po_number": "PO-2025-001",
  "received_date": "2025-01-20",
  "notes": "PO received from client",
  "terms_and_conditions": "Payment terms: 30 days",
  "uploaded_file_ids": []
}
```

**Expected Response**:
```json
{
  "status_code": 201,
  "detail": "Purchase Order created successfully",
  "data": {
    "id": 1,
    "project_id": 1,
    "po_number": "PO-2025-001",
    "status": "received",
    "received_date": "2025-01-20",
    ...
  }
}
```

**Save**: `po.id` (e.g., 1)

---

### 2.2 Forward PO to Admin
**Endpoint**: `PATCH /updates/:id/forward-to-admin`

**Postman Request**: PATCH request (no body, just URL with PO ID)

**Expected Response**:
```json
{
  "status_code": 200,
  "detail": "PO forwarded to Admin successfully",
  "data": {
    "id": 1,
    "status": "forwarded_to_admin",
    "forwarded_to_admin_at": "2025-01-20T10:30:00Z",
    ...
  }
}
```

---

### 2.3 Forward PO to PM
**Endpoint**: `PATCH /updates/:id/forward-to-pm`

**Postman Request**: PATCH request (no body)

**Expected Response**:
```json
{
  "status_code": 200,
  "detail": "PO forwarded to PM successfully",
  "data": {
    "id": 1,
    "status": "forwarded_to_pm",
    "forwarded_to_pm_at": "2025-01-20T11:00:00Z",
    ...
  }
}
```

---

### 2.4 Accept PO
**Endpoint**: `PATCH /updates/:id/accept`

**Postman Request**: PATCH request (no body)

**Expected Response**:
```json
{
  "status_code": 200,
  "detail": "PO accepted successfully",
  "data": {
    "id": 1,
    "status": "accepted",
    "accepted_at": "2025-01-20T11:30:00Z",
    ...
  }
}
```

---

## PART 3: Work Allocation (Step 1 - PM Creates Deliverables with 10% Reduction)

### 3.1 Create Stages for Project
**Endpoint**: `POST /workflow/projects/:project_id/stages`

**Postman Request** (replace `:project_id` with project ID):
```json
{
  "stages": [
    {
      "name": "IDC",
      "weight": 20,
      "allocated_hours": 0
    },
    {
      "name": "IFR",
      "weight": 20,
      "allocated_hours": 0
    },
    {
      "name": "IFA",
      "weight": 20,
      "allocated_hours": 0
    },
    {
      "name": "IFC",
      "weight": 20,
      "allocated_hours": 0
    },
    {
      "name": "AS-Built",
      "weight": 20,
      "allocated_hours": 0
    }
  ]
}
```

**Expected Response**:
```json
{
  "status_code": 201,
  "detail": "Stage created",
  "data": {
    "IDC": {
      "stage": {
        "id": 1,
        "name": "IDC",
        "project_id": 1,
        "status": "pending",
        ...
      }
    },
    ...
  }
}
```

**Save**: Stage IDs for reference

---

### 3.2 Create Work Allocation from Estimation (10% Hour Reduction)
**Endpoint**: `POST /updates/projects/:project_id/work-allocation`

**Postman Request**:
```json
{
  "estimation_id": 1,
  "stages": ["IDC", "IFR", "IFA", "IFC", "AS-Built"]
}
```

**Expected Response**:
```json
{
  "status_code": 201,
  "detail": "Work allocation created successfully with 10% hour reduction",
  "data": [
    {
      "id": 1,
      "project_id": 1,
      "sno": "1",
      "drawing_no": "453453453",
      "title": "Door",
      "deliverables": "Door Panel Cutout",
      "discipline": "Arch",
      "stage_name": "IDC",
      "allocated_hours": 3.0,
      ...
    },
    {
      "id": 2,
      "sno": "1.1",
      "stage_name": "IFR",
      "allocated_hours": 1.8,
      ...
    },
    ...
  ]
}
```

**✅ Notice**: Hours are reduced by 10% (10 hours → 9 hours, then distributed across stages)

---

### 3.3 View Work Allocation Table (Table 1.0)
**Endpoint**: `GET /updates/projects/:project_id/work-allocation/table`

**Postman Request**: GET request (no body)

**Expected Response**:
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
        "work_person": "",
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
        "hours": 1.8,
        "work_person": "",
        "consumed_time": 0
      },
      ...
    ],
    "summary": {
      "total_deliverables": 30,
      "total_hours": 35.1,
      "total_consumed": 0,
      "assigned": 0,
      "unassigned": 30
    }
  }
}
```

**✅ This matches Table 1.0 format!**

---

### 3.4 Assign Work Person (PM/Project Leader assigns designers)
**Endpoint**: `PATCH /updates/work-allocation/:id/assign`

**Postman Request** (replace `:id` with work allocation deliverable ID):
```json
{
  "work_person_id": 2
}
```

**Note**: You need a user with role "working" (designer). Create one first or use existing user ID.

**Expected Response**:
```json
{
  "status_code": 200,
  "detail": "Work person assigned successfully",
  "data": {
    "id": 1,
    "work_person_id": 2,
    "status": "pending",
    ...
  }
}
```

**Repeat** for multiple deliverables to assign them to different designers.

---

## PART 4: Designer Work (Step 3)

### 4.1 View Designer Dashboard (Table 2.0)
**Endpoint**: `GET /updates/projects/:project_id/designer-dashboard`

**Postman Request**: GET request (must be logged in as designer/worker)

**Expected Response**:
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
        "consumed_time": 0
      },
      ...
    ],
    "summary": {
      "total_tasks": 5,
      "total_hours": 10,
      "total_consumed": 0,
      "completed": 0,
      "in_progress": 0
    }
  }
}
```

**✅ This matches Table 2.0 format!**

---

### 4.2 Start Task (Designer starts work)
**Endpoint**: `POST /updates/time-tracking/start`

**Postman Request**:
```json
{
  "deliverable_id": 1,
  "drawing_log_id": null
}
```

**Expected Response**:
```json
{
  "status_code": 201,
  "detail": "Task started successfully",
  "data": {
    "id": 1,
    "work_allocation_deliverable_id": 1,
    "user_id": 2,
    "action": "start",
    "created_at": "2025-01-20T12:00:00Z"
  }
}
```

---

### 4.3 Pause Task (Designer pauses work)
**Endpoint**: `POST /updates/time-tracking/pause`

**Postman Request**:
```json
{
  "deliverable_id": 1,
  "drawing_log_id": null,
  "time_spent": 1.5
}
```

**Expected Response**:
```json
{
  "status_code": 200,
  "detail": "Task paused successfully",
  "data": {
    "id": 2,
    "action": "pause",
    "time_spent": 1.5,
    ...
  }
}
```

**Note**: This updates `consumed_time` in the work allocation deliverable.

---

### 4.4 Resume Task
**Endpoint**: `POST /updates/time-tracking/resume`

**Postman Request**:
```json
{
  "deliverable_id": 1,
  "drawing_log_id": null
}
```

---

### 4.5 Finish Task (Designer completes work)
**Endpoint**: `POST /updates/time-tracking/finish`

**Postman Request**:
```json
{
  "deliverable_id": 1,
  "drawing_log_id": null,
  "time_spent": 1.5,
  "notes": "Completed Door Panel Cutout for IDC stage"
}
```

**Expected Response**:
```json
{
  "status_code": 200,
  "detail": "Task finished successfully",
  "data": {
    "id": 3,
    "action": "finish",
    "time_spent": 1.5,
    ...
  }
}
```

**Note**: This updates `consumed_time` and sets status to "completed".

---

### 4.6 View Updated Designer Dashboard (Table 2.0 with Consumed Time)
**Endpoint**: `GET /updates/projects/:project_id/designer-dashboard`

**Expected Response**:
```json
{
  "status_code": 200,
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
        "stages": "IFR",
        "hours": 1.8,
        "consumed_time": 2
      },
      {
        "sno": "1.2",
        "stages": "IFA",
        "hours": 1.8,
        "consumed_time": 1.5
      }
    ]
  }
}
```

**✅ This matches Table 2.0 with consumed time filled in!**

---

## PART 5: Weekly Timesheet

### 5.1 Get/Create Weekly Timesheet
**Endpoint**: `GET /updates/timesheet/weekly?week_start_date=2025-01-20`

**Postman Request**: GET request (week_start_date is optional, defaults to current week)

**Expected Response**:
```json
{
  "status_code": 200,
  "detail": "Weekly timesheet retrieved successfully",
  "data": {
    "id": 1,
    "user_id": 2,
    "week_start_date": "2025-01-20",
    "week_end_date": "2025-01-26",
    "total_hours": 6.5,
    "tasks_completed": 1,
    "tasks_in_progress": 2,
    "status": "draft",
    "tasks": [
      {
        "id": 1,
        "work_allocation_deliverable_id": 1,
        "task_description": "Door - Door Panel Cutout",
        "hours_spent": 3,
        "status": "completed"
      },
      ...
    ]
  }
}
```

---

### 5.2 Submit Weekly Timesheet
**Endpoint**: `PATCH /updates/timesheet/weekly/:id/submit`

**Postman Request**: PATCH request (no body)

**Expected Response**:
```json
{
  "status_code": 200,
  "detail": "Weekly timesheet submitted successfully",
  "data": {
    "id": 1,
    "status": "submitted",
    ...
  }
}
```

---

## PART 6: Stage-Based Billing

### 6.1 Mark Stage as Completed
**First, ensure all deliverables in a stage are completed**, then update stage status.

**Endpoint**: `PATCH /workflow/stages/:stage_id` (existing endpoint)

**Postman Request**:
```json
{
  "status": "completed"
}
```

---

### 6.2 Generate Invoice for Completed Stage
**Endpoint**: `POST /updates/projects/:project_id/stages/:stage_id/invoice`

**Postman Request**: POST request (no body, just URL with project_id and stage_id)

**Expected Response**:
```json
{
  "status_code": 201,
  "detail": "Stage invoice generated successfully",
  "data": {
    "id": 1,
    "project_id": 1,
    "stage_id": 1,
    "stage_name": "IDC",
    "total_amount": 5000,
    "status": "draft",
    "invoice_file": {
      "id": 10,
      "label": "invoice-PROJ-2025-001-IDC",
      "file": "https://..."
    },
    "deliverables": 6
  }
}
```

---

### 6.3 Forward Invoice to Proposal Team
**Endpoint**: `PATCH /updates/billings/:id/forward-to-proposal`

**Postman Request**: PATCH request (no body)

**Expected Response**:
```json
{
  "status_code": 200,
  "detail": "Invoice forwarded to Proposal team successfully",
  "data": {
    "id": 1,
    "status": "sent_to_proposal",
    "sent_to_proposal_at": "2025-01-25T10:00:00Z",
    ...
  }
}
```

---

### 6.4 Forward Invoice to Client
**Endpoint**: `PATCH /updates/billings/:id/forward-to-client`

**Postman Request**: PATCH request (no body)

**Expected Response**:
```json
{
  "status_code": 200,
  "detail": "Invoice forwarded to Client successfully",
  "data": {
    "id": 1,
    "status": "sent_to_client",
    "sent_to_client_at": "2025-01-25T11:00:00Z",
    ...
  }
}
```

---

### 6.5 Mark Invoice as Paid
**Endpoint**: `PATCH /updates/billings/:id/mark-paid`

**Postman Request**:
```json
{
  "payment_amount": 5000,
  "payment_date": "2025-01-30",
  "payment_method": "Bank Transfer",
  "reference_number": "TXN-2025-001"
}
```

**Expected Response**:
```json
{
  "status_code": 200,
  "detail": "Invoice marked as paid successfully",
  "data": {
    "billing": {
      "id": 1,
      "status": "paid",
      "paid_at": "2025-01-30T12:00:00Z",
      ...
    },
    "payment": {
      "id": 1,
      "project_id": 1,
      "payment_amount": 5000,
      "payment_date": "2025-01-30",
      ...
    }
  }
}
```

---

## PART 7: View All Billings

### 7.1 Get All Stage Billings for Project
**Endpoint**: `GET /updates/projects/:project_id/billings`

**Postman Request**: GET request (no body)

**Expected Response**:
```json
{
  "status_code": 200,
  "detail": "Stage billings retrieved successfully",
  "data": [
    {
      "id": 1,
      "stage_name": "IDC",
      "total_amount": 5000,
      "status": "paid",
      "invoice_file": {
        "id": 10,
        "label": "invoice-PROJ-2025-001-IDC",
        "file": "https://..."
      },
      ...
    },
    ...
  ]
}
```

---

## TESTING CHECKLIST

### ✅ Part 1: Beginning Workflow
- [ ] Create project (enquiry)
- [ ] Send to estimation
- [ ] Create estimation (hours only, no cost)
- [ ] Create estimation deliverables (Table 0.0)
- [ ] View estimation table
- [ ] Send estimation to Admin
- [ ] Admin verifies and adds cost
- [ ] Send from Admin to Proposals
- [ ] Send from Proposals to Client

### ✅ Part 2: PO Handling
- [ ] Create PO
- [ ] Forward PO to Admin
- [ ] Forward PO to PM
- [ ] Accept PO

### ✅ Part 3: Work Allocation
- [ ] Create stages
- [ ] Create work allocation (10% reduction)
- [ ] View work allocation table (Table 1.0)
- [ ] Assign work persons

### ✅ Part 4: Designer Work
- [ ] View designer dashboard (Table 2.0)
- [ ] Start task
- [ ] Pause task
- [ ] Resume task
- [ ] Finish task
- [ ] View updated dashboard with consumed time

### ✅ Part 5: Weekly Timesheet
- [ ] Get weekly timesheet
- [ ] Submit weekly timesheet

### ✅ Part 6: Stage-Based Billing
- [ ] Mark stage as completed
- [ ] Generate stage invoice
- [ ] Forward invoice to proposal
- [ ] Forward invoice to client
- [ ] Mark invoice as paid

### ✅ Part 7: View Billings
- [ ] Get all billings for project

---

## COMMON ISSUES & SOLUTIONS

### Issue: "Unauthorized" Error
**Solution**: Make sure you're including the Authorization header:
```
Authorization: Bearer <your_token>
```

### Issue: "Project not found"
**Solution**: Use the correct project ID from step 1.1

### Issue: "Estimation not found"
**Solution**: Use the correct estimation ID from step 1.3

### Issue: "Stage not completed"
**Solution**: Ensure all deliverables in the stage have status "completed" before generating invoice

### Issue: "No completed deliverables found"
**Solution**: Make sure you've finished tasks and they're marked as completed

---

## NOTES

1. **10% Hour Reduction**: When creating work allocation from estimation, hours are automatically reduced by 10% (e.g., 10 hours → 9 hours)

2. **Hierarchical Structure**: Work allocation creates main deliverables (1, 2, 3...) and sub-deliverables (1.1, 1.2, 1.3...) for each stage

3. **Time Tracking**: Consumed time is automatically updated when you pause/finish tasks

4. **Weekly Timesheet**: Automatically includes all tasks with consumed_time > 0 for the week

5. **Stage Billing**: Only generates invoice when stage status is "completed" and all deliverables in that stage are completed

---

## POSTMAN COLLECTION STRUCTURE

Organize your Postman requests in this order:

```
📁 Workflow Testing
  📁 0. Setup
    - Login
  📁 1. Beginning Workflow
    - Create Project
    - Send to Estimation
    - Create Estimation
    - Create Estimation Deliverables
    - View Estimation Table
    - Approve Estimation
  📁 2. PO Handling
    - Create PO
    - Forward to Admin
    - Forward to PM
    - Accept PO
  📁 3. Work Allocation
    - Create Stages
    - Create Work Allocation
    - View Work Allocation Table
    - Assign Work Person
  📁 4. Designer Work
    - View Designer Dashboard
    - Start Task
    - Pause Task
    - Resume Task
    - Finish Task
    - View Updated Dashboard
  📁 5. Weekly Timesheet
    - Get Weekly Timesheet
    - Submit Timesheet
  📁 6. Stage Billing
    - Mark Stage Complete
    - Generate Invoice
    - Forward to Proposal
    - Forward to Client
    - Mark as Paid
  📁 7. View Billings
    - Get All Billings
```

---

**Happy Testing! 🚀**

