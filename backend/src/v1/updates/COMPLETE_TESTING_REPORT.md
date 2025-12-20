# Complete Workflow Testing Report - Step by Step

This is a complete step-by-step testing guide with exact endpoints, request bodies, and expected responses.

---

## 🔐 STEP 0: Authentication

### 0.1 Login
**Endpoint**: `POST /api/v1/auth/login`

**Postman**:
- Method: POST
- URL: `http://localhost:8080/api/v1/auth/login`
- Headers: `Content-Type: application/json`
- Body:
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

**✅ Action**: Copy the `token` and add to all subsequent requests as:
- Header: `Authorization: Bearer <token>`

---

## 📋 PART 1: THE BEGINNING - Corrected Flow

### 1.1 Create Project (Enquiry from Client)
**Endpoint**: `POST /api/v1/projects`

**Postman**:
- Method: POST
- URL: `http://localhost:8080/api/v1/projects`
- Headers: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Body:
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
    "estimation_status": "draft"
  }
}
```

**✅ Save**: `data.id` = **project_id** (e.g., 1)

---

### 1.2 Send Project to Estimation
**Endpoint**: `PATCH /api/v1/projects/:id`

**Postman**:
- Method: PATCH
- URL: `http://localhost:8080/api/v1/projects/1` (use project_id from 1.1)
- Headers: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Body:
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
    "estimation_status": "draft"
  }
}
```

---

### 1.3 Create Estimation (HOURS ONLY - NO COST)
**Endpoint**: `POST /api/v1/estimation`

**Postman**:
- Method: POST
- URL: `http://localhost:8080/api/v1/estimation`
- Headers: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Body:
```json
{
  "project_id": 1,
  "status": "draft",
  "deadline": "2025-03-15",
  "notes": "Initial estimation - hours only, no cost",
  "uploaded_file_ids": []
}
```

**⚠️ IMPORTANT**: Do NOT include `cost` field. Estimation person only provides hours.

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
      "deadline": "2025-03-15",
      ...
    }
  }
}
```

**✅ Save**: `data.estimation.id` = **estimation_id** (e.g., 1)

**✅ Verify**: `cost` is `null` ✅

---

### 1.4 Create Estimation Deliverables (Table 0.0 Data)
**Endpoint**: `POST /api/v1/updates/estimation/:estimation_id/deliverables`

**Postman**:
- Method: POST
- URL: `http://localhost:8080/api/v1/updates/estimation/1/deliverables` (use estimation_id from 1.3)
- Headers: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Body:
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
**Endpoint**: `GET /api/v1/updates/estimation/:estimation_id/table`

**Postman**:
- Method: GET
- URL: `http://localhost:8080/api/v1/updates/estimation/1/table`
- Headers: `Authorization: Bearer <token>`

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
**Endpoint**: `PATCH /api/v1/updates/estimation/:id/send-to-admin`

**Postman**:
- Method: PATCH
- URL: `http://localhost:8080/api/v1/updates/estimation/1/send-to-admin`
- Headers: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Body:
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

**✅ Verify**: Status is `sent_to_admin`, cost is still `null`

---

### 1.7 Admin Verifies and Adds Cost
**Endpoint**: `PATCH /api/v1/updates/estimation/:id/admin-verify`

**Postman**:
- Method: PATCH
- URL: `http://localhost:8080/api/v1/updates/estimation/1/admin-verify`
- Headers: 
  - `Authorization: Bearer <token>` (Login as Admin user)
  - `Content-Type: application/json`
- Body:
```json
{
  "project_id": 1,
  "cost": 48200,
  "terms_and_conditions": "Payment terms: 30 days net. GST applicable.",
  "notes": "Cost verified and added by admin. All deliverables reviewed."
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
    "notes": "Cost verified and added by admin. All deliverables reviewed.",
    ...
  }
}
```

**✅ Verify**: 
- Status is `verified_by_admin` ✅
- Cost is now `48200` (not null) ✅
- Terms and conditions added ✅

---

### 1.8 Send from Admin to Proposals
**Endpoint**: `PATCH /api/v1/updates/estimation/:id/send-to-proposals`

**Postman**:
- Method: PATCH
- URL: `http://localhost:8080/api/v1/updates/estimation/1/send-to-proposals`
- Headers: 
  - `Authorization: Bearer <token>` (Admin user)
  - `Content-Type: application/json`
- Body:
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

**✅ Verify**: Status is `sent_to_proposals`, cost is present

---

### 1.9 Send from Proposals to Client
**Endpoint**: `PATCH /api/v1/updates/estimation/:id/send-to-client`

**Postman**:
- Method: PATCH
- URL: `http://localhost:8080/api/v1/updates/estimation/1/send-to-client`
- Headers: 
  - `Authorization: Bearer <token>` (Login as RFQ/Proposals user)
  - `Content-Type: application/json`
- Body:
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

**✅ Verify**: Status is `sent_to_client`, cost is present

**✅ Now Client has the estimation with cost and can provide PO**

---

## 📦 PART 2: PO (Purchase Order) Handling

### 2.1 Create PO (When Received from Client)
**Endpoint**: `POST /api/v1/updates/`

**Postman**:
- Method: POST
- URL: `http://localhost:8080/api/v1/updates/`
- Headers: 
  - `Authorization: Bearer <token>` (Proposals user)
  - `Content-Type: application/json`
- Body:
```json
{
  "project_id": 1,
  "po_number": "PO-2025-001",
  "received_date": "2025-01-20",
  "notes": "PO received from client after estimation approval",
  "terms_and_conditions": "As per estimation terms",
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

**✅ Save**: `data.id` = **po_id** (e.g., 1)

---

### 2.2 Forward PO to Admin
**Endpoint**: `PATCH /api/v1/updates/:id/forward-to-admin`

**Postman**:
- Method: PATCH
- URL: `http://localhost:8080/api/v1/updates/1/forward-to-admin`
- Headers: `Authorization: Bearer <token>`

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
**Endpoint**: `PATCH /api/v1/updates/:id/forward-to-pm`

**Postman**:
- Method: PATCH
- URL: `http://localhost:8080/api/v1/updates/1/forward-to-pm`
- Headers: `Authorization: Bearer <token>`

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
**Endpoint**: `PATCH /api/v1/updates/:id/accept`

**Postman**:
- Method: PATCH
- URL: `http://localhost:8080/api/v1/updates/1/accept`
- Headers: `Authorization: Bearer <token>`

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

## 🔧 PART 3: Work Allocation (Step 1 - PM Creates Deliverables with 10% Reduction)

### 3.1 Create Stages for Project
**Endpoint**: `POST /api/v1/workflow/projects/:project_id/stages`

**Postman**:
- Method: POST
- URL: `http://localhost:8080/api/v1/workflow/projects/1/stages`
- Headers: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Body:
```json
{
  "stages": [
    {"name": "IDC", "weight": 20, "allocated_hours": 0},
    {"name": "IFR", "weight": 20, "allocated_hours": 0},
    {"name": "IFA", "weight": 20, "allocated_hours": 0},
    {"name": "IFC", "weight": 20, "allocated_hours": 0},
    {"name": "AS-Built", "weight": 20, "allocated_hours": 0}
  ]
}
```

**Expected Response**:
```json
{
  "status_code": 201,
  "detail": "Stage created",
  "data": {
    "IDC": {"stage": {"id": 1, "name": "IDC", ...}},
    "IFR": {"stage": {"id": 2, "name": "IFR", ...}},
    ...
  }
}
```

**✅ Save**: Stage IDs for reference

---

### 3.2 Create Work Allocation from Estimation (10% Hour Reduction)
**Endpoint**: `POST /api/v1/updates/projects/:project_id/work-allocation`

**Postman**:
- Method: POST
- URL: `http://localhost:8080/api/v1/updates/projects/1/work-allocation`
- Headers: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Body:
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

**✅ Verify**: 
- Original hours: 10
- Reduced hours: 9 (10% reduction = 10 * 0.9 = 9)
- Distributed across 5 stages: ~1.8 hours per stage
- Main deliverable (sno "1") gets 3 hours for IDC
- Sub-deliverables (sno "1.1", "1.2", etc.) get distributed hours

---

### 3.3 View Work Allocation Table (Table 1.0)
**Endpoint**: `GET /api/v1/updates/projects/:project_id/work-allocation/table`

**Postman**:
- Method: GET
- URL: `http://localhost:8080/api/v1/updates/projects/1/work-allocation/table`
- Headers: `Authorization: Bearer <token>`

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
      {
        "sno": "1.2",
        "stages": "IFA",
        "revision": "A1",
        "hours": 1.8,
        ...
      },
      {
        "sno": "1.3",
        "stages": "IFC",
        "revision": "B",
        "hours": 1.8,
        ...
      },
      {
        "sno": "1.4",
        "stages": "AS-Built",
        "revision": "A",
        "hours": 1.8,
        ...
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
- Shows hierarchical structure (1, 1.1, 1.2, 1.3, 1.4)
- Hours are 10% reduced
- All columns present

---

### 3.4 Assign Work Person (PM/Project Leader assigns designers)
**Endpoint**: `PATCH /api/v1/updates/work-allocation/:id/assign`

**Postman**:
- Method: PATCH
- URL: `http://localhost:8080/api/v1/updates/work-allocation/1/assign` (use work_allocation_id)
- Headers: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Body:
```json
{
  "work_person_id": 2
}
```

**Note**: User ID 2 should be a designer/worker. Create one or use existing.

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

## 👨‍💻 PART 4: Designer Work (Step 3)

### 4.1 View Designer Dashboard (Table 2.0)
**Endpoint**: `GET /api/v1/updates/projects/:project_id/designer-dashboard`

**Postman**:
- Method: GET
- URL: `http://localhost:8080/api/v1/updates/projects/1/designer-dashboard`
- Headers: `Authorization: Bearer <token>` (Login as Designer/Worker)

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
- Shows only tasks assigned to logged-in designer
- All columns present

---

### 4.2 Start Task (Designer starts work)
**Endpoint**: `POST /api/v1/updates/time-tracking/start`

**Postman**:
- Method: POST
- URL: `http://localhost:8080/api/v1/updates/time-tracking/start`
- Headers: 
  - `Authorization: Bearer <token>` (Designer)
  - `Content-Type: application/json`
- Body:
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
**Endpoint**: `POST /api/v1/updates/time-tracking/pause`

**Postman**:
- Method: POST
- URL: `http://localhost:8080/api/v1/updates/time-tracking/pause`
- Headers: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Body:
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

**✅ Verify**: Check work allocation - `consumed_time` should be updated

---

### 4.4 Resume Task
**Endpoint**: `POST /api/v1/updates/time-tracking/resume`

**Postman**:
- Method: POST
- URL: `http://localhost:8080/api/v1/updates/time-tracking/resume`
- Headers: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Body:
```json
{
  "deliverable_id": 1,
  "drawing_log_id": null
}
```

---

### 4.5 Finish Task (Designer completes work)
**Endpoint**: `POST /api/v1/updates/time-tracking/finish`

**Postman**:
- Method: POST
- URL: `http://localhost:8080/api/v1/updates/time-tracking/finish`
- Headers: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Body:
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

**✅ Verify**: 
- Task status is "completed"
- Total consumed_time = 3 (1.5 + 1.5)

---

### 4.6 View Updated Designer Dashboard (Table 2.0 with Consumed Time)
**Endpoint**: `GET /api/v1/updates/projects/:project_id/designer-dashboard`

**Postman**:
- Method: GET
- URL: `http://localhost:8080/api/v1/updates/projects/1/designer-dashboard`
- Headers: `Authorization: Bearer <token>` (Designer)

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

## 📊 PART 5: Weekly Timesheet

### 5.1 Get/Create Weekly Timesheet
**Endpoint**: `GET /api/v1/updates/timesheet/weekly?week_start_date=2025-01-20`

**Postman**:
- Method: GET
- URL: `http://localhost:8080/api/v1/updates/timesheet/weekly?week_start_date=2025-01-20`
- Headers: `Authorization: Bearer <token>` (Designer)

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
**Endpoint**: `PATCH /api/v1/updates/timesheet/weekly/:id/submit`

**Postman**:
- Method: PATCH
- URL: `http://localhost:8080/api/v1/updates/timesheet/weekly/1/submit`
- Headers: `Authorization: Bearer <token>`

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

## 💰 PART 6: Stage-Based Billing

### 6.1 Mark Stage as Completed
**First, ensure all deliverables in a stage are completed**, then update stage status.

**Endpoint**: `PATCH /api/v1/workflow/stages/:stage_id` (existing endpoint)

**Postman**:
- Method: PATCH
- URL: `http://localhost:8080/api/v1/workflow/stages/1` (IDC stage)
- Headers: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Body:
```json
{
  "status": "completed"
}
```

---

### 6.2 Generate Invoice for Completed Stage
**Endpoint**: `POST /api/v1/updates/projects/:project_id/stages/:stage_id/invoice`

**Postman**:
- Method: POST
- URL: `http://localhost:8080/api/v1/updates/projects/1/stages/1/invoice`
- Headers: `Authorization: Bearer <token>`

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

**✅ Save**: `data.id` = **billing_id** (e.g., 1)

---

### 6.3 Forward Invoice to Proposal Team
**Endpoint**: `PATCH /api/v1/updates/billings/:id/forward-to-proposal`

**Postman**:
- Method: PATCH
- URL: `http://localhost:8080/api/v1/updates/billings/1/forward-to-proposal`
- Headers: `Authorization: Bearer <token>`

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
**Endpoint**: `PATCH /api/v1/updates/billings/:id/forward-to-client`

**Postman**:
- Method: PATCH
- URL: `http://localhost:8080/api/v1/updates/billings/1/forward-to-client`
- Headers: `Authorization: Bearer <token>`

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
**Endpoint**: `PATCH /api/v1/updates/billings/:id/mark-paid`

**Postman**:
- Method: PATCH
- URL: `http://localhost:8080/api/v1/updates/billings/1/mark-paid`
- Headers: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Body:
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

## 📋 PART 7: View All Billings

### 7.1 Get All Stage Billings for Project
**Endpoint**: `GET /api/v1/updates/projects/:project_id/billings`

**Postman**:
- Method: GET
- URL: `http://localhost:8080/api/v1/updates/projects/1/billings`
- Headers: `Authorization: Bearer <token>`

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

## ✅ COMPLETE TESTING CHECKLIST

### Part 1: Beginning Workflow (Corrected)
- [ ] Create project (enquiry)
- [ ] Send to estimation
- [ ] Create estimation (HOURS ONLY, no cost)
- [ ] Create estimation deliverables (Table 0.0)
- [ ] View estimation table
- [ ] Send estimation to Admin
- [ ] Admin verifies and adds cost
- [ ] Send from Admin to Proposals
- [ ] Send from Proposals to Client

### Part 2: PO Handling
- [ ] Create PO (after client receives estimation)
- [ ] Forward PO to Admin
- [ ] Forward PO to PM
- [ ] Accept PO

### Part 3: Work Allocation
- [ ] Create stages
- [ ] Create work allocation (10% reduction verified)
- [ ] View work allocation table (Table 1.0)
- [ ] Assign work persons

### Part 4: Designer Work
- [ ] View designer dashboard (Table 2.0)
- [ ] Start task
- [ ] Pause task
- [ ] Resume task
- [ ] Finish task
- [ ] View updated dashboard with consumed time

### Part 5: Weekly Timesheet
- [ ] Get weekly timesheet
- [ ] Submit weekly timesheet

### Part 6: Stage-Based Billing
- [ ] Mark stage as completed
- [ ] Generate stage invoice
- [ ] Forward invoice to proposal
- [ ] Forward invoice to client
- [ ] Mark invoice as paid

### Part 7: View Billings
- [ ] Get all billings for project

---

## 🔍 VERIFICATION POINTS

### ✅ Estimation Flow Verification
1. **Estimation created without cost** ✅
   - Check: `cost` is `null` in response

2. **Sent to Admin** ✅
   - Check: Status is `sent_to_admin`

3. **Admin adds cost** ✅
   - Check: Status is `verified_by_admin`
   - Check: `cost` is now a number (not null)

4. **Sent to Proposals** ✅
   - Check: Status is `sent_to_proposals`
   - Check: Cost is present

5. **Sent to Client** ✅
   - Check: Status is `sent_to_client`
   - Check: Cost is present

### ✅ Work Allocation Verification
1. **10% Hour Reduction** ✅
   - Original: 10 hours
   - Reduced: 9 hours (10 * 0.9)
   - Check: `allocated_hours` in work allocation

2. **Hierarchical Structure** ✅
   - Main: sno "1"
   - Sub: sno "1.1", "1.2", "1.3", "1.4"
   - Check: All stages have deliverables

### ✅ Table Format Verification
1. **Table 0.0** ✅
   - Columns: Sno, Drawing no, Title, Deliverables, Discipline, Hours, Amount
   - Check: All columns present

2. **Table 1.0** ✅
   - Columns: Sno, Drawing no, Title, Deliverables, Discipline, Stages, Revision, Hours, Work Person, Consumed Time
   - Check: All columns present, hours reduced

3. **Table 2.0** ✅
   - Same as Table 1.0, filtered for designer
   - Check: Consumed time updates when tracking

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue: "Cost is required" error
**Solution**: Make sure you're NOT including cost when creating estimation. Cost is added by admin later.

### Issue: "Estimation not found" when sending to admin
**Solution**: Make sure estimation is created first and you're using the correct estimation_id

### Issue: "Cannot send to admin - wrong status"
**Solution**: Estimation status should be "draft" or "created" before sending to admin

### Issue: "Admin verification failed"
**Solution**: Make sure you're logged in as admin user and cost field is provided

### Issue: "10% reduction not working"
**Solution**: Check the calculation in work allocation service - should be `hours * 0.9`

---

## 📝 NOTES

1. **Estimation Flow**: Estimation → Admin → Proposals → Client → PO
2. **Cost Addition**: Only Admin can add cost to estimation
3. **10% Reduction**: Automatically applied when creating work allocation
4. **Time Tracking**: Consumed time updates automatically
5. **Stage Billing**: Only generates when stage is completed

---

**End of Complete Testing Report** 🎉

