import type { AuditLog } from '../types';

/**
 * VulnWiz AI Core Security Guards & Threat Vector Mitigations
 * Aligns with OWASP ASVS 4.0 Level 2, NIST SP 800-53, and OWASP API Top 10
 */

// ============================================================================
// MITIGATION 1: SSRF & Internal Network Probing Guard (TargetScopeGuard)
// ============================================================================
const PROHIBITED_PATTERNS = [
  /^127\./,                            // Loopback 127.0.0.0/8
  /^10\./,                             // RFC 1918 Private 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,    // RFC 1918 Private 172.16.0.0/12
  /^192\.168\./,                       // RFC 1918 Private 192.168.0.0/16
  /^169\.254\./,                       // Link-Local / AWS Metadata IMDS
  /^0\./,                              // 0.0.0.0/8
  /^::1$/,                             // IPv6 Loopback
  /^fe80:/i,                           // IPv6 Link-Local
];

export interface ScopeValidationResult {
  allowed: boolean;
  reason?: string;
}

export function validateTargetScope(targetInput: string): ScopeValidationResult {
  if (!targetInput || targetInput.trim() === '') {
    return { allowed: false, reason: 'Target endpoint cannot be empty.' };
  }

  let host = targetInput.trim();
  if (host.startsWith('http://') || host.startsWith('https://')) {
    try {
      const url = new URL(host);
      host = url.hostname;
    } catch (e) {
      return { allowed: false, reason: 'Malformed URL format.' };
    }
  }

  // Remove port if present (e.g. 192.168.1.1:8080)
  if (host.includes(':') && !host.startsWith('[')) {
    host = host.split(':')[0];
  }

  // Check prohibited IP ranges
  for (const pattern of PROHIBITED_PATTERNS) {
    if (pattern.test(host)) {
      return {
        allowed: false,
        reason: `[SSRF BLOCKED] Target host "${host}" resolves to a restricted internal/private IP space. Scan execution denied per Security Rule 1.`,
      };
    }
  }

  // Check prohibited hostnames
  const lowerHost = host.toLowerCase();
  if (
    lowerHost === 'localhost' ||
    lowerHost.endsWith('.internal') ||
    lowerHost.endsWith('.local') ||
    lowerHost.endsWith('.lan') ||
    lowerHost.includes('169.254.169.254')
  ) {
    return {
      allowed: false,
      reason: `[SSRF BLOCKED] Hostname "${host}" is an internal resource. Security guardrails prohibit out-of-scope internal probing.`,
    };
  }

  return { allowed: true };
}

// ============================================================================
// MITIGATION 2: Multi-Tenant Data Access Guard (BOLA / Privilege Escalation)
// ============================================================================
export function validateTenantAccess(tenantId: string, resourceTenantId: string): boolean {
  if (!tenantId || !resourceTenantId) return false;
  return tenantId === resourceTenantId;
}

// ============================================================================
// MITIGATION 3: AI Prompt Sanitization & Redaction Pipeline
// ============================================================================
export function sanitizeAiPrompt(rawText: string): string {
  if (!rawText) return '';

  let sanitized = rawText;

  // 1. Redact IPv4 Addresses
  sanitized = sanitized.replace(
    /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    '[REDACTED_IP]'
  );

  // 2. Redact Bearer Tokens & Passwords
  sanitized = sanitized.replace(/Bearer\s+[A-Za-z0-9\-\._~\+\/]+=*/g, 'Bearer [REDACTED_JWT_TOKEN]');
  sanitized = sanitized.replace(/(password|passwd|pwd|secret|api_key|access_token)\s*=\s*['"]?[^\s'"]+['"]?/gi, '$1=[REDACTED_SECRET]');

  // 3. Redact Email Addresses
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');

  return sanitized;
}

// ============================================================================
// Security Audit Logger Helper
// ============================================================================
export function createSecurityAuditLog(
  user: string,
  role: any,
  action: string,
  details: string,
  ip: string,
  status: 'SUCCESS' | 'DENIED'
): AuditLog {
  return {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    user,
    role,
    action,
    details: sanitizeAiPrompt(details),
    ip,
    status,
  };
}
