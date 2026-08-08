import type { NvdVulnIntel, VulnSeverity } from '../types';
import { INITIAL_NVD_INTEL } from './storage';

export interface CisaKevItem {
  cveID: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  shortDescription: string;
  requiredAction: string;
  dueDate: string;
  knownRansomwareCampaignUse?: string;
  notes?: string;
}

export interface CisaKevCatalog {
  title: string;
  catalogVersion: string;
  dateReleased: string;
  count: number;
  vulnerabilities: CisaKevItem[];
}

const CISA_KEV_FEED_URL = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
const LOCAL_STORAGE_KEV_KEY = 'vulnwiz_cisa_kev_cache';
const LOCAL_STORAGE_KEV_TIME_KEY = 'vulnwiz_cisa_kev_timestamp';
const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours cache

let cachedCisaKevItems: CisaKevItem[] | null = null;
let isFetchingKev = false;

/**
 * Maps CISA KEV catalog item to VulnWiz NvdVulnIntel schema
 */
function mapCisaKevToIntel(item: CisaKevItem): NvdVulnIntel {
  // Determine severity estimate based on ransomware / KEV status
  const isCritical = item.knownRansomwareCampaignUse === 'Known' || item.vulnerabilityName.toLowerCase().includes('remote code execution');
  const cvssScore = isCritical ? 9.8 : 8.1;
  const severity: VulnSeverity = isCritical ? 'critical' : 'high';

  return {
    cveId: item.cveID,
    title: item.vulnerabilityName || `${item.vendorProject} ${item.product} Vulnerability`,
    severity,
    cvssScore,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    cwe: 'CWE-119 / CWE-20 (Publicly Exploited)',
    owasp: 'A06:2021-Vulnerable and Outdated Components',
    publishedDate: item.dateAdded,
    description: item.shortDescription,
    affectedSoftware: [item.vendorProject ? `${item.vendorProject} ${item.product}` : item.product],
    references: [
      `https://nvd.nist.gov/vuln/detail/${item.cveID}`,
      `https://www.cisa.gov/known-exploited-vulnerabilities-catalog`,
    ],
    mitreTechnique: 'T1190 - Exploit Public-Facing Application',
    isExploitedInWild: true,
    cisaRequiredAction: item.requiredAction,
    cisaDueDate: item.dueDate,
    sourceFeed: 'CISA KEV',
  };
}

/**
 * Fetches the CISA Known Exploited Vulnerabilities catalog
 */
export async function getCisaKevCatalog(): Promise<{ items: CisaKevItem[]; fromCache: boolean; totalCount: number }> {
  if (cachedCisaKevItems && cachedCisaKevItems.length > 0) {
    return { items: cachedCisaKevItems, fromCache: true, totalCount: cachedCisaKevItems.length };
  }

  // Check localStorage cache
  try {
    const cachedData = localStorage.getItem(LOCAL_STORAGE_KEV_KEY);
    const cachedTimestamp = localStorage.getItem(LOCAL_STORAGE_KEV_TIME_KEY);

    if (cachedData && cachedTimestamp) {
      const age = Date.now() - parseInt(cachedTimestamp, 10);
      if (age < CACHE_TTL_MS) {
        cachedCisaKevItems = JSON.parse(cachedData);
        if (cachedCisaKevItems && cachedCisaKevItems.length > 0) {
          return { items: cachedCisaKevItems, fromCache: true, totalCount: cachedCisaKevItems.length };
        }
      }
    }
  } catch (err) {
    console.warn('VulnWiz Threat Intel: LocalStorage read failed', err);
  }

  // Fetch live CISA KEV feed
  if (isFetchingKev) {
    // Wait briefly if fetch is already in flight
    await new Promise(r => setTimeout(r, 800));
    if (cachedCisaKevItems) {
      return { items: cachedCisaKevItems, fromCache: true, totalCount: cachedCisaKevItems.length };
    }
  }

  isFetchingKev = true;
  try {
    const response = await fetch(CISA_KEV_FEED_URL);
    if (!response.ok) {
      throw new Error(`CISA API returned HTTP ${response.status}`);
    }

    const catalog: CisaKevCatalog = await response.json();
    if (catalog && Array.isArray(catalog.vulnerabilities)) {
      cachedCisaKevItems = catalog.vulnerabilities;

      // Save to localStorage
      try {
        localStorage.setItem(LOCAL_STORAGE_KEV_KEY, JSON.stringify(catalog.vulnerabilities));
        localStorage.setItem(LOCAL_STORAGE_KEV_TIME_KEY, Date.now().toString());
      } catch (e) {
        console.warn('VulnWiz Threat Intel: Storage save warning', e);
      }

      isFetchingKev = false;
      return { items: cachedCisaKevItems, fromCache: false, totalCount: catalog.vulnerabilities.length };
    }
  } catch (err) {
    console.error('VulnWiz Threat Intel: Failed to fetch CISA KEV feed', err);
    isFetchingKev = false;
  }

  // Fallback if network or CORS fails
  return { items: [], fromCache: true, totalCount: 0 };
}

/**
 * Searches vulnerability intelligence across live CISA KEV, external APIs, and local feeds
 */
export async function searchVulnerabilityIntelLive(
  query: string,
  kevOnly = false
): Promise<{ results: NvdVulnIntel[]; source: string; totalKevCount: number }> {
  const { items: kevItems, totalCount: totalKevCount } = await getCisaKevCatalog();

  const formattedKevIntel = kevItems.map(mapCisaKevToIntel);

  // Combine with initial local dataset, deduplicating by CVE ID
  const localIntelWithFeed = INITIAL_NVD_INTEL.map(item => ({
    ...item,
    sourceFeed: item.sourceFeed || ('Local Feed' as const),
    isExploitedInWild: item.isExploitedInWild ?? false,
  }));

  const allMap = new Map<string, NvdVulnIntel>();

  // Add local intel first
  localIntelWithFeed.forEach(item => allMap.set(item.cveId.toUpperCase(), item));

  // Overlay CISA KEV entries (which take precedence for exploitation status)
  formattedKevIntel.forEach(item => {
    const existing = allMap.get(item.cveId.toUpperCase());
    if (existing) {
      allMap.set(item.cveId.toUpperCase(), {
        ...existing,
        isExploitedInWild: true,
        cisaRequiredAction: item.cisaRequiredAction,
        cisaDueDate: item.cisaDueDate,
        sourceFeed: 'CISA KEV',
      });
    } else {
      allMap.set(item.cveId.toUpperCase(), item);
    }
  });

  let combinedList = Array.from(allMap.values());

  if (kevOnly) {
    combinedList = combinedList.filter(item => item.isExploitedInWild);
  }

  if (!query || query.trim() === '') {
    return {
      results: combinedList.slice(0, 30), // Limit initial payload display
      source: kevItems.length > 0 ? 'Live CISA KEV Database' : 'Local Security Feed',
      totalKevCount: totalKevCount || formattedKevIntel.length,
    };
  }

  const q = query.toLowerCase().trim();
  const filtered = combinedList.filter(
    item =>
      item.cveId.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.cwe.toLowerCase().includes(q) ||
      item.owasp.toLowerCase().includes(q) ||
      item.mitreTechnique.toLowerCase().includes(q) ||
      item.affectedSoftware.some(s => s.toLowerCase().includes(q))
  );

  return {
    results: filtered.slice(0, 50),
    source: kevItems.length > 0 ? 'Live CISA KEV & NVD Database' : 'Local Security Feed',
    totalKevCount: totalKevCount || formattedKevIntel.length,
  };
}

/**
 * Synchronous legacy search fallback
 */
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

