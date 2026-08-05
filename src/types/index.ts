export type AssetType = 'web' | 'infrastructure' | 'api' | 'cloud';
export type CriticalityLevel = 'critical' | 'high' | 'medium' | 'low';
export type VulnSeverity = 'critical' | 'high' | 'medium' | 'low';
export type VulnStatus = 'new' | 'confirmed' | 'assigned' | 'in_progress' | 'fixed' | 'verified' | 'closed';
export type ScanType = 'passive_posture' | 'active_owasp' | 'infra_port_ssl' | 'api_security' | 'cloud_iam';
export type UserRole = 'Super Admin' | 'Security Analyst' | 'Client Admin' | 'Developer' | 'Executive Viewer';

export interface Asset {
  id: string;
  name: string;
  target: string;
  type: AssetType;
  owner: string;
  techStack: string[];
  criticality: CriticalityLevel;
  lastScanDate: string;
  vulnerabilityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  status: 'active' | 'scanning' | 'decommissioned';
}

export interface Vulnerability {
  id: string;
  cveId?: string;
  cweId?: string;
  title: string;
  severity: VulnSeverity;
  cvssScore: number;
  cvssVector: string;
  assetId: string;
  assetName: string;
  category: 'owasp' | 'infrastructure' | 'api' | 'cloud' | 'crypto';
  owaspCategory?: string;
  mitreTechnique?: string;
  status: VulnStatus;
  assignedTo: string;
  discoveredDate: string;
  remediationDeadline: string;
  description: string;
  proofOfConcept: string;
  affectedUrlOrPort: string;
  technicalRecommendation: string;
  executiveSummary: string;
  attackScenario: string;
  codeFixSnippet: string;
  remediationEvidence?: string;
  verificationStatus?: 'UNVERIFIED' | 'VERIFICATION_PASSED' | 'VERIFICATION_FAILED';
  lastVerificationDate?: string;
}

export interface ScanJob {
  id: string;
  assetId: string;
  assetName: string;
  assetTarget: string;
  scanType: ScanType;
  authorizedBy: string;
  authSignature: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  progress: number;
  currentPhase: string;
  logs: string[];
  findingsDiscovered: number;
}

export type TenantPlan = 'Enterprise MSSP' | 'Corporate Security' | 'Standard Pro';

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  industry: string;
  plan: TenantPlan;
  securityScore: number;
  previousScore: number;
  assetsCount: number;
  totalVulns: number;
  openCriticals: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  details: string;
  ip: string;
  status: 'SUCCESS' | 'DENIED';
}

export interface NvdVulnIntel {
  cveId: string;
  title: string;
  severity: VulnSeverity;
  cvssScore: number;
  cvssVector: string;
  cwe: string;
  owasp: string;
  publishedDate: string;
  description: string;
  affectedSoftware: string[];
  references: string[];
  mitreTechnique: string;
}

export interface SbomPackage {
  id: string;
  name: string;
  version: string;
  fixedVersion?: string;
  ecosystem: 'npm' | 'PyPI' | 'Go' | 'Maven' | 'Cargo' | 'System (dpkg/rpm)';
  license: string;
  assetName: string;
  cveId?: string;
  severity: VulnSeverity | 'none';
  status: 'vulnerable' | 'secure' | 'patch_available';
}

export interface ComplianceRequirement {
  id: string;
  standard: 'PCI-DSS v4.0' | 'SOC 2 Type II' | 'ISO 27001:2022' | 'HIPAA Security Rule' | 'NIST SP 800-53';
  controlId: string;
  controlTitle: string;
  description: string;
  status: 'PASSED' | 'FAILED' | 'REQUIRES_ATTENTION';
  relatedVulnCount: number;
}

export interface DiscoveredSubdomain {
  id: string;
  subdomain: string;
  ipAddress: string;
  source: 'Certificate Transparency' | 'DNS Passive Recon' | 'WHOIS Records' | 'Web Crawler';
  httpStatus: number;
  tlsIssuer: string;
  isMonitored: boolean;
  discoveredDate: string;
}

export type AccountStatus = 'PENDING_PAYMENT' | 'ACTIVE' | 'SUSPENDED' | 'CANCELED';
export type BillingCycle = 'monthly' | 'annual';

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  companyName: string;
  role: UserRole;
  phone?: string;
  industry?: string;
  companySize?: string;
  status: AccountStatus;
  createdAt: string;
  selectedPlan: TenantPlan;
  billingCycle: BillingCycle;
  stripeCustomerId?: string;
  passwordHash?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: TenantPlan;
  billingCycle: BillingCycle;
  amount: number;
  status: 'active' | 'past_due' | 'canceled' | 'trailing';
  startDate: string;
  renewalDate: string;
  paymentProvider: 'Stripe';
  cancelAtPeriodEnd: boolean;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  userEmail: string;
  companyName: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'processing';
  paymentProvider: 'Stripe' | 'PayPal' | 'Paddle';
  paymentMethod: string;
  createdAt: string;
  plan: TenantPlan;
}
