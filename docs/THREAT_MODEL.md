# Threat Model & Risk Assessment (STRIDE Methodology)

## 1. System Boundaries & Assets
- **Primary Assets**: Customer Asset Inventory, Vulnerability Assessment Reports, Tenant Credentials, API Keys, Digital Authorization Certificates.
- **Trust Boundaries**:
  1. Client Web Browser <-> API Gateway (Public Web)
  2. API Gateway <-> Core Microservices (Internal VPC)
  3. Microservices <-> Scanner Workers (Isolated Scanning Subnet)
  4. Core System <-> AI Engine (Sanitized API Boundary)

---

## 2. STRIDE Analysis

### Spoofing Identity
- **Risk**: Attacker impersonates an enterprise security analyst or customer admin.
- **Mitigation**: Multi-Factor Authentication (TOTP / WebAuthn), mandatory Argon2id password hashing, short-lived JWT access tokens (15 mins) + rotated Refresh Tokens stored in HttpOnly SameSite=Strict cookies.

### Tampering with Data
- **Risk**: Unauthorized modification of vulnerability severity or marking findings as "Fixed" without actual remediation.
- **Mitigation**: HMAC-SHA256 signature on scan reports, immutable append-only Audit Logs for every vulnerability status change, digital signature on testing scope authorizations.

### Repudiation
- **Risk**: A customer claims they did not authorize a security scan against a specific host.
- **Mitigation**: Mandatory Cryptographic Scope Authorization Certificate generated upon scan setup, logging initiator IP, timestamp, user ID, and signed scope hash.

### Information Disclosure
- **Risk**: Cross-tenant data leak where Organization A sees Organization B's critical zero-day vulnerabilities.
- **Mitigation**: PostgreSQL Row-Level Security (RLS), multi-tenant isolation validation tests in CI/CD pipeline, AES-256-GCM encryption for report attachments at rest.

### Denial of Service
- **Risk**: Malicious user launches 1,000 concurrent heavy vulnerability scans to exhaust scanner workers.
- **Mitigation**: Per-tenant concurrency limits (e.g. 2 active scans max for Standard tier), Redis token bucket rate limiting on scanner triggers, resource isolation per scan job.

### Elevation of Privilege
- **Risk**: Standard user elevates privileges to Super Admin or accesses other tenant's organization settings.
- **Mitigation**: Strict RBAC middleware enforced at API Gateway level; ownership checks on every database access (`WHERE tenant_id = :tenant_id AND id = :asset_id`).
