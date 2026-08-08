import type { Tenant } from '../types';

const TENANTS_STORAGE_KEY = 'vulnwiz_tenants_v1';

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant-acme-corp-01',
    name: 'Acme Financial Security Inc.',
    domain: 'acmefinancial.com',
    industry: 'FinTech & Banking Services',
    plan: 'Enterprise MSSP',
    securityScore: 82,
    previousScore: 76,
    assetsCount: 14,
    totalVulns: 28,
    openCriticals: 3,
    ownerEmail: 'charlen@acmefinancial.com',
    associatedEmails: ['charlen@acmefinancial.com', 'admin@acmefinancial.com'],
  },
  {
    id: 'tenant-lau-ai-02',
    name: 'LAU.AI Financial Technologies',
    domain: 'lau.ai',
    industry: 'AI & Financial Intelligence',
    plan: 'Corporate Security',
    securityScore: 91,
    previousScore: 85,
    assetsCount: 8,
    totalVulns: 12,
    openCriticals: 1,
    ownerEmail: 'sarah@lau.ai',
    associatedEmails: ['sarah@lau.ai'],
  },
];

/**
 * Retrieves all stored tenants or initializes with seed data
 */
export function getTenants(): Tenant[] {
  try {
    const raw = localStorage.getItem(TENANTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(INITIAL_TENANTS));
      return INITIAL_TENANTS;
    }
    const parsed: Tenant[] = JSON.parse(raw);
    return parsed.length > 0 ? parsed : INITIAL_TENANTS;
  } catch {
    return INITIAL_TENANTS;
  }
}

/**
 * Saves tenant array to localStorage
 */
export function saveTenants(tenants: Tenant[]): void {
  try {
    localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(tenants));
  } catch (err) {
    console.warn('Failed to save tenants to storage:', err);
  }
}

/**
 * Super Admin Exclusive: Adds a new organization tenant provisioned for a buyer email
 */
export function addTenantBySuperAdmin(newTenant: Tenant): Tenant[] {
  const current = getTenants();
  const updated = [newTenant, ...current];
  saveTenants(updated);
  return updated;
}

/**
 * Filters organizations for the logged-in user:
 * - Super Admin (Seller): Sees ALL organizations.
 * - Customer Buyer: Sees ONLY organizations assigned to their email address.
 */
export function getTenantsForUser(userEmail?: string, isSuperAdmin = false): Tenant[] {
  const allTenants = getTenants();

  if (isSuperAdmin || !userEmail) {
    return allTenants;
  }

  const emailLower = userEmail.toLowerCase().trim();

  return allTenants.filter(t => {
    const ownerMatches = t.ownerEmail && t.ownerEmail.toLowerCase().trim() === emailLower;
    const assocMatches = t.associatedEmails && t.associatedEmails.some(e => e.toLowerCase().trim() === emailLower);
    return ownerMatches || assocMatches;
  });
}
