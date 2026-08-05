import type { Vulnerability, Asset } from '../types';
import { sanitizeAiPrompt } from './securityGuards';

export interface AiAnalysisResult {
  technicalExplanation: string;
  executiveSummary: string;
  attackScenario: string;
  riskPrioritizationReason: string;
  stepByStepRemediation: string[];
  codeFix: string;
  complianceImpact: string[];
}

export function generateAiAnalysis(vuln: Vulnerability, asset?: Asset): AiAnalysisResult {
  const assetName = asset ? asset.name : vuln.assetName;
  const techStackStr = asset && asset.techStack ? asset.techStack.join(', ') : 'Web Application Stack';

  return {
    technicalExplanation: sanitizeAiPrompt(`The vulnerability "${vuln.title}" affecting ${vuln.affectedUrlOrPort} is classified under ${vuln.owaspCategory || 'OWASP Top 10'}. Under CVSS v3.1 scoring, it carries a rating of ${vuln.cvssScore}/10 (${vuln.severity.toUpperCase()}). The vector string (${vuln.cvssVector}) indicates an attack requiring low complexity that can be exploited remotely over the network. In the context of ${assetName} (Tech Stack: ${techStackStr}), this finding threatens confidentiality, integrity, and availability.`),
    
    executiveSummary: sanitizeAiPrompt(`VulnWiz AI Risk Insight: ${vuln.executiveSummary} Left unaddressed, this vulnerability presents an immediate business risk to our financial data compliance (PCI-DSS / SOC 2 / GDPR) and could result in unauthorized data exposure or service disruption.`),

    attackScenario: sanitizeAiPrompt(`Step 1 (Reconnaissance): Attacker probes target ${vuln.affectedUrlOrPort} and identifies ${vuln.title}.\nStep 2 (Exploitation): ${vuln.attackScenario}\nStep 3 (Impact): Attacker achieves unauthorized access, data extraction, or persistent backdoor presence.`),

    riskPrioritizationReason: `Assigned ${vuln.severity.toUpperCase()} Priority due to CVSS Score ${vuln.cvssScore}, asset criticality (${asset?.criticality.toUpperCase() || 'HIGH'}), and presence of active exploit patterns in public threat intelligence databases.`,

    stepByStepRemediation: [
      `1. Isolate target service or apply temporary WAF/API Gateway rate limiting rule.`,
      `2. Update application source code or configuration according to the provided secure snippet.`,
      `3. Conduct a targeted verification re-scan using VulnWiz Scanner Engine.`,
      `4. Verify patch deployment in staging environment prior to production release.`,
      `5. Close vulnerability ticket and attach digital verification evidence.`,
    ],

    codeFix: vuln.codeFixSnippet || `// Generic Secure Implementation\n// Ensure all inputs are validated and sanitized using parameterized queries and strict input schema validation.`,

    complianceImpact: [
      'PCI-DSS v4.0 Requirement 6.3.1 - Software Development Security',
      'SOC 2 Type II Security Criteria CC6.8 - Threat & Vulnerability Prevention',
      'ISO 27001:2022 Control A.8.8 - Management of Technical Vulnerabilities',
      'NIST SP 800-53 Rev 5 RA-5 - Vulnerability Monitoring and Scanning',
    ],
  };
}

export function generateAiChatResponse(userQuery: string, currentVulns: Vulnerability[]): string {
  const sanitizedQuery = sanitizeAiPrompt(userQuery);
  const queryLower = sanitizedQuery.toLowerCase();

  if (queryLower.includes('critical') || queryLower.includes('priority') || queryLower.includes('fix first')) {
    const criticals = currentVulns.filter(v => v.severity === 'critical');
    if (criticals.length === 0) {
      return `Good news! There are currently 0 critical vulnerabilities. However, you should address the remaining high-severity issues promptly.`;
    }
    return `🤖 **VulnWiz AI Priority Recommendation**:\nYou currently have **${criticals.length} Critical Findings** that require immediate remediation (24h SLA):\n\n` +
      criticals.map((v, i) => `${i + 1}. **${v.title}** (${v.cveId || 'OWASP'}) on \`${v.affectedUrlOrPort}\` - CVSS: ${v.cvssScore}`).join('\n\n') +
      `\n\nI recommend addressing **${criticals[0].title}** first because it directly exposes backend infrastructure to remote execution attacks.`;
  }

  if (queryLower.includes('report') || queryLower.includes('executive') || queryLower.includes('pdf')) {
    return `📊 You can generate an **Executive Summary PDF** or **Technical CSV Report** by navigating to the **Reports Engine** tab on the left menu. Executive summaries translate technical CVSS metrics into clear business risks for C-level leadership.`;
  }

  if (queryLower.includes('cve-2024-3094') || queryLower.includes('xz') || queryLower.includes('backdoor')) {
    return `⚠️ **CVE-2024-3094 Intelligence Alert**:\nThis is a critical supply-chain backdoor discovered in xz-utils / liblzma (5.6.0 & 5.6.1). It hooks into the SSH daemon authentication routines to allow unauthenticated remote command execution.\n\n**Action Plan**:\n1. Downgrade ` + "`xz-utils`" + ` to 5.4.x or upgrade to clean 5.6.2+.\n2. Restart ` + "`sshd`" + ` service immediately.\n3. Verify with: ` + "`xz --version`" + `.`;
  }

  return `🤖 **VulnWiz AI Security Assistant**: I have analyzed your query "${userQuery}". Based on your current enterprise security posture (Score: 82/100), your primary focus should be resolving open Critical and High findings on your Web and API assets. Is there a specific CVE, OWASP finding, or remediation snippet you would like me to review?`;
}
