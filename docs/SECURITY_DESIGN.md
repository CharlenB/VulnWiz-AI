# VulnWiz AI - Security Design & Controls Specification

## 1. Compliance & Security Standards
VulnWiz AI aligns with:
- **OWASP ASVS 4.0** Level 2 (Application Security Verification Standard)
- **NIST SP 800-53 Rev 5** Security and Privacy Controls
- **ISO/IEC 27001:2022** Information Security Management System
- **SOC 2 Type II** Trust Services Criteria (Security, Confidentiality, Availability)

---

## 2. Cryptographic Controls Matrix

| Data Classification | Transport Protection | Storage Protection | Key Management |
|:---|:---|:---|:---|
| **Passphrases & Secret Tokens** | TLS 1.3 | Argon2id (m=65536, t=3, p=4) | KMS Key Hierarchy |
| **Vulnerability Data** | TLS 1.3 | AES-256-GCM at DB level | AWS KMS / HashiCorp Vault |
| **Scan Reports (PDF/CSV)** | TLS 1.3 | Encrypted S3 Bucket | KMS Envelope Encryption |
| **API Keys** | TLS 1.3 | HMAC-SHA256 hashed | Rotated every 90 days |

---

## 3. Secure Logging & Audit Rules
The audit log service records all actions to a write-once read-many (WORM) audit store.

### Logged Fields
- `timestamp`: ISO-8601 UTC timestamp
- `tenant_id`: UUID of tenant
- `actor_id`: User UUID or API Key ID
- `action`: Action verb (`ASSET_CREATE`, `SCAN_START`, `VULN_STATUS_CHANGE`, `REPORT_DOWNLOAD`)
- `resource_id`: ID of target asset, scan, or finding
- `ip_address`: IPv4/IPv6 client IP
- `user_agent`: Client browser string
- `status`: `SUCCESS` or `DENIED`

### Strictly Prohibited Log Content (Sanitization Guardrail)
- Passwords or MFA secret keys
- API Secrets or Bearer Tokens
- Raw PII (Emails, Names, Phone numbers) in debug stack traces
- Customer database dump contents
