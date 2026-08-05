# VulnWiz AI - RESTful API Specification v1.0

Base URL: `https://api.vulnwiz.ai/v1`

## Authentication
All requests require standard Bearer JWT header:
`Authorization: Bearer <JWT_TOKEN>`

---

## Endpoints Summary

### 1. Assets API (`/assets`)
- `GET /assets` - List all registered assets for current tenant.
- `POST /assets` - Add new asset (Web, Infrastructure, Cloud, API).
- `GET /assets/{id}` - Get detailed posture for specific asset.
- `DELETE /assets/{id}` - Decommission asset.

### 2. Scanning API (`/scans`)
- `POST /scans/authorize` - Generate digital authorization scope token.
- `POST /scans/start` - Trigger security scan job.
- `GET /scans/{id}` - Stream or poll scan status and output.
- `GET /scans/{id}/results` - Retrieve raw scan findings.

### 3. Vulnerability Management API (`/vulnerabilities`)
- `GET /vulnerabilities` - Search & filter vulnerability findings.
- `GET /vulnerabilities/{id}` - Detailed finding analysis (CVSS, evidence, vector).
- `PATCH /vulnerabilities/{id}` - Update lifecycle status (In Progress, Fixed, Verified, Closed).
- `POST /vulnerabilities/{id}/comments` - Add internal analyst notes or evidence.

### 4. AI Security Analyst API (`/ai/analyst`)
- `POST /ai/analyze-finding` - Generate technical breakdown, executive summary, and fix.
- `POST /ai/chat` - Virtual AI Security Analyst interactive query interface.

### 5. Reports API (`/reports`)
- `POST /reports/generate` - Render Executive Summary PDF or Technical Findings CSV.
- `GET /reports/{id}/download` - Stream report document payload.

### 6. Tenant & RBAC API (`/tenants`)
- `GET /tenants/current` - Get tenant organization profile & score.
- `GET /tenants/audit-logs` - Retrieve security audit trail.
