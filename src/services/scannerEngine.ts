import type { Asset, ScanJob, ScanType, Vulnerability } from '../types';
import { validateTargetScope } from './securityGuards';

export function createScanJob(asset: Asset, scanType: ScanType, authorizedBy: string, authSignature: string): ScanJob {
  const scopeValidation = validateTargetScope(asset.target);
  const isAllowed = scopeValidation.allowed;

  return {
    id: `scan-${Date.now().toString().slice(-6)}`,
    assetId: asset.id,
    assetName: asset.name,
    assetTarget: asset.target,
    scanType,
    authorizedBy,
    authSignature,
    status: isAllowed ? 'queued' : 'failed',
    startedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    progress: isAllowed ? 0 : 100,
    currentPhase: isAllowed ? 'Initializing Scope Verification & Target Handshake...' : '[SECURITY BLOCKED] SSRF Scope Guard Violation',
    logs: [
      `[${new Date().toLocaleTimeString()}] [INFO] Starting VulnWiz Scanning Engine v4.2`,
      `[${new Date().toLocaleTimeString()}] [SCOPE] Target: ${asset.target} (${asset.type.toUpperCase()})`,
      `[${new Date().toLocaleTimeString()}] [AUTH] Authorized by: ${authorizedBy} | Digital Signature Hash: ${authSignature.slice(0, 16)}...`,
      isAllowed
        ? `[${new Date().toLocaleTimeString()}] [GUARD] Validating scope boundaries against RFC 1918 & target authorization policy... APPROVED.`
        : `[${new Date().toLocaleTimeString()}] [ALERT] ${scopeValidation.reason}`,
    ],
    findingsDiscovered: 0,
  };
}

export function generateScanFindings(asset: Asset, scanType: ScanType): Vulnerability[] {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  if (scanType === 'active_owasp' || asset.type === 'web') {
    return [
      {
        id: `vuln-gen-${Date.now()}-1`,
        cveId: 'N/A',
        cweId: 'CWE-352',
        title: 'Missing Cross-Site Request Forgery (CSRF) Protection on Financial Form',
        severity: 'high',
        cvssScore: 8.1,
        cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N',
        assetId: asset.id,
        assetName: asset.name,
        category: 'owasp',
        owaspCategory: 'A01:2021-Broken Access Control',
        mitreTechnique: 'T1566 - Phishing (CSRF Execution)',
        status: 'new',
        assignedTo: 'AppSec Team',
        discoveredDate: timestamp,
        remediationDeadline: '3 days SLA',
        affectedUrlOrPort: `${asset.target}/api/user/transfer-funds`,
        description: 'POST endpoint accepts state-changing financial transactions without a valid CSRF token or SameSite cookie protection.',
        proofOfConcept: `POST ${asset.target}/api/user/transfer-funds\nHost: ${asset.target}\nCookie: session=xyz123\n\namount=5000&recipient=attacker`,
        technicalRecommendation: 'Enforce Anti-CSRF Tokens (Double Submit Cookie or Synchronizer Token Pattern) and set `Cookie: SameSite=Strict`.',
        executiveSummary: 'Attackers can trick logged-in users into executing unauthorized financial transactions by luring them to a malicious web page.',
        attackScenario: 'Victim visits malicious website while logged into financial portal. Hidden form auto-submits POST request to bank transferring funds without user consent.',
        codeFixSnippet: `// Express CSRF Protection Fix:
import csurf from 'csurf';
const csrfProtection = csurf({ cookie: true });
app.post('/api/user/transfer-funds', csrfProtection, (req, res) => {
  // Transfer logic
});`,
      },
      {
        id: `vuln-gen-${Date.now()}-2`,
        cveId: 'CVE-2024-21626',
        cweId: 'CWE-200',
        title: 'Information Disclosure via Verbose Server Debug Headers',
        severity: 'low',
        cvssScore: 3.7,
        cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N',
        assetId: asset.id,
        assetName: asset.name,
        category: 'owasp',
        owaspCategory: 'A05:2021-Security Misconfiguration',
        mitreTechnique: 'T1592 - Gather Victim Host Information',
        status: 'new',
        assignedTo: 'DevOps',
        discoveredDate: timestamp,
        remediationDeadline: '14 days SLA',
        affectedUrlOrPort: `${asset.target}`,
        description: 'Server returns HTTP response header `X-Powered-By: Express/4.18.2` exposing exact server technology stack.',
        proofOfConcept: `HTTP/1.1 200 OK\nServer: nginx/1.18.0\nX-Powered-By: Express/4.18.2`,
        technicalRecommendation: 'Disable `X-Powered-By` header in application code (`app.disable("x-powered-by")`).',
        executiveSummary: 'Exposing backend software version information helps hackers quickly identify targeted exploits.',
        attackScenario: 'Attacker probes headers, identifies exact Express version, and searches CVE databases for version-specific exploits.',
        codeFixSnippet: `// Node.js Express fix:
app.disable('x-powered-by');`,
      },
    ];
  }

  if (scanType === 'infra_port_ssl' || asset.type === 'infrastructure') {
    return [
      {
        id: `vuln-gen-${Date.now()}-3`,
        cveId: 'CVE-2023-4863',
        cweId: 'CWE-326',
        title: 'Deprecated TLS 1.0 & Weak SSL Cipher Suites Enabled',
        severity: 'medium',
        cvssScore: 5.9,
        cvssVector: 'CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:N/A:N',
        assetId: asset.id,
        assetName: asset.name,
        category: 'infrastructure',
        owaspCategory: 'A02:2021-Cryptographic Failures',
        mitreTechnique: 'T1040 - Network Sniffing',
        status: 'new',
        assignedTo: 'Infra Sec',
        discoveredDate: timestamp,
        remediationDeadline: '7 days SLA',
        affectedUrlOrPort: `${asset.target}:443`,
        description: 'Server handshakes successfully using outdated TLS 1.0 and TLS 1.1 protocols with 3DES/RC4 ciphers.',
        proofOfConcept: `nmap --script ssl-enum-ciphers -p 443 ${asset.target}\nTLSv1.0:\n  ciphers: TLS_RSA_WITH_3DES_EDE_CBC_SHA (SWEET32 Attack risk)`,
        technicalRecommendation: 'Disable TLS 1.0/1.1 in Nginx/Apache configuration. Enforce TLS 1.2 and TLS 1.3 only with ECDHE cipher suites.',
        executiveSummary: 'Encrypted network connections can be intercepted or decrypted by adversaries on public networks.',
        attackScenario: 'Adversary executes Man-in-the-Middle (MITM) downgrade attack, capturing session traffic.',
        codeFixSnippet: `# Nginx SSL Configuration Fix:
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers on;`,
      },
    ];
  }

  // Default API / Cloud finding
  return [
    {
      id: `vuln-gen-${Date.now()}-4`,
      cveId: 'N/A',
      cweId: 'CWE-307',
      title: 'Unrestricted Rate Limiting on API Authentication Endpoint',
      severity: 'high',
      cvssScore: 7.5,
      cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N',
      assetId: asset.id,
      assetName: asset.name,
      category: 'api',
      owaspCategory: 'A07:2021-Identification and Authentication Failures',
      mitreTechnique: 'T1110 - Brute Force',
      status: 'new',
      assignedTo: 'API Team',
      discoveredDate: timestamp,
      remediationDeadline: '5 days SLA',
      affectedUrlOrPort: `${asset.target}/v1/auth/login`,
      description: 'API endpoint accepted over 200 rapid authentication requests per minute without returning HTTP 429 Too Many Requests.',
      proofOfConcept: `Sent 200 POST /v1/auth/login requests in 10 seconds. All responded with HTTP 401 Unauthorized instead of 429 Rate Limit Exceeded.`,
      technicalRecommendation: 'Implement sliding window rate limiting (e.g. Redis express-rate-limit) restricting login attempts to 5 per minute per IP.',
      executiveSummary: 'Lack of rate controls allows malicious bots to perform password brute-force or credential stuffing attacks.',
      attackScenario: 'Automated botnet tests millions of leaked username/password combinations against API login route.',
      codeFixSnippet: `import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per window
  message: { error: 'Too many login attempts. Please try again later.' }
});

app.post('/v1/auth/login', authLimiter, loginHandler);`,
    },
  ];
}
