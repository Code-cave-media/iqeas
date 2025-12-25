-- Workflow Updates - Database Schema Migrations
-- Run these migrations to add missing workflow features

-- 1. Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    po_number VARCHAR(100) UNIQUE NOT NULL,
    received_date DATE NOT NULL,
    received_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    forwarded_to_admin_at TIMESTAMPTZ,
    forwarded_to_pm_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    notes TEXT,
    terms_and_conditions TEXT
);

CREATE TABLE IF NOT EXISTS purchase_order_files (
    po_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    uploaded_file_id INTEGER NOT NULL REFERENCES uploaded_files(id) ON DELETE CASCADE,
    PRIMARY KEY (po_id, uploaded_file_id)
);

-- 2. Estimation Deliverables Table
CREATE TABLE IF NOT EXISTS estimation_deliverables (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    estimation_id INTEGER REFERENCES estimations(id) ON DELETE CASCADE,
    sno INTEGER NOT NULL,
    drawing_no VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    deliverables VARCHAR(255) NOT NULL,
    discipline VARCHAR(50) NOT NULL,
    hours NUMERIC(10, 2),
    amount NUMERIC(10, 2)
);

-- Partial unique index for RFQ deliverables (when estimation_id is NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_rfq_deliverables_unique 
ON estimation_deliverables(project_id, sno) 
WHERE estimation_id IS NULL;

-- Partial unique index for estimation deliverables (when estimation_id is NOT NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_estimation_deliverables_unique 
ON estimation_deliverables(estimation_id, sno) 
WHERE estimation_id IS NOT NULL;

-- 3. Work Allocation Deliverables Table
CREATE TABLE IF NOT EXISTS work_allocation_deliverables (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    estimation_deliverable_id INTEGER REFERENCES estimation_deliverables(id) ON DELETE SET NULL,
    parent_deliverable_id INTEGER REFERENCES work_allocation_deliverables(id) ON DELETE SET NULL,
    sno VARCHAR(50) NOT NULL, -- e.g., "1", "1.1", "1.2"
    drawing_no VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    deliverables VARCHAR(255) NOT NULL,
    discipline VARCHAR(50) NOT NULL,
    stage_id INTEGER REFERENCES stages(id) ON DELETE SET NULL,
    stage_name VARCHAR(20),
    revision VARCHAR(50) DEFAULT '0',
    allocated_hours NUMERIC(10, 2) NOT NULL, -- 10% reduced from estimation
    work_person_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    consumed_time NUMERIC(10, 2) DEFAULT 0,
    submission_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'submitted', 'approved', 'rejected')),
    UNIQUE (project_id, sno, stage_name)
);

-- 4. Time Tracking Table (for detailed time tracking)
CREATE TABLE IF NOT EXISTS time_tracking_logs (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    work_allocation_deliverable_id INTEGER REFERENCES work_allocation_deliverables(id) ON DELETE CASCADE,
    drawing_stage_log_id INTEGER REFERENCES drawing_stage_logs(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL CHECK (action IN ('start', 'pause', 'resume', 'finish')),
    time_spent NUMERIC(10, 2) DEFAULT 0, -- hours
    notes TEXT
);

-- 5. Weekly Timesheets Table
CREATE TABLE IF NOT EXISTS weekly_timesheets (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    total_hours NUMERIC(10, 2) DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    tasks_in_progress INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved')),
    UNIQUE (user_id, week_start_date)
);

CREATE TABLE IF NOT EXISTS weekly_timesheet_tasks (
    id SERIAL PRIMARY KEY,
    timesheet_id INTEGER NOT NULL REFERENCES weekly_timesheets(id) ON DELETE CASCADE,
    work_allocation_deliverable_id INTEGER REFERENCES work_allocation_deliverables(id) ON DELETE SET NULL,
    drawing_stage_log_id INTEGER REFERENCES drawing_stage_logs(id) ON DELETE SET NULL,
    task_description TEXT,
    hours_spent NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('completed', 'in_progress'))
);

-- 6. Stage Billing Table
CREATE TABLE IF NOT EXISTS stage_billings (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    stage_id INTEGER NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
    stage_name VARCHAR(20) NOT NULL,
    invoice_id INTEGER REFERENCES uploaded_files(id) ON DELETE SET NULL,
    billing_date DATE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent_to_proposal', 'sent_to_client', 'paid')),
    sent_to_proposal_at TIMESTAMPTZ,
    sent_to_client_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS stage_billing_deliverables (
    billing_id INTEGER NOT NULL REFERENCES stage_billings(id) ON DELETE CASCADE,
    work_allocation_deliverable_id INTEGER NOT NULL REFERENCES work_allocation_deliverables(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    PRIMARY KEY (billing_id, work_allocation_deliverable_id)
);

-- 7. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    stage_billing_id INTEGER REFERENCES stage_billings(id) ON DELETE SET NULL,
    invoice_id INTEGER REFERENCES uploaded_files(id) ON DELETE SET NULL,
    payment_amount NUMERIC(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    received_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT
);

-- 8. Update users table to add project_leader, account, hr roles
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'rfq', 'estimation', 'pm', 'project_leader', 'working', 'account', 'hr'));

-- 9. Add consumed_time to drawing_stage_logs
ALTER TABLE drawing_stage_logs
ADD COLUMN IF NOT EXISTS consumed_time NUMERIC(10, 2) DEFAULT 0;

-- 10. Add submission_date to work_allocation_deliverables (already in table definition above)
-- This is handled in the work_allocation_deliverables table creation

-- 11. Add po_id to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS po_id INTEGER REFERENCES purchase_orders(id) ON DELETE SET NULL;

-- 12. Add login tracking for attendance
CREATE TABLE IF NOT EXISTS user_login_logs (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    login_time TIMESTAMPTZ NOT NULL,
    logout_time TIMESTAMPTZ,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_po_project_id ON purchase_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_estimation_deliverables_estimation_id ON estimation_deliverables(estimation_id);
CREATE INDEX IF NOT EXISTS idx_work_allocation_project_id ON work_allocation_deliverables(project_id);
CREATE INDEX IF NOT EXISTS idx_work_allocation_work_person ON work_allocation_deliverables(work_person_id);
CREATE INDEX IF NOT EXISTS idx_time_tracking_user_id ON time_tracking_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_timesheet_user_week ON weekly_timesheets(user_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_stage_billing_project ON stage_billings(project_id);
CREATE INDEX IF NOT EXISTS idx_user_login_logs_user_date ON user_login_logs(user_id, login_time);

