-- ====================================================================
-- LEAKGUARD DASHBOARD — SUPABASE POSTGRESQL SCHEMA WITH RLS & REALTIME
-- ====================================================================

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
CREATE TYPE scan_status AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED');
CREATE TYPE finding_status AS ENUM ('OPEN', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'IGNORED', 'FIXED', 'VERIFIED');
CREATE TYPE severity_level AS ENUM ('HIGH', 'MEDIUM', 'LOW');
CREATE TYPE confidence_level AS ENUM ('DEFINITE', 'LIKELY', 'SAFE', 'UNKNOWN');

-- 2. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 3. TABLES
-- ====================================================================

-- Profiles (Linked to Supabase Auth auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'USER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    plan TEXT NOT NULL DEFAULT 'free',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organization Members (Multi-Tenancy & Access Control)
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

-- Repositories
CREATE TABLE repositories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    github_url TEXT,
    default_branch TEXT NOT NULL DEFAULT 'main',
    is_private BOOLEAN NOT NULL DEFAULT true,
    health_score INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_scan_at TIMESTAMPTZ
);

-- Repository Members
CREATE TABLE repository_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    permission TEXT NOT NULL DEFAULT 'read', -- 'admin', 'write', 'read'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(repository_id, user_id)
);

-- Scans (Executed via Scanner Adapter against immutable LeakGuard CLI)
CREATE TABLE scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    branch TEXT NOT NULL DEFAULT 'main',
    commit_sha TEXT,
    triggered_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status scan_status NOT NULL DEFAULT 'QUEUED',
    duration_ms NUMERIC(10, 2),
    files_scanned INTEGER NOT NULL DEFAULT 0,
    definite_leaks INTEGER NOT NULL DEFAULT 0,
    likely_leaks INTEGER NOT NULL DEFAULT 0,
    unknown_leaks INTEGER NOT NULL DEFAULT 0,
    raw_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Dashboard Findings (Authoritative results overlaid with lifecycle status)
CREATE TABLE dashboard_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    line INTEGER NOT NULL,
    column_num INTEGER NOT NULL DEFAULT 0,
    resource_type TEXT NOT NULL, -- 'file', 'socket', 'sqlite_connection'
    variable_name TEXT NOT NULL,
    severity severity_level NOT NULL DEFAULT 'HIGH',
    confidence confidence_level NOT NULL DEFAULT 'DEFINITE',
    reason TEXT NOT NULL,
    suggestion TEXT NOT NULL,
    leaking_path INTEGER[] NOT NULL DEFAULT '{}',
    status finding_status NOT NULL DEFAULT 'OPEN',
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    introduced_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Finding Events (Audit trail for status changes and comments)
CREATE TABLE finding_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finding_id UUID NOT NULL REFERENCES dashboard_findings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- 'STATUS_CHANGE', 'ASSIGNMENT', 'COMMENT', 'VERIFIED'
    old_status finding_status,
    new_status finding_status,
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Baselines (Tracks baseline snapshots vs new findings)
CREATE TABLE baselines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Default Baseline',
    finding_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications (Real-time in-app alerts)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity severity_level NOT NULL DEFAULT 'HIGH',
    read BOOLEAN NOT NULL DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Platform Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- GitHub Connections (OAuth metadata)
CREATE TABLE github_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    github_user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    avatar_url TEXT,
    installation_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ====================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE finding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_connections ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if current user is an Admin
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function: Check if user belongs to Organization
CREATE OR REPLACE FUNCTION user_in_org(org_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN is_admin() OR EXISTS (
        SELECT 1 FROM organization_members
        WHERE org_id = org_id_param AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES Policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- ORGANIZATIONS Policies
CREATE POLICY "Users can view their organizations" ON organizations
    FOR SELECT USING (user_in_org(id));

CREATE POLICY "Admins can manage organizations" ON organizations
    FOR ALL USING (is_admin());

-- ORGANIZATION_MEMBERS Policies
CREATE POLICY "Users can view members of their organizations" ON organization_members
    FOR SELECT USING (user_in_org(org_id));

-- REPOSITORIES Policies
-- (User A CANNOT access User B's private repository data)
CREATE POLICY "Users can view accessible repositories" ON repositories
    FOR SELECT USING (
        user_in_org(org_id) OR
        EXISTS (SELECT 1 FROM repository_members WHERE repository_id = repositories.id AND user_id = auth.uid()) OR
        is_admin()
    );

CREATE POLICY "Org members can create repositories" ON repositories
    FOR INSERT WITH CHECK (user_in_org(org_id));

-- SCANS Policies
CREATE POLICY "Users can view scans of accessible repositories" ON scans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM repositories r
            WHERE r.id = scans.repository_id AND (user_in_org(r.org_id) OR is_admin())
        )
    );

CREATE POLICY "Users can trigger scans on accessible repositories" ON scans
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM repositories r
            WHERE r.id = scans.repository_id AND (user_in_org(r.org_id) OR is_admin())
        )
    );

-- DASHBOARD_FINDINGS Policies
CREATE POLICY "Users can view findings of accessible repositories" ON dashboard_findings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM repositories r
            WHERE r.id = dashboard_findings.repository_id AND (user_in_org(r.org_id) OR is_admin())
        )
    );

CREATE POLICY "Users can update status and assignment of findings" ON dashboard_findings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM repositories r
            WHERE r.id = dashboard_findings.repository_id AND (user_in_org(r.org_id) OR is_admin())
        )
    );

-- NOTIFICATIONS Policies
CREATE POLICY "Users can manage their own notifications" ON notifications
    FOR ALL USING (auth.uid() = user_id);

-- AUDIT_LOGS Policies
-- (Normal user cannot access system-wide admin data)
CREATE POLICY "Users can view own audit logs; Admins can view all" ON audit_logs
    FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- ====================================================================
-- 5. REALTIME REPLICATION CONFIGURATION
-- ====================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE scans;
ALTER PUBLICATION supabase_realtime ADD TABLE dashboard_findings;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ====================================================================
-- 6. AUTOMATIC PROFILE CREATION TRIGGER
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        'USER'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
