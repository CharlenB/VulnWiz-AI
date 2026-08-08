# VulnWiz AI — Comprehensive Feature & Architectural Overview

Welcome to the complete technical and functional documentation for **VulnWiz AI**. This document provides an in-depth, module-by-module explanation of how the application works, its underlying architecture, data flows, security guardrails, and feature sets.

---

## 1. Executive Summary & Core Value Proposition

**VulnWiz AI** is an enterprise-grade, AI-powered Vulnerability Assessment and Remediation SaaS platform designed for Managed Security Service Providers (MSSPs), DevSecOps engineers, cybersecurity consultants, and C-level security executives.

### Key Capabilities:
- **Continuous OWASP Scanning**: Automated active web and API vulnerability scanning with zero configuration overhead.
- **Multi-LLM Security Analyst**: AI-driven root cause analysis, C-level executive briefings, simulated attack scenarios, and production-ready secure code fixes using OpenAI, Google Gemini, Anthropic Claude, Ollama, or local engines.
- **Live Threat Intelligence**: Integration with CISA's Known Exploited Vulnerabilities (KEV) catalog and NIST NVD APIs to highlight active in-the-wild threats.
- **Supply Chain & SBOM**: Automated dependency vulnerability scanning across npm, PyPI, Maven, Go, Cargo, and system packages.
- **Compliance Automation**: Automated mapping of findings to **PCI-DSS v4.0**, **SOC 2 Type II**, **ISO 27001:2022**, **HIPAA**, and **NIST SP 800-53**.
- **Seller-Only Multi-Tenant Architecture**: Strict organization tenant isolation where only the platform seller (Super Admin) can provision organizations for customer buyer emails.

---

## 2. Multi-Tenant Architecture & RBAC Security Model

### Tenant Provisioning & Buyer Isolation Model
VulnWiz AI implements a **Seller-Exclusive Tenant Provisioning Model**:
1. **Seller Super Admin Control**: Only platform Super Admins can create and provision new organization tenants.
2. **Customer Buyer Email Mapping**: When provisioning an organization (e.g. *Acme Corp*), the Super Admin assigns the buyer's email address (e.g. `sarah@lau.ai`).
3. **Tenant Dropdown Filtering**: When a customer buyer logs in, the tenant dropdown in the navigation bar strictly filters and displays **only the organization(s) assigned to their registered email address**. Non-Super Admin buyers cannot add or register organizations.

### Role-Based Access Control (RBAC)
VulnWiz AI defines 5 granular user roles (`rbacService.ts`):

| Role | Target Persona | Key Permissions |
| :--- | :--- | :--- |
| **Super Admin** | Platform Owner / Seller | Full system control, tenant provisioning, subscriber management, scanner triggers, all tabs. |
| **Security Analyst** | SecOps / MSSP Consultant | Trigger scans, use AI Analyst, update ticket statuses, manage assets, export reports. |
| **Client Admin** | Customer IT Admin | Manage team assets, view compliance dashboards, manage company billing. Cannot trigger raw scans. |
| **Developer** | Software Engineer | View assigned vulnerability tickets, access AI-generated secure code snippets, run patch verifications. |
| **Executive Viewer** | C-Level / Board Member | Read-only executive dashboard access, compliance posture overview, executive PDF export. |

---

## 3. Detailed Feature Breakdown by Module

### 📊 Module 1: Executive Security Dashboard (`DashboardView.tsx`)
The central command center providing an aggregated overview of enterprise risk.

- **Security Posture Score (0-100)**: Calculated dynamically based on open vulnerability severities, asset criticalities, and SLA compliance.
- **Severity Metrics**: Quick counts of Critical, High, Medium, and Low severity findings.
- **Risk Distribution Visuals**: Charts illustrating vulnerabilities by OWASP Top 10 category and asset criticality.
- **SLA Breach Warnings**: Automated alerts flagging findings exceeding patching SLAs (24h for Criticals, 72h for Highs).

---

### 🌐 Module 2: Asset Inventory & Discovery (`AssetManagementView.tsx`)
A centralized asset catalog for tracking all organization attack surfaces.

- **Asset Types**: Web Applications, REST/gRPC APIs, Cloud Buckets (AWS S3, GCP), Infrastructure (edge routers, firewalls, Linux servers).
- **Criticality Ratings**: `Critical`, `High`, `Medium`, `Low`.
- **Tech Stack Profiling**: Tracks framework and platform components (e.g., `React`, `Node.js`, `Express`, `PostgreSQL`, `Kong API Gateway`).
- **Scan Triggering**: One-click launcher to send any asset directly to the Scanner Engine.

---

### 🛡️ Module 3: External Attack Surface Management — EASM (`EasmView.tsx`)
Monitors external digital footprints for exposed infrastructure and perimeter weaknesses.

- **Subdomain & Asset Discovery**: Identifies public-facing domains, IP addresses, and open ports.
- **SSL/TLS & Domain Health**: Tracks SSL certificate expiration dates, weak cipher suites, and DNS misconfigurations.
- **Exposed Service Risk Scoring**: Assigns threat scores to open ports and unencrypted services.

---

### ⚡ Module 4: Autonomous Vulnerability Scanner Engine (`ScannerView.tsx` & `scannerEngine.ts`)
A 5-stage automated vulnerability scanning worker running simulated OWASP and API checks.

#### 5-Stage Scanning Workflow:
1. **Reconnaissance & Fingerprinting**: Probes HTTP response headers (`X-Powered-By`, `Server`, `CORS`) to map backend software versions.
2. **Security Header Inspection**: Checks for missing security headers (`HSTS`, `Content-Security-Policy`, `X-Frame-Options`).
3. **OWASP Top 10 Probing**: Checks for SQL Injection, Reflected/Stored XSS, Command Injection, and Broken Access Control.
4. **API Endpoint Fuzzing**: Tests REST and GraphQL endpoints for unauthenticated access and verbose stack traces.
5. **CVSS v3.1 Scoring & Ticket Generation**: Generates structured finding tickets with CVSS vectors, PoC curl commands, and remediation recommendations.

---

### 📋 Module 5: Vulnerability Lifecycle Hub (`VulnerabilityManagementView.tsx`)
A full-featured vulnerability ticket management interface.

- **Ticket States**: `New` ➔ `In Progress` ➔ `Verification Pending` ➔ `Resolved` / `Ignored`.
- **SLA Countdown Trackers**: Displays remaining resolution time based on severity SLA rules.
- **Proof of Concept (PoC)**: Includes sample HTTP request/response payloads and curl reproduction commands.
- **AI Verification Re-scan**: Allows developers to trigger automated patch verification after deploying code fixes.

---

### 🤖 Module 6: Multi-LLM AI Security Analyst (`AIAnalystView.tsx`, `llmProviderService.ts`, `openaiService.ts`)
An AI security assistant capable of connecting to multiple cloud and local LLM providers.

#### Supported LLM Providers:
- **OpenAI**: `gpt-4o-mini`, `gpt-4o`, `gpt-4-turbo`
- **Google Gemini**: `gemini-2.0-flash`, `gemini-1.5-pro`, `gemini-1.5-flash`
- **Anthropic Claude**: `claude-3-5-sonnet-latest`, `claude-3-haiku`
- **Ollama / Local LLM**: Custom local endpoints (e.g. `http://localhost:11434/v1`) for `llama3`, `mistral`, `deepseek-r1`
- **Built-in Offline Engine**: 100% browser-local rule-based analyst engine requiring zero network API calls.

#### Capabilities:
1. **Finding Deep Dive Analyzer**:
   - **Technical Explanation**: In-depth root cause analysis referencing CVSS v3.1 vectors.
   - **Executive Summary**: Business-focused risk translation for C-level executives.
   - **Simulated Attack Scenario**: Step-by-step walkthrough of potential exploitation paths.
   - **Step-by-Step Remediation & Code Patch**: Production-ready code fixes (e.g. parameterized SQL queries, DOMPurify sanitization, HSTS config).
2. **Interactive SOC Chat Assistant**: Conversational security analyst trained on OWASP ASVS, NIST SP 800-53, NVD CVE feeds, and MITRE ATT&CK.
3. **Strict Defensive Guardrails**: Hardcoded security guards (`securityGuards.ts`) strictly forbid generating active exploit scripts or functional attack payloads.

---

### 🔥 Module 7: Vulnerability Intelligence Hub & CISA KEV (`VulnDatabaseView.tsx` & `vulnDbService.ts`)
Threat intelligence repository providing real-time CVE context.

- **Live CISA KEV Feed**: Synchronizes with CISA's Known Exploited Vulnerabilities catalog (`known_exploited_vulnerabilities.json`) with an in-memory & localStorage 12-hour cache.
- **Active Threat Badges**: Highlights vulnerabilities actively exploited by threat actors in the wild (`🔥 EXPLOITED IN THE WILD`).
- **Mandated Remediation Actions**: Displays official CISA required mitigation steps and compliance deadlines.
- **OWASP & CWE Directory**: Comprehensive documentation for the OWASP Top 10 taxonomy and CWE definitions.

---

### 📦 Module 8: Software Bill of Materials — SBOM (`SbomView.tsx`)
Supply chain risk monitoring across software dependencies.

- **Ecosystem Coverage**: `npm`, `PyPI`, `Go`, `Maven`, `Cargo`, `System (dpkg/rpm)`.
- **Known CVE Mapping**: Automatically maps dependencies against known supply-chain vulnerabilities (e.g. `Log4j` CVE-2021-44228, `XZ Utils` CVE-2024-3094).
- **Upgrade Guidance**: Suggests secure patch versions and license compliance details.

---

### 📜 Module 9: Compliance & Audit Matrix (`ComplianceView.tsx`)
Automated mapping of vulnerabilities to international regulatory standards.

#### Supported Regulatory Frameworks:
- **PCI-DSS v4.0** (Requirement 6.3.1 - Secure Software)
- **SOC 2 Type II** (Trust Services Criteria CC6.8 - Threat Management)
- **ISO 27001:2022** (Control A.8.8 - Technical Vulnerability Management)
- **HIPAA Security Rule** (45 CFR § 164.308 - Vulnerability Scanning)
- **NIST SP 800-53 Rev 5** (Control RA-5 - Risk Assessment & Vulnerability Monitoring)

---

### 📄 Module 10: Executive & Technical Report Engine (`ReportGeneratorView.tsx`)
Generates audit-ready security reports.

- **Executive Summary PDF**: Concise business risk overview for board meetings.
- **Technical Audit CSV**: Detailed export of all findings, assets, CVSS scores, and remediation statuses for JIRA/GitHub integration.
- **Compliance Readiness Matrix**: Standard-by-standard audit evidence reports.

---

### 🔑 Module 11: SaaS Administration & Subscriber Management (`AdminConsoleView.tsx` & `saasAuthService.ts`)
The seller admin control panel for platform administration.

- **Subscriber Account Management**: View active customer accounts, company details, and registration dates.
- **Revenue Analytics**: Real-time MRR and total revenue generated via Stripe.
- **Account Status Control**: Activate or suspend customer accounts.
- **Organization Tenant Provisioning**: Super Admin interface to provision organizations and assign customer buyer emails.

---

### 💳 Module 12: Billing, Subscriptions & Stripe Checkout (`BillingView.tsx`, `PricingView.tsx`, `CheckoutView.tsx`)
Complete SaaS monetization workflow.

- **Subscription Tiers**:
  - **Standard Pro**: $499/mo (Up to 10 Assets)
  - **Corporate Security**: $1,499/mo (Up to 50 Assets)
  - **Enterprise MSSP**: $3,999/mo (Unlimited Assets & White-Label Reporting)
- **Billing Cycles**: Monthly and Annual (20% discount).
- **Payment Processing**: Simulated Stripe Checkout integration.

---

## 4. Technical Stack & Architecture Summary

| Component | Technology Used |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Styling System** | Vanilla CSS (CSS Variables, Glassmorphism, Responsive Grid) |
| **Icons & UI** | Lucide React |
| **Database & Auth** | Supabase JS (`@supabase/supabase-js`), LocalStorage fallback |
| **AI Integration** | OpenAI API, Google Gemini API, Anthropic Claude API, Ollama REST API |
| **Threat Intelligence** | CISA Known Exploited Vulnerabilities (KEV) JSON Feed |

---

## 5. Security & Safety Guardrails

VulnWiz AI strictly adheres to defensive cybersecurity principles:
1. **No Autonomous Exploitation**: The AI security analyst is explicitly programmed to produce analysis, remediation instructions, and defense code ONLY. It is forbidden from writing active exploit payloads or attack scripts.
2. **Prompt Injection Prevention**: User prompts pass through input sanitization filters (`securityGuards.ts`) prior to LLM submission.
3. **Data Isolation**: Row-Level Security (RLS) patterns ensure organization tenant data is partitioned and accessible only by authorized user roles.
