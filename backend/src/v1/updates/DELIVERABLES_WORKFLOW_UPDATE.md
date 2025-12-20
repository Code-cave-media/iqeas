# Deliverables Workflow Update

## Overview

The deliverables workflow has been updated to follow a more structured process where different roles add information at different stages:

1. **RFQ** creates initial deliverables list (without hours and amounts)
2. **Estimation** person adds hours to deliverables
3. **Admin** adds amounts to deliverables
4. Workflow continues as before

---

## New Workflow Steps

### Step 1: RFQ Creates Deliverables (Initial List)

**Endpoint**: `POST /updates/projects/:project_id/rfq-deliverables`

RFQ creates the initial list of deliverables with only:
- `sno` (Serial Number)
- `drawing_no` (Drawing Number)
- `title` (Title)
- `deliverables` (Deliverable Description)
- `discipline` (Discipline: Arch, Structural, MEP, etc.)

**Important**: RFQ deliverables should NOT include `hours` or `amount` fields.

**Example Request**:
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
    }
  ]
}
```

### Step 2: Project Sent to Estimation

**Endpoint**: `PATCH /projects/:id`

Standard project update to send to estimation.

### Step 3: Create Estimation

**Endpoint**: `POST /estimation`

When estimation is created, RFQ deliverables are automatically linked to the estimation.

**Note**: Do NOT include `cost` field at this stage.

### Step 4: Estimation Person Adds Hours

**Endpoint**: `PATCH /updates/estimation/:estimation_id/add-hours`

Estimation person adds hours to each deliverable.

**Example Request**:
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
    }
  ]
}
```

**Important**: Estimation person should NOT add `amount` - only `hours`.

### Step 5: Send Estimation to Admin

**Endpoint**: `PATCH /updates/estimation/:estimation_id/send-to-admin`

Estimation person sends the estimation with hours to admin for review.

### Step 6: Admin Adds Amounts

**Endpoint**: `PATCH /updates/estimation/:estimation_id/add-amounts`

Admin adds amounts (pricing) to each deliverable.

**Example Request**:
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
    }
  ]
}
```

### Step 7: Admin Verifies and Adds Cost

**Endpoint**: `PATCH /updates/estimation/:estimation_id/admin-verify`

Admin verifies the estimation and adds the total cost. If cost is not provided, it will be automatically calculated from the sum of all deliverable amounts.

**Example Request**:
```json
{
  "project_id": 1,
  "cost": 48200,
  "terms_and_conditions": "Payment: 30 days net",
  "notes": "Verified by admin"
}
```

---

## Database Schema Changes

### Updated `estimation_deliverables` Table

The table now supports both `project_id` and `estimation_id`:

- **RFQ Stage**: `project_id` is set, `estimation_id` is NULL
- **After Estimation Created**: Both `project_id` and `estimation_id` are set
- **Hours and Amounts**: Can be NULL initially, updated in subsequent steps

### Partial Unique Indexes

Two partial unique indexes ensure data integrity:

1. **RFQ Deliverables**: Unique on `(project_id, sno)` when `estimation_id IS NULL`
2. **Estimation Deliverables**: Unique on `(estimation_id, sno)` when `estimation_id IS NOT NULL`

---

## API Endpoints Summary

### RFQ Deliverables
- `POST /updates/projects/:project_id/rfq-deliverables` - Create RFQ deliverables
- `GET /updates/projects/:project_id/rfq-deliverables` - Get RFQ deliverables

### Estimation Deliverables
- `PATCH /updates/estimation/:estimation_id/add-hours` - Add hours (Estimation person)
- `PATCH /updates/estimation/:estimation_id/add-amounts` - Add amounts (Admin)
- `GET /updates/estimation/:estimation_id/deliverables` - Get deliverables
- `GET /updates/estimation/:estimation_id/table` - Get formatted table data (Table 0.0)

---

## Migration Notes

1. Run the updated schema migration in `schema_updates.sql`
2. Existing `estimation_deliverables` records will need to have `project_id` set if they don't already
3. The partial unique indexes will prevent duplicate deliverables at each stage

---

## Backward Compatibility

The legacy `createEstimationDeliverables` function is still available for backward compatibility, but it now uses `COALESCE` to preserve existing hours and amounts when updating.

