import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Radar, 
  Bot, 
  Globe, 
  Layers, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  Sparkles
} from 'lucide-react';

interface LandingViewProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onSelectPlan?: (planName: string, cycle: 'monthly' | 'annual') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onGetStarted,
  onSignIn,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const features = [
    {
      icon: <Radar size={28} color="var(--accent-purple)" />,
      title: 'Active OWASP & Port Vulnerability Scanner',
      description: 'Automated continuous network, web, API, and cloud infrastructure scanning with zero false-positive tuning.',
    },
    {
      icon: <Bot size={28} color="var(--accent-cyan)" />,
      title: 'Autonomous AI Security Analyst',
      description: 'Instant CVSS v3.1 risk calculation, threat prioritization, and automated code-level remediation patches.',
    },
    {
      icon: <Globe size={28} color="var(--accent-blue)" />,
      title: 'External Attack Surface Recon (EASM)',
      description: 'Passive Certificate Transparency log monitoring, subdomain discovery, and shadow IT exposure tracking.',
    },
    {
      icon: <Layers size={28} color="var(--accent-amber)" />,
      title: 'SBOM & Supply Chain Intelligence',
      description: 'Automated Software Bill of Materials tracking across npm, PyPI, Go, and Maven software dependencies.',
    },
    {
      icon: <Award size={28} color="var(--accent-green)" />,
      title: 'Compliance Readiness Scorecard',
      description: 'Real-time compliance tracking for PCI-DSS v4.0, SOC 2 Type II, ISO 27001:2022, and HIPAA frameworks.',
    },
    {
      icon: <ShieldCheck size={28} color="var(--accent-red)" />,
      title: 'Multi-Tenant Row-Level Security (RLS)',
      description: 'PostgreSQL database-level cryptographic isolation ensuring complete privacy for client data.',
    },
  ];

  const testimonials = [
    {
      quote: "VulnWiz AI replaced three separate security tools and reduced our mean-time-to-remediate (MTTR) by 74% within the first month.",
      author: "Sarah Jenkins",
      role: "Chief Information Security Officer (CISO)",
      company: "Acme Financial Security Inc.",
      avatar: "SJ",
    },
    {
      quote: "The AI Code Remediation feature allows our engineering team to ship patches directly to production without waiting on AppSec manual reviews.",
      author: "Marcus Vance",
      role: "VP of Engineering",
      company: "LAU.AI Financial Technologies",
      avatar: "MV",
    },
    {
      quote: "As an MSSP, the multi-tenant architecture and executive PDF report generator give us a competitive edge with enterprise clients.",
      author: "Elena Rostova",
      role: "Lead Cybersecurity Consultant",
      company: "CyberShield Systems",
      avatar: "ER",
    },
  ];

  const faqs = [
    {
      q: "How does the VulnWiz AI scanner handle SSRF and internal infrastructure scope?",
      a: "VulnWiz AI features built-in TargetScopeGuard technology that automatically rejects loopback addresses (127.0.0.1), RFC 1918 private IPs, AWS IMDS metadata endpoints (169.254.169.254), and unauthorized internal domains to guarantee safe, legal scanning.",
    },
    {
      q: "What payment methods are supported for subscription billing?",
      a: "We support all major credit cards (Visa, Mastercard, American Express) processed securely via Stripe. Enterprise customers can also request custom invoice billing via wire transfer.",
    },
    {
      q: "Can I upgrade or downgrade my subscription plan at any time?",
      a: "Yes! You can manage your subscription plan anytime directly inside the Billing Portal. Upgrades take effect immediately with prorated billing.",
    },
    {
      q: "Is my customer data isolated from other organizations?",
      a: "Absolutely. VulnWiz AI enforces Row-Level Security (RLS) policies at the PostgreSQL database layer, guaranteeing complete cryptographic data isolation per tenant account.",
    },
  ];

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', color: '#0F172A', fontFamily: 'var(--font-sans)' }}>
      {/* Public Landing Navigation Bar */}
      <nav style={{
        height: '72px',
        background: '#FFFFFF',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 12px rgba(124, 58, 237, 0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/vulnwiz_logo_transparent.png"
            alt="VulnWiz AI Logo"
            style={{ height: '44px', width: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }}
          />
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            VulnWiz <span style={{ color: 'var(--accent-purple)' }}>AI</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', fontSize: '0.9rem', fontWeight: 600 }}>
          <a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Features</a>
          <a href="#why-us" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Why VulnWiz</a>
          <a href="#testimonials" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Testimonials</a>
          <a href="#faq" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>FAQ</a>
          <button onClick={onGetStarted} style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', cursor: 'pointer', fontWeight: 700 }}>
            Pricing
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button className="btn-secondary" onClick={onSignIn} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
            Sign In
          </button>
          <button className="btn-primary" onClick={onGetStarted} style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{
        padding: '90px 24px 70px 24px',
        maxWidth: '1280px',
        margin: '0 auto',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '30px',
          background: '#EDE9FE',
          color: 'var(--accent-purple)',
          fontWeight: 700,
          fontSize: '0.825rem',
        }}>
          <Sparkles size={16} /> Enterprise Cybersecurity Solutions Made Simple
        </div>

        <h1 style={{
          fontSize: '3.6rem',
          fontWeight: 900,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          color: '#0F172A',
          maxWidth: '960px',
        }}>
          Protect Your Business with <span style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI-Powered Security</span> & Continuous Monitoring
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-muted)',
          maxWidth: '780px',
          lineHeight: 1.6,
        }}>
          Automate OWASP vulnerability scanning, external attack surface discovery, CVSS risk prioritization, and instant code-level patch verification in one unified platform.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
          <button 
            className="btn-primary" 
            onClick={onGetStarted}
            style={{ padding: '14px 32px', fontSize: '1rem', borderRadius: '10px', boxShadow: '0 10px 25px rgba(124, 58, 237, 0.25)' }}
          >
            Get Started Now <ArrowRight size={18} />
          </button>
          <button 
            className="btn-secondary" 
            onClick={onSignIn}
            style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: '10px' }}
          >
            Sign In to Account
          </button>
        </div>

        {/* Hero Interactive Showcase Banner */}
        <div className="glass-panel" style={{
          marginTop: '40px',
          width: '100%',
          maxWidth: '1140px',
          padding: '24px',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #CBD5E1',
          boxShadow: '0 20px 60px rgba(124, 58, 237, 0.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginLeft: '12px', fontFamily: 'var(--font-mono)' }}>
                app.vulnwiz.ai/dashboard
              </span>
            </div>
            <span className="badge badge-green" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
              <Activity size={14} style={{ marginRight: '4px', display: 'inline' }} /> Live System Active
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', textAlign: 'left' }}>
            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>SECURITY POSTURE SCORE</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-green)', marginTop: '4px' }}>88 / 100</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+6 pts vs last week</div>
            </div>
            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>REGISTERED ASSETS</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-purple)', marginTop: '4px' }}>14 Targets</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Continuous monitoring</div>
            </div>
            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>OPEN CRITICAL FINDINGS</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-red)', marginTop: '4px' }}>2 Criticals</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AI code patches ready</div>
            </div>
            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>COMPLIANCE READINESS</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-blue)', marginTop: '4px' }}>94% SOC 2</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PCI-DSS & ISO 27001</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID SECTION */}
      <section id="features" style={{ padding: '80px 24px', background: '#FFFFFF', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Comprehensive Platform Capabilities
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '8px', color: '#0F172A' }}>
              Everything You Need for Enterprise Security
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Built from the ground up for AppSec teams, DevSecOps engineers, CISOs, and MSSP consultants.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
            {features.map((f, i) => (
              <div key={i} className="glass-panel" style={{
                padding: '28px',
                background: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}>
                <div>{f.icon}</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US SECTION */}
      <section id="why-us" style={{ padding: '80px 24px', background: '#F8FAFC', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Why Modern SaaS Startups Choose VulnWiz
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, marginTop: '8px', color: '#0F172A', lineHeight: 1.2 }}>
              Replace Manual Audits with Continuous AI Remediation
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '14px', lineHeight: 1.6 }}>
              Legacy vulnerability management tools overwhelm security teams with thousands of raw alerts. VulnWiz AI analyzes every vulnerability with context, calculates true risk, and generates exact production code fixes.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
              {[
                'Zero-touch active OWASP & port scanning engine',
                'AI-driven code fix generation & automated patch testing',
                'Multi-tenant Row-Level Security (RLS) data vault',
                'Direct PDF Executive Summary report downloader',
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.925rem', fontWeight: 600, color: '#0F172A' }}>
                  <CheckCircle2 size={18} color="var(--accent-purple)" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <button className="btn-primary" onClick={onGetStarted} style={{ marginTop: '32px', padding: '12px 24px' }}>
              Select Subscription Plan <ArrowRight size={16} />
            </button>
          </div>

          <div className="glass-panel" style={{ padding: '32px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #CBD5E1' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
              Platform Security Scorecard Benchmark
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  <span>VulnWiz AI Remediation Speed</span>
                  <span style={{ color: 'var(--accent-purple)' }}>4 Hours Average</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#E2E8F0', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: '92%', height: '100%', background: 'var(--accent-purple)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  <span>Traditional Pen Test Vendors</span>
                  <span style={{ color: 'var(--text-dim)' }}>45 Days Average</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#E2E8F0', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: '25%', height: '100%', background: 'var(--text-dim)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" style={{ padding: '80px 24px', background: '#FFFFFF', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Customer Testimonials
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, marginTop: '8px', color: '#0F172A' }}>
              Trusted by CISOs & Engineering Leaders
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
            {testimonials.map((t, idx) => (
              <div key={idx} className="glass-panel" style={{
                padding: '28px',
                background: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
              }}>
                <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{t.quote}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>{t.author}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{t.role} • {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" style={{ padding: '80px 24px', background: '#F8FAFC', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Frequently Asked Questions
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, marginTop: '8px', color: '#0F172A' }}>
              Everything You Need to Know
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {faqs.map((f, idx) => (
              <div key={idx} className="glass-panel" style={{
                background: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
              }}>
                <button
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: '18px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: '#0F172A',
                    cursor: 'pointer',
                  }}
                >
                  <span>{f.q}</span>
                  {openFaqIndex === idx ? <ChevronUp size={18} color="var(--accent-purple)" /> : <ChevronDown size={18} color="var(--text-dim)" />}
                </button>
                {openFaqIndex === idx && (
                  <div style={{ padding: '0 24px 20px 24px', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0F172A', color: '#F8FAFC', padding: '60px 24px 30px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '40px', paddingBottom: '40px', borderBottom: '1px solid #334155' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <img src="/vulnwiz_logo_transparent.png" alt="Logo" style={{ height: '36px', width: 'auto', filter: 'brightness(2)' }} />
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>VulnWiz AI</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', maxWidth: '320px', lineHeight: 1.5 }}>
              Enterprise AI vulnerability management SaaS platform empowering technology companies to continuously discover and remediate security risks.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '14px' }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: '#94A3B8' }}>
              <a href="#features" style={{ color: '#94A3B8', textDecoration: 'none' }}>OWASP Scanner</a>
              <a href="#features" style={{ color: '#94A3B8', textDecoration: 'none' }}>AI Analyst</a>
              <a href="#features" style={{ color: '#94A3B8', textDecoration: 'none' }}>EASM Recon</a>
              <a href="#features" style={{ color: '#94A3B8', textDecoration: 'none' }}>SBOM Supply Chain</a>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '14px' }}>Account & Plans</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: '#94A3B8' }}>
              <button onClick={onGetStarted} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Pricing Plans</button>
              <button onClick={onSignIn} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Sign In</button>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '14px' }}>Compliance & Legal</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: '#94A3B8' }}>
              <span>SOC 2 Type II Certified</span>
              <span>ISO 27001 Compliant</span>
              <span>PCI-DSS Ready</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem', color: '#94A3B8' }}>
          <div>Copyright © 2026 VulnWiz AI for LAU.AI</div>
          <div style={{ fontWeight: 700, color: 'var(--accent-purple)' }}>Developed by Charlen Baloukjy</div>
        </div>
      </footer>
    </div>
  );
};
