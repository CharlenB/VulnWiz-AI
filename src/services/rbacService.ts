import type { UserRole } from '../types';
import type { NavTab } from '../components/Sidebar';

export interface RolePermissions {
  allowedTabs: NavTab[];
  canAddAsset: boolean;
  canTriggerScan: boolean;
  canUpdateVulnStatus: boolean;
  canRunAiPatchVerification: boolean;
  canManageTenant: boolean;
  canExportReports: boolean;
  roleBadgeColor: string;
  description: string;
}

export const ROLE_PERMISSIONS_MAP: Record<UserRole, RolePermissions> = {
  'Super Admin': {
    allowedTabs: [
      'dashboard', 
      'assets', 
      'easm', 
      'scanner', 
      'vulnerabilities', 
      'ai-analyst', 
      'sbom', 
      'compliance', 
      'database', 
      'reports', 
      'settings'
    ],
    canAddAsset: true,
    canTriggerScan: true,
    canUpdateVulnStatus: true,
    canRunAiPatchVerification: true,
    canManageTenant: true,
    canExportReports: true,
    roleBadgeColor: 'var(--accent-purple)',
    description: 'Full administrative access across multi-tenant configuration, scans, and system logs.',
  },
  'Security Analyst': {
    allowedTabs: [
      'dashboard', 
      'assets', 
      'easm', 
      'scanner', 
      'vulnerabilities', 
      'ai-analyst', 
      'sbom', 
      'compliance', 
      'database', 
      'reports'
    ],
    canAddAsset: true,
    canTriggerScan: true,
    canUpdateVulnStatus: true,
    canRunAiPatchVerification: true,
    canManageTenant: false,
    canExportReports: true,
    roleBadgeColor: 'var(--accent-cyan)',
    description: 'SecOps analyst access to trigger active OWASP scans, use AI Analyst, and prioritize tickets.',
  },
  'Client Admin': {
    allowedTabs: [
      'dashboard', 
      'assets', 
      'easm', 
      'vulnerabilities', 
      'ai-analyst', 
      'sbom', 
      'compliance', 
      'database', 
      'reports', 
      'settings'
    ],
    canAddAsset: true,
    canTriggerScan: false,
    canUpdateVulnStatus: true,
    canRunAiPatchVerification: false,
    canManageTenant: true,
    canExportReports: true,
    roleBadgeColor: 'var(--accent-blue)',
    description: 'Customer admin access to register assets, manage team roles, and track organizational compliance.',
  },
  'Developer': {
    allowedTabs: [
      'dashboard', 
      'assets', 
      'vulnerabilities', 
      'ai-analyst', 
      'sbom', 
      'compliance'
    ],
    canAddAsset: false,
    canTriggerScan: false,
    canUpdateVulnStatus: true,
    canRunAiPatchVerification: true,
    canManageTenant: false,
    canExportReports: false,
    roleBadgeColor: 'var(--accent-amber)',
    description: 'Engineering access focused on resolving assigned tickets, viewing AI code fixes, and verifying patches.',
  },
  'Executive Viewer': {
    allowedTabs: [
      'dashboard', 
      'assets', 
      'vulnerabilities', 
      'compliance', 
      'reports'
    ],
    canAddAsset: false,
    canTriggerScan: false,
    canUpdateVulnStatus: false,
    canRunAiPatchVerification: false,
    canManageTenant: false,
    canExportReports: true,
    roleBadgeColor: 'var(--accent-green)',
    description: 'Read-only executive access focused on high-level risk scores, compliance matrices, and PDF summaries.',
  },
};

export function getRolePermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS_MAP[role] || ROLE_PERMISSIONS_MAP['Security Analyst'];
}

export function isTabAllowedForRole(tab: NavTab, role: UserRole): boolean {
  const perms = getRolePermissions(role);
  return perms.allowedTabs.includes(tab);
}
