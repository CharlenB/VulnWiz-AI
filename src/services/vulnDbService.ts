import type { NvdVulnIntel } from '../types';
import { INITIAL_NVD_INTEL } from './storage';

export function searchVulnerabilityIntel(query: string): NvdVulnIntel[] {
  if (!query || query.trim() === '') return INITIAL_NVD_INTEL;
  const q = query.toLowerCase().trim();
  return INITIAL_NVD_INTEL.filter(
    item =>
      item.cveId.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.cwe.toLowerCase().includes(q) ||
      item.owasp.toLowerCase().includes(q) ||
      item.mitreTechnique.toLowerCase().includes(q)
  );
}

export const OWASP_TOP_10_DESCRIPTIONS: Record<string, { title: string; description: string; mitigation: string }> = {
  'A01:2021-Broken Access Control': {
    title: 'Broken Access Control',
    description: 'Restrictions on what authenticated users are allowed to do are often not properly enforced, allowing attackers to access unauthorized data or functionality.',
    mitigation: 'Enforce RBAC/ABAC on server-side APIs; deny access by default; disable web server directory listing.',
  },
  'A02:2021-Cryptographic Failures': {
    title: 'Cryptographic Failures',
    description: 'Failures related to cryptography (or lack thereof) leading to exposure of sensitive data such as passwords, credit cards, or session keys in transit or at rest.',
    mitigation: 'Encrypt all data in transit with TLS 1.3; hash passwords with Argon2id; disable legacy SSL/TLS ciphers.',
  },
  'A03:2021-Injection': {
    title: 'Injection (SQL, NoSQL, XSS, Command)',
    description: 'User-supplied data is not sanitized or parameterized by the application, resulting in execution of unauthorized commands or queries.',
    mitigation: 'Use parameterized ORM queries; escape and sanitize dynamic HTML output with DOMPurify; validate input against whitelist regex.',
  },
  'A04:2021-Insecure Design': {
    title: 'Insecure Design',
    description: 'Risks related to design and architectural flaws, requiring threat modeling, secure design patterns, and reference architectures.',
    mitigation: 'Perform STRIDE threat modeling early in design; establish secure design patterns; enforce rate limiting on critical workflows.',
  },
  'A05:2021-Security Misconfiguration': {
    title: 'Security Misconfiguration',
    description: 'Unnecessary features enabled, default accounts active, missing security headers, or overly permissive cloud bucket permissions.',
    mitigation: 'Harden server configurations; remove default credentials; configure HSTS, CSP, and S3 public access blocks.',
  },
  'A06:2021-Vulnerable and Outdated Components': {
    title: 'Vulnerable and Outdated Components',
    description: 'Using libraries, frameworks, or dependencies with known publicly disclosed vulnerabilities (CVEs).',
    mitigation: 'Maintain Software Bill of Materials (SBOM); run automated dependency scans in CI/CD pipeline; apply security patches promptly.',
  },
  'A07:2021-Identification and Authentication Failures': {
    title: 'Identification and Authentication Failures',
    description: 'Weak password requirements, lack of multi-factor authentication, or flawed session management permitting credential stuffing.',
    mitigation: 'Mandate MFA; enforce NIST password guidelines; rate-limit authentication endpoints; rotate session tokens.',
  },
};
