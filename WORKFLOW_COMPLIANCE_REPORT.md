# Workflow Compliance Report

## Executive Summary
This report analyzes the backend codebase against the specified workflow requirements. The analysis reveals several critical gaps and missing features that need to be addressed to fully comply with the workflow.

---

## 1. THE BEGINNING - Workflow Steps

### ✅ IMPLEMENTED
- **Enquiry from Client to Proposals**: ✅ Implemented via `projects` table and `createProject` function
- **Proposal team collects required data**: ✅ Implemented via `project_more_info` table
- **Estimation person assigns hours**: ✅ Partially - estimation exists but no detailed deliverables list with hours/amounts
- **Admin updates amounts with Terms and Conditions**: ❌ **MISSING** - No specific field or workflow for admin to update amounts
- **Final Estimation sent to Client**: ✅ Implemented via `estimation.status` and `estimation_uploaded_files`
- **PO From Client to proposals**: ❌ **MISSING** - No PO (Purchase Order) table or handling logic
- **Proposals to admin and Project manager**: ✅ Partially - `sent_to_pm` flag exists, but no explicit admin forwarding
- **Work starts**: ✅ Implemented - project status changes to "working"
- **Invoice created by Account team**: ✅ Partially - invoice creation exists but not stage-based
- **Invoice from account team to Proposal Team**: ❌ **MISSING** - No workflow for invoice forwarding
- **Proposal team sends invoice and gets payments**: ❌ **MISSING** - No payment tracking

---

## 2. STEP 1: (Proposal, Admin, Project manager, Project Leader)

### ❌ CRITICAL ISSUES

#### 2.1 PO Handling
- **Status**: ❌ **NOT IMPLEMENTED**
- **Issue**: No database table or logic for Purchase Orders (PO)
- **Required**: 
  - PO table with fields: project_id, po_number, received_date, po_file, status
  - Logic to forward PO from Proposal team to Admin and PM
  - PO acceptance/rejection workflow

#### 2.2 Project Manager Recreates Deliverables
- **Status**: ❌ **NOT IMPLEMENTED**
- **Issue**: No functionality for PM to recreate deliverables with 10% hour reduction
- **Required**:
  - Deliverables table with: drawing_no, title, deliverables, discipline, hours, amount
  - Logic to create deliverables from estimation with 10% hour reduction
  - Dashboard for PM to view and recreate deliverables

#### 2.3 Project Leader Role
- **Status**: ❌ **MISSING**
- **Issue**: No "project_leader" role in the system
- **Current Roles**: `admin`, `rfq`, `estimation`, `pm`, `working`, `documentation`
- **Required**: Add `project_leader` role and associated permissions

#### 2.4 Designer Assignment
- **Status**: ⚠️ **PARTIALLY IMPLEMENTED**
- **Issue**: Designers can be assigned via `drawing_stage_logs.forwarded_user_id`, but no explicit "designer" role or assignment workflow
- **Required**: Clear designer assignment mechanism under Project Leader

#### 2.5 Invoice Generation by PM
- **Status**: ⚠️ **PARTIALLY IMPLEMENTED**
- **Issue**: Invoice creation exists (`createInvoice`) but:
  - Not triggered by PM monitoring work
  - Not stage-based billing
  - No integration with accounting team workflow
- **Required**: Stage-based invoice generation when all deliverables in a stage are complete

---

## 3. STEP 2: (Project Leader, Designers)

### ❌ CRITICAL ISSUES

#### 3.1 Project Leader Functionality
- **Status**: ❌ **NOT IMPLEMENTED**
- **Issue**: No Project Leader role or dashboard
- **Required**:
  - Project Leader dashboard showing deliverables
  - Ability to assign work to designers
  - Ability to handle revisions and stages

#### 3.2 Revision and Stage Management
- **Status**: ⚠️ **PARTIALLY IMPLEMENTED**
- **Issue**: 
  - Revisions exist in `stages.revision` and `drawings.revision`
  - But no clear workflow for Project Leader to manage revisions
  - No dashboard showing revision status per drawing
- **Required**: Project Leader dashboard with revision tracking

#### 3.3 Client/Contractor Communication
- **Status**: ❌ **NOT IMPLEMENTED**
- **Issue**: No specific functionality for Project Leader to discuss project-related things with client/contractor
- **Required**: Communication channel or notes system for Project Leader

---

## 4. STEP 3: (Designer)

### ⚠️ PARTIALLY IMPLEMENTED

#### 4.1 Work Assignment
- **Status**: ✅ **IMPLEMENTED**
- **Implementation**: Via `drawing_stage_logs` with `forwarded_user_id`

#### 4.2 Task Start/Pause/Finish
- **Status**: ⚠️ **PARTIALLY IMPLEMENTED**
- **Issue**: 
  - Task activity logs exist (`task_activity_logs`) with actions: start, pause, re_open, complete
  - But these are for `tasks` table, not for `drawing_stage_logs`
  - No start/pause/finish functionality for drawing stage logs
- **Required**: Add start/pause/finish actions to drawing stage logs

#### 4.3 Dashboard Updates
- **Status**: ✅ **IMPLEMENTED**
- **Implementation**: `getUserAssignedTasksForProject` provides designer dashboard

#### 4.4 Time Tracking (Consumed Time)
- **Status**: ❌ **NOT IMPLEMENTED**
- **Issue**: No field or logic to track consumed time per task
- **Required**: 
  - Add `consumed_time` field to `drawing_stage_logs` or create separate time tracking table
  - Logic to calculate and store consumed time when designer starts/pauses/finishes
  - Display consumed time vs allocated hours

#### 4.5 Submission to Senior Project Leaders
- **Status**: ⚠️ **PARTIALLY IMPLEMENTED**
- **Issue**: 
  - `forwarded_user_id` exists but no "option to choose" senior project leader
  - No list of senior project leaders for selection
- **Required**: Dropdown/selection for senior project leaders when submitting

---

## 5. DETAILED WORK ALLOCATION

### ❌ CRITICAL MISSING FEATURES

#### 5.1 Estimation Deliverables List
- **Status**: ❌ **NOT IMPLEMENTED**
- **Issue**: No table or structure to store estimation deliverables with:
  - Sno, Drawing no, Title, Deliverables, Discipline, Hours, Amount
- **Current State**: Estimation only has `cost`, `deadline`, `notes` - no detailed deliverables breakdown
- **Required**: 
  - Create `estimation_deliverables` table with all required fields
  - API to create/update estimation deliverables
  - Display in estimation dashboard

#### 5.2 Work Allocation Deliverables
- **Status**: ❌ **NOT IMPLEMENTED**
- **Issue**: No table for work allocation with:
  - Sno, Drawing no, Title, Deliverables, Discipline, Stages, Revision, Hours, Work Person, Consumed Time
- **Current State**: 
  - `drawings` table exists but doesn't match the required structure
  - No direct link between estimation deliverables and work allocation
- **Required**: 
  - Create `work_allocation_deliverables` table
  - Logic to create from estimation with 10% hour reduction
  - Dashboard showing all deliverables with stages and assignments

#### 5.3 10% Hour Reduction
- **Status**: ❌ **NOT IMPLEMENTED**
- **Issue**: No logic to reduce hours by 10% when creating work allocation from estimation
- **Required**: 
  - Function to calculate: `work_hours = estimation_hours * 0.9`
  - Apply this when PM recreates deliverables

#### 5.4 Stage-based Deliverables
- **Status**: ⚠️ **PARTIALLY IMPLEMENTED**
- **Issue**: 
  - Stages exist (`stages` table) with names like IDC, IFR, IFA, IFC
  - Drawings are linked to stages
  - But no clear structure showing same deliverable across multiple stages (e.g., Door Panel Cutout in IDC, IFR, IFA, IFC, AS-Built)
- **Required**: 
  - Structure to represent same deliverable across multiple stages
  - Dashboard showing: Sno 1, 1.1, 1.2, 1.3, 1.4 for same drawing in different stages

#### 5.5 Work Person Assignment
- **Status**: ⚠️ **PARTIALLY IMPLEMENTED**
- **Issue**: 
  - Assignment exists via `drawing_stage_logs.forwarded_user_id`
  - But no clear "Work Person" field in deliverables structure
  - No PM/Project Leader dashboard to assign work persons
- **Required**: Clear work person assignment in deliverables structure

---

## 6. BACKGROUND WORK

### ❌ CRITICAL MISSING FEATURES

#### 6.1 Weekly Timesheet
- **Status**: ❌ **NOT IMPLEMENTED**
- **Issue**: No weekly timesheet functionality
- **Required**: 
  - Create `weekly_timesheets` table with: user_id, week_start_date, tasks_completed, tasks_in_progress
  - API to generate weekly timesheet
  - Display tasks completed or in progress for that week

#### 6.2 Attendance Based on Login
- **Status**: ⚠️ **PARTIALLY IMPLEMENTED**
- **Issue**: 
  - `attendance` table exists but requires manual entry
  - No automatic attendance registration based on login
- **Required**: 
  - Logic to automatically create attendance record on user login
  - Track login time and calculate attendance status

#### 6.3 Submission Date Monitoring
- **Status**: ❌ **NOT IMPLEMENTED**
- **Issue**: No tracking of submission dates
- **Required**: 
  - Add `submission_date` field to deliverables or drawing stage logs
  - Monitor and alert on overdue submissions
  - Dashboard showing submission dates and status

---

## 7. BILLING

### ❌ CRITICAL ISSUES

#### 7.1 Stage-based Billing
- **Status**: ❌ **NOT IMPLEMENTED**
- **Issue**: 
  - Invoice creation exists but not stage-based
  - No logic to check if all deliverables in a stage are complete
  - No automatic invoice generation when stage completes
- **Required**: 
  - Logic to check stage completion (all deliverables in stage are done)
  - Generate invoice when stage is complete
  - Invoice should include all deliverables from that stage

#### 7.2 Billing Format
- **Status**: ⚠️ **PARTIALLY IMPLEMENTED**
- **Issue**: 
  - Invoice template exists (`template.html`)
  - But doesn't match the required billing format from workflow
- **Required**: Update invoice format to match workflow requirements

---

## 8. DATABASE SCHEMA GAPS

### Missing Tables:
1. **`purchase_orders`** - For PO handling
2. **`estimation_deliverables`** - For estimation deliverables list
3. **`work_allocation_deliverables`** - For work allocation structure
4. **`weekly_timesheets`** - For weekly timesheet tracking
5. **`time_tracking`** - For consumed time tracking (or add field to existing table)
6. **`submission_dates`** - For submission date monitoring (or add field)
7. **`payments`** - For payment tracking

### Missing Fields:
1. **`drawing_stage_logs.consumed_time`** - Track time consumed per task
2. **`drawing_stage_logs.submission_date`** - Track submission dates
3. **`projects.po_id`** - Link project to PO
4. **`drawings.work_person_id`** - Assign work person to drawing
5. **`drawings.estimation_deliverable_id`** - Link to estimation deliverable

---

## 9. ROLE-BASED ACCESS GAPS

### Missing Roles:
1. **`project_leader`** - Required for Step 2 workflow
2. **`account`** - Required for accounting team (mentioned in workflow)
3. **`hr`** - Required for HR functions (mentioned in workflow)

### Role Updates Needed:
- Remove `documentation` role (mentioned in workflow as "Required to Remove")
- Add proper permissions for each role

---

## 10. API ENDPOINT GAPS

### Missing Endpoints:
1. **PO Management**:
   - `POST /api/v1/po` - Create PO
   - `GET /api/v1/po/:id` - Get PO details
   - `PATCH /api/v1/po/:id` - Update PO status
   - `POST /api/v1/po/:id/forward` - Forward PO to Admin/PM

2. **Estimation Deliverables**:
   - `POST /api/v1/estimation/:id/deliverables` - Create estimation deliverables
   - `GET /api/v1/estimation/:id/deliverables` - Get estimation deliverables
   - `PATCH /api/v1/estimation/:id/deliverables/:deliverable_id` - Update deliverable

3. **Work Allocation**:
   - `POST /api/v1/projects/:id/work-allocation` - Create work allocation from estimation
   - `GET /api/v1/projects/:id/work-allocation` - Get work allocation
   - `PATCH /api/v1/work-allocation/:id/assign` - Assign work person

4. **Time Tracking**:
   - `POST /api/v1/drawing-logs/:id/start` - Start task
   - `POST /api/v1/drawing-logs/:id/pause` - Pause task
   - `POST /api/v1/drawing-logs/:id/finish` - Finish task
   - `PATCH /api/v1/drawing-logs/:id/time` - Update consumed time

5. **Weekly Timesheet**:
   - `GET /api/v1/timesheet/weekly` - Get weekly timesheet
   - `POST /api/v1/timesheet/weekly` - Create weekly timesheet

6. **Stage-based Billing**:
   - `POST /api/v1/projects/:id/stages/:stage_id/invoice` - Generate invoice for stage
   - `GET /api/v1/projects/:id/billing-status` - Get billing status by stage

---

## 11. SUMMARY OF CRITICAL GAPS

### High Priority (Blocking Workflow):
1. ❌ PO (Purchase Order) handling
2. ❌ Estimation deliverables list (with hours and amounts)
3. ❌ Work allocation deliverables creation with 10% hour reduction
4. ❌ Project Leader role and functionality
5. ❌ Consumed time tracking
6. ❌ Stage-based billing
7. ❌ Weekly timesheet
8. ❌ Attendance based on login

### Medium Priority (Workflow Incomplete):
1. ⚠️ Designer start/pause/finish for drawing logs
2. ⚠️ Submission date monitoring
3. ⚠️ Payment tracking
4. ⚠️ Invoice forwarding workflow
5. ⚠️ Client/contractor communication for Project Leader

### Low Priority (Enhancements):
1. ⚠️ Better dashboard views matching workflow tables
2. ⚠️ Revision management UI
3. ⚠️ Senior project leader selection dropdown

---

## 12. RECOMMENDATIONS

1. **Immediate Actions**:
   - Create PO handling system
   - Implement estimation deliverables structure
   - Add Project Leader role
   - Implement 10% hour reduction logic
   - Add consumed time tracking

2. **Short-term Actions**:
   - Implement stage-based billing
   - Create weekly timesheet functionality
   - Add automatic attendance on login
   - Implement submission date monitoring

3. **Long-term Actions**:
   - Complete payment tracking
   - Enhance dashboards to match workflow tables
   - Add communication features for Project Leader

---

## Conclusion

The current backend implementation covers approximately **40-50%** of the required workflow. Critical gaps exist in PO handling, deliverables management, time tracking, and billing. Significant development work is required to fully comply with the specified workflow.

