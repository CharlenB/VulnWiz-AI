import React, { useState } from 'react';
import { Check, Zap, Shield, Crown, ArrowLeft, ArrowRight } from 'lucide-react';
import type { TenantPlan, BillingCycle } from '../../types';

interface PricingViewProps {
  onSelectPlan: (plan: TenantPlan, cycle: BillingCycle) => void;
  onBackToLanding: () => void;
  onSignIn: () => void;
}

export const PricingView: React.FC<PricingViewProps> = ({
  onSelectPlan,
  onBackToLanding,
  onSignIn,
}) => {
  const [cycle, setCycle] = useState<BillingCycle>('annual');

  const plans = [
    {
      id: 'Standard Pro' as TenantPlan,
      name: 'Starter',
      subtitle: 'For small businesses & growing startups.',
      monthlyPrice: 499,
      annualMonthlyPrice: 399,
      icon: <Zap size={24} color="var(--accent-purple)" />,
      badge: 'Popular for SMBs',
      features: [
        'Up to 10 Registered Assets',
        'Passive Posture & Web Scans',
        'Basic OWASP Vulnerability Reports',
        'CVSS Risk Scoring',
        'Standard Email Support',
        '1 Super Admin User',
      ],
    },
    {
      id: 'Corporate Security' as TenantPlan,
      name: 'Professional',
      subtitle: 'For growing technology companies & DevSecOps teams.',
      monthlyPrice: 1499,
      annualMonthlyPrice: 1199,
      icon: <Shield size={24} color="var(--accent-purple)" />,
      badge: 'MOST POPULAR',
      isPopular: true,
      features: [
        'Up to 50 Registered Assets',
        'Advanced Active OWASP & API Scanning',
        'Autonomous AI Security Analyst Engine',
        'Automated AI Code Fix Snippets',
        'External Recon (EASM) Subdomain Monitoring',
        'SBOM Software Package Tracking',
        'Detailed PDF & Executive Summaries',
        '5 Authorized Team Roles (RBAC)',
      ],
    },
    {
      id: 'Enterprise MSSP' as TenantPlan,
      name: 'Enterprise',
      subtitle: 'For larger organizations, MSSPs & security agencies.',
      monthlyPrice: 3999,
      annualMonthlyPrice: 3199,
      icon: <Crown size={24} color="var(--accent-purple)" />,
      badge: 'Unlimited Power',
      features: [
        'UNLIMITED Registered Assets & Scans',
        'Full AI Orchestration & Patch Verification',
        'Dedicated 24/7 Priority SLA Support',
        'White-Label PDF Security Reports',
        'PostgreSQL Row-Level Security (RLS)',
        'Compliance Readiness (SOC 2, PCI, ISO 27001)',
        'Unlimited User Accounts & Custom Roles',
        'Dedicated Technical Account Manager',
      ],
    },
  ];

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', color: '#0F172A', fontFamily: 'var(--font-sans)' }}>
      {/* Top Navbar */}
      <nav style={{
        height: '72px',
        background: '#FFFFFF',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={onBackToLanding}>
          <img src="/vulnwiz_logo_transparent.png" alt="Logo" style={{ height: '42px', mixBlendMode: 'multiply' }} />
          <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>VulnWiz <span style={{ color: 'var(--accent-purple)' }}>AI</span></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button className="btn-secondary" onClick={onSignIn}>Sign In</button>
          <button className="btn-primary" onClick={onBackToLanding}><ArrowLeft size={16} /> Home</button>
        </div>
      </nav>

      {/* Main Pricing Content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="badge badge-purple" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
            Flexible Transparent Pricing
          </span>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, marginTop: '12px', color: '#0F172A' }}>
            Choose the Perfect Security Plan
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Scale your cybersecurity operations with zero hidden fees. Switch or cancel anytime.
          </p>

          {/* Monthly vs Annual Toggle */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FFFFFF',
            padding: '6px',
            borderRadius: '40px',
            border: '1px solid #CBD5E1',
            marginTop: '28px',
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.06)',
          }}>
            <button
              onClick={() => setCycle('monthly')}
              style={{
                padding: '8px 20px',
                borderRadius: '30px',
                border: 'none',
                background: cycle === 'monthly' ? 'var(--accent-purple)' : 'transparent',
                color: cycle === 'monthly' ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setCycle('annual')}
              style={{
                padding: '8px 20px',
                borderRadius: '30px',
                border: 'none',
                background: cycle === 'annual' ? 'var(--accent-purple)' : 'transparent',
                color: cycle === 'annual' ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              Annual Billing <span style={{ background: '#10B981', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem' }}>Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', alignItems: 'stretch' }}>
          {plans.map((p) => {
            const displayPrice = cycle === 'annual' ? p.annualMonthlyPrice : p.monthlyPrice;

            return (
              <div
                key={p.id}
                className="glass-panel"
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: p.isPopular ? '2px solid var(--accent-purple)' : '1px solid #CBD5E1',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  boxShadow: p.isPopular ? '0 15px 45px rgba(124, 58, 237, 0.15)' : 'none',
                }}
              >
                {p.isPopular && (
                  <div style={{
                    position: 'absolute',
                    top: '-14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--accent-purple)',
                    color: '#fff',
                    padding: '4px 16px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                  }}>
                    {p.badge}
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    {p.icon}
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>{p.name}</h3>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', height: '40px', lineHeight: 1.4 }}>{p.subtitle}</p>

                  <div style={{ margin: '24px 0 20px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontSize: '2.8rem', fontWeight: 900, color: '#0F172A' }}>${displayPrice}</span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 600 }}>/ month</span>
                    </div>
                    {cycle === 'annual' && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 600, marginTop: '4px' }}>
                        Billed annually (${displayPrice * 12}/year)
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                    {p.features.map((feat, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: '#0F172A' }}>
                        <Check size={16} color="var(--accent-purple)" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className={p.isPopular ? "btn-primary" : "btn-secondary"}
                  onClick={() => onSelectPlan(p.id, cycle)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    justifyContent: 'center',
                  }}
                >
                  Choose {p.name} <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
