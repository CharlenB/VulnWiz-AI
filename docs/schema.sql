-- ============================================================================
-- VulnWiz AI Enterprise Multi-Tenant PostgreSQL Schema
-- Platform: Supabase / PostgreSQL 15+
-- Author: VulnWiz AI Engineering for LAU.AI
-- Features: Row-Level Security (RLS), UUID Primary Keys, Audit Logging
-- ============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TENANTS TABLE
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL UNIQUE,
    industry VARCHAR(150) NOT NULL DEFAULT 'FinTech & Banking Services',
    plan VARCHAR(50) NOT NULL DEFAULT 'Enterprise MSSP',
    security_score INT NOT NULL DEFAULT 85 CHECK (security_score BETWEEN 0 AND 100),
    previous_score INT NOT NULL DEFAULT 80 CHECK (previous_score BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ASSETS TABLE
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('web', 'infrastructure', 'api', 'cloud')),
    owner VARCHAR(255) NOT NULL,
    tech_stack TEXT[] NOT NULL DEFAULT '{}',
    criticality VARCHAR(50) NOT NULL CHECK (criticality IN ('critical', 'high', 'medium', 'low')),
    last_scan_date TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'scanning', 'decommissioned')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. VULNERABILITIES TABLE
CREATE TABLE IF NOT EXISTS vulnerabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    cve_id VARCHAR(50),
    cwe_id VARCHAR(50),
    title VARCHAR(500) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    cvss_score NUMERIC(3, 1) NOT NULL CHECK (cvss_score BETWEEN 0.0 AND 10.0),
    cvss_vector VARCHAR(255),
    category VARCHAR(50) NOT NULL CHECK (category IN ('owasp', 'infrastructure', 'api', 'cloud', 'crypto')),
    owasp_category VARCHAR(255),
    mitre_technique VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'assigned', 'in_progress', 'fixed', 'verified', 'closed')),
    assigned_to VARCHAR(255),
    discovered_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    remediation_deadline VARCHAR(100),
    affected_url_or_port VARCHAR(500),
    description TEXT NOT NULL,
    proof_of_concept TEXT NOT NULL,
    technical_recommendation TEXT NOT NULL,
    executive_summary TEXT NOT NULL,
    attack_scenario TEXT NOT NULL,
    code_fix_snippet TEXT NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'UNVERIFIED',
    last_verification_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. AUDIT LOGS TABLE (WORM - Write Once Read Many)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR HIGH-PERFORMANCE MULTI-TENANT QUERIES
CREATE INDEX IF NOT EXISTS idx_assets_tenant_id ON assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vulns_tenant_id ON vulnerabilities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vulns_asset_id ON vulnerabilities(asset_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);

-- ROW-LEVEL SECURITY (RLS) MULTI-TENANT ISOLATION POLICIES
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Tenants Policy
CREATE POLICY tenant_isolation_policy_assets ON assets
    FOR ALL USING (tenant_id = (SELECT NULLIF(current_setting('app.current_tenant_id', true), '')::UUID));

CREATE POLICY tenant_isolation_policy_vulns ON vulnerabilities
    FOR ALL USING (tenant_id = (SELECT NULLIF(current_setting('app.current_tenant_id', true), '')::UUID));

CREATE POLICY tenant_isolation_policy_audit ON audit_logs
    FOR ALL USING (tenant_id = (SELECT NULLIF(current_setting('app.current_tenant_id', true), '')::UUID));

-- SEED INITIAL DEFAULT DEMO TENANT
INSERT INTO tenants (id, name, domain, industry, plan, security_score, previous_score)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Acme Financial Security Inc.',
    'acmefinancial.com',
    'FinTech & Banking Services',
    'Enterprise MSSP',
    82,
    76
) ON CONFLICT (domain) DO NOTHING;
