# Quick Testing Guide - Corrected Workflow

## Corrected Flow Summary

```
1. Create Project (Enquiry)
2. Send to Estimation
3. Create Estimation (HOURS ONLY, no cost)
4. Create Estimation Deliverables (with hours & amounts)
5. Send Estimation to Admin
6. Admin Verifies and ADDS COST
7. Send from Admin to Proposals
8. Send from Proposals to Client
9. Client Provides PO
10. PO Forwarded to Admin & PM
11. Create Work Allocation (10% reduction)
12. Assign Work Persons
13. Designer Works (Time Tracking)
14. Weekly Timesheet
15. Stage-Based Billing
```

---

## Quick Test Steps

### 1️⃣ Login
```
POST /auth/login
Body: {"email": "admin@example.com", "password": "password"}
→ Save token
```

### 2️⃣ Create Project
```
POST /projects
Body: {name, client_name, ...}
→ Save project_id
```

### 3️⃣ Send to Estimation
```
PATCH /projects/:project_id
Body: {"send_to_estimation": true}
```

### 4️⃣ Create Estimation (NO COST)
```
POST /estimation
Body: {
  "project_id": 1,
  "status": "draft",
  "deadline": "2025-03-15"
  // NO cost field!
}
→ Save estimation_id
```

### 5️⃣ Create Estimation Deliverables
```
POST /updates/estimation/:estimation_id/deliverables
Body: {
  "deliverables": [
    {"sno": 1, "hours": 10, "amount": 5000, ...},
    ...
  ]
}
```

### 6️⃣ Send to Admin
```
PATCH /updates/estimation/:estimation_id/send-to-admin
Body: {"project_id": 1}
```

### 7️⃣ Admin Adds Cost
```
PATCH /updates/estimation/:estimation_id/admin-verify
Body: {
  "project_id": 1,
  "cost": 48200,
  "terms_and_conditions": "Payment: 30 days",
  "notes": "Verified by admin"
}
```

### 8️⃣ Send to Proposals
```
PATCH /updates/estimation/:estimation_id/send-to-proposals
Body: {"project_id": 1}
```

### 9️⃣ Send to Client
```
PATCH /updates/estimation/:estimation_id/send-to-client
Body: {"project_id": 1}
```

### 🔟 Create PO (After Client Accepts)
```
POST /updates/
Body: {
  "project_id": 1,
  "po_number": "PO-2025-001",
  "received_date": "2025-01-20",
  ...
}
→ Save po_id
```

### 1️⃣1️⃣ Forward PO to Admin & PM
```
PATCH /updates/:po_id/forward-to-admin
PATCH /updates/:po_id/forward-to-pm
PATCH /updates/:po_id/accept
```

### 1️⃣2️⃣ Create Work Allocation
```
POST /updates/projects/:project_id/work-allocation
Body: {
  "estimation_id": 1,
  "stages": ["IDC", "IFR", "IFA", "IFC", "AS-Built"]
}
→ Hours automatically reduced by 10%
```

### 1️⃣3️⃣ View Tables
```
GET /updates/estimation/:estimation_id/table          → Table 0.0
GET /updates/projects/:project_id/work-allocation/table → Table 1.0
GET /updates/projects/:project_id/designer-dashboard   → Table 2.0
```

---

## Key Differences from Original

| Step | Original | Corrected |
|------|----------|-----------|
| Estimation Creation | Included cost | **Hours only, no cost** |
| After Estimation | Direct to client | **Send to Admin first** |
| Cost Addition | By estimation person | **By Admin** |
| Before Client | Direct send | **Admin → Proposals → Client** |

---

## Status Flow

```
draft (no cost)
  ↓
sent_to_admin
  ↓
verified_by_admin (cost added)
  ↓
sent_to_proposals
  ↓
sent_to_client
  ↓
PO received
```

---

## Testing Checklist

- [ ] Estimation created without cost
- [ ] Estimation sent to admin
- [ ] Admin adds cost successfully
- [ ] Estimation sent to proposals
- [ ] Estimation sent to client
- [ ] PO created after client receives estimation
- [ ] Work allocation created with 10% reduction
- [ ] All tables display correctly

