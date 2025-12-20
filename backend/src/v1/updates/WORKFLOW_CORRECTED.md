# Corrected Workflow - Estimation to PO Flow

## Corrected Workflow Steps

### The Beginning - Corrected Flow:

1. **Enquiry from Client to Proposals** ✅
2. **Proposal team collects required data** ✅
3. **Estimation person assigns HOURS ONLY (no cost)** ✅
4. **Estimation sent to Admin** ✅ NEW
5. **Admin verifies and ADDS COST with Terms and Conditions** ✅ NEW
6. **Estimation sent from Admin back to Proposals** ✅ NEW
7. **Proposals send Final Estimation to Client** ✅ NEW
8. **PO From Client to proposals** ✅
9. **Proposals to admin and Project manager** ✅
10. **Work will start** ✅
11. **Each Stage of work will be monitored, and an invoice will be created by the Account team** ✅
12. **Invoice from the account team to the Proposal Team** ✅
13. **The proposal team will send the invoice and get the payments** ✅
14. **Repeating the Cycle** ✅

---

## Key Changes Made

### 1. Estimation Creation
- **Before**: Estimation included cost
- **After**: Estimation created with **HOURS ONLY**, no cost field required
- **Endpoint**: `POST /estimation` (cost is optional/null)

### 2. Admin Verification Flow
- **New Endpoint**: `PATCH /updates/estimation/:id/send-to-admin`
  - Estimation person sends estimation to admin
  - Status: `sent_to_admin`

- **New Endpoint**: `PATCH /updates/estimation/:id/admin-verify`
  - Admin verifies and adds cost
  - Status: `verified_by_admin`
  - Admin adds: cost, terms_and_conditions, notes

### 3. Proposals Flow
- **New Endpoint**: `PATCH /updates/estimation/:id/send-to-proposals`
  - Admin sends verified estimation to proposals
  - Status: `sent_to_proposals`

- **New Endpoint**: `PATCH /updates/estimation/:id/send-to-client`
  - Proposals send final estimation to client
  - Status: `sent_to_client`

### 4. PO Flow (Unchanged)
- PO is created after client receives estimation
- PO forwarded to Admin and PM
- Rest of workflow continues as before

---

## Updated Status Flow

```
Estimation Created (draft, no cost)
    ↓
Sent to Admin (sent_to_admin)
    ↓
Admin Verifies & Adds Cost (verified_by_admin)
    ↓
Sent to Proposals (sent_to_proposals)
    ↓
Sent to Client (sent_to_client)
    ↓
Client Provides PO
    ↓
PO Forwarded to Admin & PM
    ↓
Work Starts
```

---

## New Endpoints Summary

| Endpoint | Method | Description | Role |
|----------|--------|-------------|------|
| `/updates/estimation/:id/send-to-admin` | PATCH | Send estimation to admin | estimation |
| `/updates/estimation/:id/admin-verify` | PATCH | Admin verifies and adds cost | admin |
| `/updates/estimation/:id/send-to-proposals` | PATCH | Send from admin to proposals | admin |
| `/updates/estimation/:id/send-to-client` | PATCH | Send from proposals to client | rfq |
| `/updates/estimation/pending-admin` | GET | Get estimations pending admin | admin |
| `/updates/estimation/pending-proposals` | GET | Get estimations pending proposals | rfq |

---

## Testing the Corrected Flow

### Step 1: Create Estimation (Hours Only)
```json
POST /estimation
{
  "project_id": 1,
  "status": "draft",
  "deadline": "2025-03-15",
  "notes": "Hours estimation only"
  // NO cost field
}
```

### Step 2: Create Estimation Deliverables (Hours & Amounts)
```json
POST /updates/estimation/:id/deliverables
{
  "deliverables": [
    {
      "sno": 1,
      "hours": 10,
      "amount": 5000  // This is for reference, not final cost
    }
  ]
}
```

### Step 3: Send to Admin
```json
PATCH /updates/estimation/:id/send-to-admin
{
  "project_id": 1
}
```

### Step 4: Admin Verifies and Adds Cost
```json
PATCH /updates/estimation/:id/admin-verify
{
  "project_id": 1,
  "cost": 48200,
  "terms_and_conditions": "Payment terms: 30 days net",
  "notes": "Cost verified by admin"
}
```

### Step 5: Send to Proposals
```json
PATCH /updates/estimation/:id/send-to-proposals
{
  "project_id": 1
}
```

### Step 6: Send to Client
```json
PATCH /updates/estimation/:id/send-to-client
{
  "project_id": 1
}
```

### Step 7: Client Provides PO
```json
POST /updates/
{
  "project_id": 1,
  "po_number": "PO-2025-001",
  ...
}
```

---

## Database Status Values

The estimation status now includes:
- `draft` - Initial creation
- `sent_to_admin` - Sent to admin for verification
- `verified_by_admin` - Admin has verified and added cost
- `sent_to_proposals` - Sent back to proposals
- `sent_to_client` - Sent to client
- `estimation_approved` - Client approved
- `estimation_rejected` - Client rejected

---

## Important Notes

1. **Cost is NULL initially**: Estimation person does NOT provide cost
2. **Admin adds cost**: Only admin can add/update the cost field
3. **Terms and Conditions**: Added by admin during verification
4. **Proposals role**: RFQ/Proposals team sends final estimation to client
5. **PO comes after**: Client provides PO only after receiving estimation with cost

