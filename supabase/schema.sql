-- =============================================================================
-- SHIV POWER SOLUTION — COMPLETE DATABASE SCHEMA (STEP 3)
-- Safe, Idempotent, and Non-Destructive PostgreSQL Migration for Supabase
-- =============================================================================

-- 0. EXTENSIONS & UTILITY FUNCTIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- 1. USERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(50) NOT NULL DEFAULT 'Sales',
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe column additions if users table already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'full_name') THEN
        ALTER TABLE users ADD COLUMN full_name VARCHAR(150) DEFAULT 'Staff Member';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(30);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'Sales';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'department') THEN
        ALTER TABLE users ADD COLUMN department VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'created_at') THEN
        ALTER TABLE users ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

DROP TRIGGER IF EXISTS tr_users_updated ON users;
CREATE TRIGGER tr_users_updated 
BEFORE UPDATE ON users 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =============================================================================
-- 2. LEADS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255),
    contact_person VARCHAR(150),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    location VARCHAR(255),
    industry VARCHAR(100),
    source VARCHAR(100) NOT NULL DEFAULT 'Website',
    requirement TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'New',
    lead_score INTEGER DEFAULT 50,
    notes TEXT,
    assigned_to VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe column additions if leads table already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'company_name') THEN
        ALTER TABLE leads ADD COLUMN company_name VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'contact_person') THEN
        ALTER TABLE leads ADD COLUMN contact_person VARCHAR(150);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'phone') THEN
        ALTER TABLE leads ADD COLUMN phone VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'email') THEN
        ALTER TABLE leads ADD COLUMN email VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'location') THEN
        ALTER TABLE leads ADD COLUMN location VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'industry') THEN
        ALTER TABLE leads ADD COLUMN industry VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'source') THEN
        ALTER TABLE leads ADD COLUMN source VARCHAR(100) DEFAULT 'Website';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'requirement') THEN
        ALTER TABLE leads ADD COLUMN requirement TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'status') THEN
        ALTER TABLE leads ADD COLUMN status VARCHAR(50) DEFAULT 'New';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'lead_score') THEN
        ALTER TABLE leads ADD COLUMN lead_score INTEGER DEFAULT 50;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'notes') THEN
        ALTER TABLE leads ADD COLUMN notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'assigned_to') THEN
        ALTER TABLE leads ADD COLUMN assigned_to VARCHAR(150);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'created_at') THEN
        ALTER TABLE leads ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'updated_at') THEN
        ALTER TABLE leads ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    -- Backfill 'source' from 'lead_source' if legacy column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'lead_source') THEN
        UPDATE leads SET source = lead_source WHERE (source IS NULL OR source = '') AND lead_source IS NOT NULL;
    END IF;
END $$;

DROP TRIGGER IF EXISTS tr_leads_updated ON leads;
CREATE TRIGGER tr_leads_updated 
BEFORE UPDATE ON leads 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =============================================================================
-- 3. CUSTOMERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID UNIQUE REFERENCES leads(id) ON DELETE SET NULL,
    company_name VARCHAR(255),
    contact_person VARCHAR(150),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    location VARCHAR(255),
    industry VARCHAR(100),
    customer_type VARCHAR(50) DEFAULT 'Business',
    gst_number VARCHAR(25),
    address TEXT,
    assigned_to VARCHAR(150),
    status VARCHAR(50) DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS tr_customers_updated ON customers;
CREATE TRIGGER tr_customers_updated 
BEFORE UPDATE ON customers 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =============================================================================
-- 4. QUOTATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_number VARCHAR(100) NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    project_id UUID,
    title VARCHAR(255) DEFAULT 'Quotation for Power Equipment',
    description TEXT,
    amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(14,2) DEFAULT 0.00,
    discount NUMERIC(14,2) DEFAULT 0.00,
    tax NUMERIC(14,2) DEFAULT 0.00,
    total NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    valid_until DATE,
    validity_date DATE,
    quotation_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_by VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe column additions if quotations table already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotations' AND column_name = 'lead_id') THEN
        ALTER TABLE quotations ADD COLUMN lead_id UUID REFERENCES leads(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotations' AND column_name = 'title') THEN
        ALTER TABLE quotations ADD COLUMN title VARCHAR(255) DEFAULT 'Quotation for Power Equipment';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotations' AND column_name = 'description') THEN
        ALTER TABLE quotations ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotations' AND column_name = 'amount') THEN
        ALTER TABLE quotations ADD COLUMN amount NUMERIC(14,2) DEFAULT 0.00;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotations' AND column_name = 'valid_until') THEN
        ALTER TABLE quotations ADD COLUMN valid_until DATE;
    END IF;
END $$;

DROP TRIGGER IF EXISTS tr_quotations_updated ON quotations;
CREATE TRIGGER tr_quotations_updated 
BEFORE UPDATE ON quotations 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =============================================================================
-- 5. QUOTATION ITEMS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1.00,
    unit VARCHAR(50) DEFAULT 'Nos',
    unit_price NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(14,2) DEFAULT 0.00,
    tax NUMERIC(14,2) DEFAULT 0.00,
    total NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================================
-- 6. PROJECTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
    project_name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    expected_completion_date DATE,
    actual_completion_date DATE,
    project_value NUMERIC(14,2) DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'Planning',
    assigned_to VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link quotations.project_id to projects if not already linked
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_quotations_project'
    ) THEN
        ALTER TABLE quotations ADD CONSTRAINT fk_quotations_project 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
    END IF;
END $$;

DROP TRIGGER IF EXISTS tr_projects_updated ON projects;
CREATE TRIGGER tr_projects_updated 
BEFORE UPDATE ON projects 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =============================================================================
-- 7. TASKS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    assigned_to VARCHAR(150),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
    status VARCHAR(50) NOT NULL DEFAULT 'Todo',
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS tr_tasks_updated ON tasks;
CREATE TRIGGER tr_tasks_updated 
BEFORE UPDATE ON tasks 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =============================================================================
-- 8. FOLLOWUPS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    assigned_to VARCHAR(150),
    followup_date TIMESTAMPTZ NOT NULL,
    followup_type VARCHAR(50) NOT NULL DEFAULT 'Call',
    subject VARCHAR(255),
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_followup_target CHECK (lead_id IS NOT NULL OR customer_id IS NOT NULL)
);

DROP TRIGGER IF EXISTS tr_followups_updated ON followups;
CREATE TRIGGER tr_followups_updated 
BEFORE UPDATE ON followups 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =============================================================================
-- 9. ACTIVITIES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    performed_by VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================================
-- 10. NOTIFICATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(100) NOT NULL DEFAULT 'general',
    related_record_id UUID,
    related_record_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================================
-- 11. INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads (source);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads (phone);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);
CREATE INDEX IF NOT EXISTS idx_leads_company ON leads (company_name);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads (assigned_to);

CREATE INDEX IF NOT EXISTS idx_customers_status ON customers (status);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers (phone);
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers (company_name);
CREATE INDEX IF NOT EXISTS idx_customers_lead_id ON customers (lead_id);

CREATE INDEX IF NOT EXISTS idx_quotations_cust_id ON quotations (customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations (status);
CREATE INDEX IF NOT EXISTS idx_quotations_number ON quotations (quotation_number);

CREATE INDEX IF NOT EXISTS idx_quotation_items_qid ON quotation_items (quotation_id);

CREATE INDEX IF NOT EXISTS idx_projects_cust_id ON projects (customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_assigned ON projects (assigned_to);

CREATE INDEX IF NOT EXISTS idx_tasks_proj_id ON tasks (project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks (assigned_to);

CREATE INDEX IF NOT EXISTS idx_followups_lead_id ON followups (lead_id);
CREATE INDEX IF NOT EXISTS idx_followups_cust_id ON followups (customer_id);
CREATE INDEX IF NOT EXISTS idx_followups_date ON followups (followup_date);

CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON activities (lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_cust_id ON activities (customer_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, is_read);


-- =============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Development access policies (compatible with public/anon key)
DROP POLICY IF EXISTS "dev_users_access" ON users;
CREATE POLICY "dev_users_access" ON users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "dev_leads_access" ON leads;
CREATE POLICY "dev_leads_access" ON leads FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "dev_customers_access" ON customers;
CREATE POLICY "dev_customers_access" ON customers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "dev_quotations_access" ON quotations;
CREATE POLICY "dev_quotations_access" ON quotations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "dev_quotation_items_access" ON quotation_items;
CREATE POLICY "dev_quotation_items_access" ON quotation_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "dev_projects_access" ON projects;
CREATE POLICY "dev_projects_access" ON projects FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "dev_tasks_access" ON tasks;
CREATE POLICY "dev_tasks_access" ON tasks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "dev_followups_access" ON followups;
CREATE POLICY "dev_followups_access" ON followups FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "dev_activities_access" ON activities;
CREATE POLICY "dev_activities_access" ON activities FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "dev_notifications_access" ON notifications;
CREATE POLICY "dev_notifications_access" ON notifications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
