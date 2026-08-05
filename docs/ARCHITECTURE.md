# VulnWiz AI - Enterprise SaaS Platform Architecture

## Executive Summary
**VulnWiz AI** is an AI-powered, multi-tenant vulnerability assessment platform designed for cybersecurity consulting firms, MSSPs (Managed Security Service Providers), and enterprise security operations teams. The system provides continuous asset discovery, automated vulnerability assessment, AI-assisted risk analysis, and actionable remediation workflows.

---

## 1. System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 USER INTERFACE                                    |
|   +-------------------+   +-------------------+   +---------------------------+   |
|   |  Customer Portal  |   | Security Operations|  | Executive Reports / PDF   |   |
|   +---------+---------+   +---------+---------+   +-------------+-------------+   |
+-------------|-----------------------|---------------------------|-----------------+
              |                       |                           |
              v                       v                           v
+-----------------------------------------------------------------------------------+
|                             API GATEWAY / REVERSE PROXY                           |
|       - TLS 1.3 Termination    - Rate Limiting (Token Bucket)  - WAF Filtering    |
|       - Auth Token Validation   - Tenant Isolation Router      - CORS Policy      |
+-------------------------------------+---------------------------------------------+
                                      |
                                      v
+-----------------------------------------------------------------------------------+
|                             CORE MICROSERVICES LAYER                              |
|                                                                                   |
|  +--------------------+   +--------------------+   +--------------------------+   |
|  | Multi-Tenant Auth  |   | Asset Management   |   | Vulnerability Scanner    |   |
|  | - Argon2id Hashing |   | - Discovery Engine |   | - OWASP Top 10 Module    |   |
|  | - JWT + Refresh    |   | - Cloud Sync (AWS) |   | - Port / SSL Inspector   |   |
|  | - RBAC / ABAC      |   | - Tech Stack Classifier|  - Scope Guard & Sig Verification |
|  +---------+----------+   +---------+----------+   +------------+-------------+   |
|            |                        |                           |                 |
|            v                        v                           v                 |
|  +--------------------+   +--------------------+   +--------------------------+   |
|  | AI Security Analyst|   | Risk Scoring System|   | Vuln Lifecycle Engine    |   |
|  | - Technical Detail |   | - CVSS v3.1 Calc   |   | - Ticket & SLA Tracker   |   |
|  | - Exec Summaries   |   | - Asset Exposure Wt|   | - Audit Log Dispatcher   |   |
|  | - Code Fix Generator   | - Contextual Priority | - Evidence Verification |   |
|  +--------------------+   +--------------------+   +--------------------------+   |
+-------------------------------------+---------------------------------------------+
                                      |
                                      v
+-----------------------------------------------------------------------------------+
|                                DATA & INTEL LAYER                                 |
|                                                                                   |
|  +-------------------+   +---------------------+   +--------------------------+   |
|  | Primary PostgreSQL|   | Security Intel Db   |   | Object Storage (S3)      |   |
|  | - Encrypted at Rest|   | - NVD / CVE Sync    |   | - Encrypted Scan Logs    |   |
|  | - Row Level Security  | - OWASP / CWE Map   |   | - PDF Security Reports   |   |
|  | - Tenant ID Partition | - MITRE ATT&CK Map  |   | - Evidence Attachments   |   |
|  +-------------------+   +---------------------+   +--------------------------+   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Multi-Tenant SaaS Architecture

### Data Isolation Strategy
- **Row-Level Security (RLS)**: Every database table includes a non-nullable `tenant_id` UUID column. PostgreSQL Row-Level Security policies automatically restrict queries based on the authenticated session's tenant context.
- **Tenant Context Propagation**: Middleware extracts tenant claims from validated JWTs and sets `SET LOCAL app.current_tenant_id = '...'` for each transactional connection.
- **Storage Isolation**: S3/Blob storage paths are structured hierarchically: `s3://vulnwiz-data/{tenant_id}/{asset_id}/{scan_id}/`.

### Role-Based Access Control (RBAC) Matrix

| Role | Asset Admin | Trigger Scans | View Vulnerabilities | Change Status / Assign | Manage Billing / Tenant |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Super Admin (MSSP)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Security Analyst** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Client Admin** | ✅ | ✅ | ✅ | ✅ | ✅ (Own Tenant) |
| **Developer / Remediation** | ❌ | ❌ | ✅ | ✅ (Status update) | ❌ |
| **Executive Viewer** | ❌ | ❌ | ✅ (Read-Only) | ❌ | ❌ |

---

## 3. Vulnerability Scanning Engine Design

### Safe Assessment vs. Authorized Testing Workflow
1. **Passive/Safe Assessment**: Runs banner grabbing, TLS/SSL cipher checks, HTTP Security Headers check (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`), and public exposure evaluations without aggressive payloads.
2. **Authorized Testing Engine**: Requires digital signature authorization on scope of work (SOW) prior to execution. Guardrails prevent out-of-scope targets, target blacklisting (e.g. RFC 1918 addresses without VPN agent, localhost, government domains).

---

## 4. AI Security Analyst Pipeline

```
+-------------------+      +---------------------+      +---------------------+      +---------------------+
| Discovered Finding| ---> | Context Enrichment  | ---> | Prompt Sanitizer    | ---> | AI LLM Engine       |
| - Header Issue    |      | - CVSS Score        |      | - PII Redaction     |      | - Tech & Exec Summaries
| - Outdated TLS    |      | - Asset Criticality |      | - Secret Stripping  |      | - Attack Scenarios  |
| - SQLi Risk       |      | - Tech Stack        |      | - Grounding Guards  |      | - Step-by-Step Fixes|
+-------------------+      +---------------------+      +---------------------+      +---------------------+
```

### Hallucination Prevention & Guardrails
- **Threat Grounding**: AI prompts are restricted strictly to known CVE, CWE, and OWASP taxonomies.
- **No Autonomous Exploitation**: AI is hard-coded to produce analysis, remediation instructions, and defense code ONLY. It is forbidden from writing active exploit payloads.
- **Human In The Loop**: Remediation patches require developer approval before verification scan.
