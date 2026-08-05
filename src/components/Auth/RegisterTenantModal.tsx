import React, { useState } from 'react';
import { Building, X, Sparkles, CheckCircle2 } from 'lucide-react';
import type { Tenant, TenantPlan, Asset, Vulnerability } from '../../types';

interface RegisterTenantModalProps {
  onClose: () => void;
  onTenantRegistered: (newTenant: Tenant, initialAssets: Asset[], initialVulns: Vulnerability[]) => void;
  initialOrgName?: string;
  initialEmail?: string;
  initialPlan?: TenantPlan;
  initialIndustry?: string;
  isFirstTimeOnboarding?: boolean;
}

export const RegisterTenantModal: React.FC<RegisterTenantModalProps> = ({
  onClose,
  onTenantRegistered,
  initialOrgName = '',
  initialEmail = '',
  initialPlan = 'Enterprise MSSP',
  initialIndustry = 'FinTech & Banking Services',
  isFirstTimeOnboarding = false,
}) => {
  const [orgName, setOrgName] = useState(initialOrgName);
  const [domain, setDomain] = useState(initialOrgName ? initialOrgName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com' : '');
  const [industry, setIndustry] = useState(initialIndustry);
  const [adminEmail, setAdminEmail] = useState(initialEmail);
  const [plan, setPlan] = useState<TenantPlan>(initialPlan);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionStep, setProvisionStep] = useState('');

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !domain || !adminEmail) return;

    setIsProvisioning(true);
    setProvisionStep('Initializing Row-Level Security (RLS) Tenant Vault...');

    setTimeout(() => {
      setProvisionStep('Generating Cryptographic KMS Keys & Database Namespace...');
    }, 600);

    setTimeout(() => {
      setProvisionStep('Provisioning Continuous Vulnerability Scanner Workers...');
    }, 1200);

    setTimeout(() => {
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
      const newTenantId = `tenant-${cleanDomain.replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

      const newTenant: Tenant = {
        id: newTenantId,
        name: orgName,
        domain: cleanDomain,
        industry,
        plan,
        securityScore: 88,
        previousScore: 82,
        assetsCount: 2,
        totalVulns: 2,
        openCriticals: 1,
      };

      const seedAssets: Asset[] = [
        {
          id: `ast-${cleanDomain}-01`,
          name: `${orgName} Main Application`,
          target: `https://${cleanDomain}`,
          type: 'web',
          owner: `SecOps / ${adminEmail}`,
          techStack: ['React', 'Node.js', 'PostgreSQL', 'TLS 1.3'],
          criticality: 'critical',
          lastScanDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
          vulnerabilityCounts: { critical: 1, high: 0, medium: 1, low: 0 },
          status: 'active',
        },
        {
          id: `ast-${cleanDomain}-02`,
          name: `${orgName} Core API Gateway`,
          target: `https://api.${cleanDomain}/v1`,
          type: 'api',
          owner: `DevOps / ${adminEmail}`,
          techStack: ['Go', 'Kong API Gateway', 'Redis'],
          criticality: 'high',
          lastScanDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
          vulnerabilityCounts: { critical: 0, high: 0, medium: 0, low: 0 },
          status: 'active',
        },
      ];

      const seedVulns: Vulnerability[] = [
        {
          id: `vuln-${cleanDomain}-01`,
          cveId: 'CVE-2024-21626',
          cweId: 'CWE-200',
          title: 'Information Disclosure via Verbose Debug Headers',
          severity: 'medium',
          cvssScore: 5.3,
          cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N',
          assetId: seedAssets[0].id,
          assetName: seedAssets[0].name,
          category: 'owasp',
          owaspCategory: 'A05:2021-Security Misconfiguration',
          mitreTechnique: 'T1592 - Gather Host Info',
          status: 'new',
          assignedTo: adminEmail,
          discoveredDate: new Date().toISOString().replace('T', ' ').slice(0, 10),
          remediationDeadline: '7 days SLA',
          affectedUrlOrPort: `https://${cleanDomain}`,
          description: `Server returns HTTP header exposing exact version stack on ${cleanDomain}.`,
          proofOfConcept: `GET / HTTP/1.1\nHost: ${cleanDomain}\n\nResponse:\nX-Powered-By: Express/4.18.2`,
          technicalRecommendation: 'Disable `X-Powered-By` in Express application configuration.',
          executiveSummary: 'Server version disclosures allow attackers to quickly look up targeted exploits.',
          attackScenario: 'Attacker probes HTTP response headers, identifies Express version, and searches for unpatched CVEs.',
          codeFixSnippet: `app.disable('x-powered-by');`,
        },
      ];

      setIsProvisioning(false);
      onTenantRegistered(newTenant, seedAssets, seedVulns);
    }, 1800);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }}>
      <div className="glass-panel" style={{ width: '560px', maxWidth: '100%', padding: '28px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building size={20} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {isFirstTimeOnboarding ? 'Welcome! Set Up Your Organization Tenant' : 'Register New Organization Tenant'}
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {isFirstTimeOnboarding ? 'Configure your company details to activate your security workspace' : 'Self-Service Model A Tenant Onboarding & Provisioning'}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {isProvisioning ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div className="pulse-active" style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={30} color="var(--accent-purple)" />
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>Provisioning {orgName}...</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)' }}>{provisionStep}</div>
          </div>
        ) : (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                  Organization Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LAU.AI Financial Technologies"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid var(--border-color)', color: 'var(--text-main)', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                  Corporate Domain *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. lau.ai"
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid var(--border-color)', color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                  Super Admin Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. charlen@lau.ai"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid var(--border-color)', color: 'var(--text-main)', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                  Industry Vertical
                </label>
                <select
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid var(--border-color)', color: 'var(--text-main)', outline: 'none', fontSize: '0.85rem' }}
                >
                  <option value="FinTech & Banking Services">FinTech & Banking Services</option>
                  <option value="AI & Financial Intelligence">AI & Financial Intelligence</option>
                  <option value="Healthcare & Technology">Healthcare & Technology</option>
                  <option value="E-Commerce & Supply Chain">E-Commerce & Supply Chain</option>
                  <option value="Government & Defense">Government & Defense</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                Subscription Tier Plan *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { id: 'Standard Pro', price: '$499/mo', desc: 'Up to 10 Assets' },
                  { id: 'Corporate Security', price: '$1,499/mo', desc: 'Up to 50 Assets' },
                  { id: 'Enterprise MSSP', price: '$3,999/mo', desc: 'Unlimited & White Label' },
                ].map(p => (
                  <div
                    key={p.id}
                    onClick={() => setPlan(p.id as TenantPlan)}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: plan === p.id ? '2px solid var(--accent-purple)' : '1px solid var(--border-color)',
                      background: plan === p.id ? '#EDE9FE' : '#F8FAFC',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: plan === p.id ? 'var(--accent-purple)' : 'var(--text-main)' }}>{p.id}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', fontWeight: 800 }}>{p.price}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <CheckCircle2 size={16} /> Provision Tenant & Launch
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
