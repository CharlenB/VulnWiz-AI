import React, { useState } from 'react';
import { 
  Building, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle
} from 'lucide-react';
import type { TenantPlan, BillingCycle } from '../../types';
import { registerPendingUser, evaluatePasswordStrength } from '../../services/saasAuthService';

interface SignupViewProps {
  selectedPlan: TenantPlan;
  billingCycle: BillingCycle;
  onSignupSuccess: () => void;
  onBackToPricing: () => void;
  onSignIn: () => void;
}

export const SignupView: React.FC<SignupViewProps> = ({
  selectedPlan,
  billingCycle,
  onSignupSuccess,
  onBackToPricing,
  onSignIn,
}) => {
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [industry, setIndustry] = useState('FinTech & Banking Services');
  const [companySize, setCompanySize] = useState('10-50');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pwdStrength = evaluatePasswordStrength(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!passwordsMatch) {
      setErrorMessage('Passwords do not match. Please verify your confirm password.');
      return;
    }

    if (pwdStrength.score < 2) {
      setErrorMessage('Please choose a stronger password matching the security requirements.');
      return;
    }

    const result = registerPendingUser({
      fullName,
      email,
      companyName,
      password,
      phone,
      industry,
      companySize,
      selectedPlan,
      billingCycle,
    });

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to create account.');
      return;
    }

    // Proceed to Step 3: Payment Process
    onSignupSuccess();
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#0F172A', fontFamily: 'var(--font-sans)' }}>
      {/* Navbar */}
      <nav style={{
        height: '72px',
        background: '#FFFFFF',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={onBackToPricing}>
          <img src="/vulnwiz_logo_transparent.png" alt="Logo" style={{ height: '42px', mixBlendMode: 'multiply' }} />
          <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>VulnWiz <span style={{ color: 'var(--accent-purple)' }}>AI</span></span>
        </div>

        <button className="btn-secondary" onClick={onSignIn}>Already registered? Sign In</button>
      </nav>

      {/* Main Signup Form Area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="glass-panel" style={{ width: '640px', maxWidth: '100%', padding: '36px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #CBD5E1' }}>
          
          {/* Header & Step Indicator */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>Step 2 of 4: Account Creation</span>
              <button onClick={onBackToPricing} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowLeft size={14} /> Change Plan ({selectedPlan})
              </button>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A' }}>Create Your Security Account</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Selected Plan: <strong style={{ color: 'var(--accent-purple)' }}>{selectedPlan}</strong> ({billingCycle === 'annual' ? 'Annual Billed' : 'Monthly Billed'})
            </p>
          </div>

          {errorMessage && (
            <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} color="#991B1B" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px' }}>
                  Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    required
                    placeholder="Charlen Baloukjy"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid var(--border-color)', color: '#0F172A', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px' }}>
                  Company Legal Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <Building size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    required
                    placeholder="Acme Financial Security Inc."
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid var(--border-color)', color: '#0F172A', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px' }}>
                Work Email Address *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="email"
                  required
                  placeholder="charlen@acmefinancial.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid var(--border-color)', color: '#0F172A', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px' }}>
                  Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid var(--border-color)', color: '#0F172A', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px' }}>
                  Confirm Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid var(--border-color)', color: '#0F172A', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* Password Strength Meter */}
            {password.length > 0 && (
              <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.775rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Password Strength:</span>
                  <strong style={{
                    color: pwdStrength.score <= 1 ? 'var(--accent-red)' : pwdStrength.score === 2 ? 'var(--accent-amber)' : 'var(--accent-green)'
                  }}>
                    {pwdStrength.label}
                  </strong>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${(pwdStrength.score / 4) * 100}%`,
                    height: '100%',
                    background: pwdStrength.score <= 1 ? 'var(--accent-red)' : pwdStrength.score === 2 ? 'var(--accent-amber)' : 'var(--accent-green)',
                    transition: 'all 0.2s ease',
                  }} />
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px', color: 'var(--text-dim)' }}>
                  <span>{pwdStrength.hasMinLength ? '✓ 8+ chars' : '✗ 8+ chars'}</span>
                  <span>{pwdStrength.hasUppercase && pwdStrength.hasLowercase ? '✓ Upper/Lower' : '✗ Upper/Lower'}</span>
                  <span>{pwdStrength.hasNumber ? '✓ Number' : '✗ Number'}</span>
                  <span>{pwdStrength.hasSpecial ? '✓ Special char' : '✗ Special char'}</span>
                </div>
              </div>
            )}

            {/* Optional Fields */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)' }}>Optional Organization Context</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 019-2834"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid var(--border-color)', fontSize: '0.8rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Industry</label>
                  <select
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid var(--border-color)', fontSize: '0.8rem', outline: 'none' }}
                  >
                    <option value="FinTech & Banking Services">FinTech & Banking</option>
                    <option value="AI & Software">AI & Software</option>
                    <option value="Healthcare & HIPAA">Healthcare</option>
                    <option value="E-Commerce & Supply Chain">E-Commerce</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Company Size</label>
                  <select
                    value={companySize}
                    onChange={e => setCompanySize(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid var(--border-color)', fontSize: '0.8rem', outline: 'none' }}
                  >
                    <option value="1-10">1-10 Employees</option>
                    <option value="10-50">10-50 Employees</option>
                    <option value="50-250">50-250 Employees</option>
                    <option value="250+">250+ Enterprise</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '12px', padding: '14px', borderRadius: '8px', fontSize: '1rem', justifyContent: 'center' }}>
              Create Account & Proceed to Payment <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
