import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle
} from 'lucide-react';
import type { UserAccount } from '../../types';
import { authenticateUser } from '../../services/saasAuthService';

interface LoginViewProps {
  onLoginSuccess: (user: UserAccount) => void;
  onRedirectToCheckout: (user: UserAccount) => void;
  onBackToLanding: () => void;
  onSignUp: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onRedirectToCheckout,
  onBackToLanding,
  onSignUp,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = authenticateUser(email, password);

    if (!result.success || !result.user) {
      setErrorMessage(result.error || 'Invalid credentials.');
      return;
    }

    const user = result.user;

    // ACCOUNT STATE GATEKEEPING SYSTEM
    if (user.status === 'PENDING_PAYMENT') {
      // Gatekeep: Require payment completion
      onRedirectToCheckout(user);
      return;
    }

    if (user.status === 'SUSPENDED') {
      setErrorMessage('Your organization account has been SUSPENDED due to compliance or billing issues. Please contact security-support@vulnwiz.ai.');
      return;
    }

    if (user.status === 'CANCELED') {
      setErrorMessage('Your subscription has been CANCELED. Please renew your subscription to access the security platform.');
      return;
    }

    // Account is ACTIVE -> Grant platform access
    onLoginSuccess(user);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={onBackToLanding}>
          <img src="/vulnwiz_logo_transparent.png" alt="Logo" style={{ height: '42px', mixBlendMode: 'multiply' }} />
          <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>VulnWiz <span style={{ color: 'var(--accent-purple)' }}>AI</span></span>
        </div>

        <button className="btn-secondary" onClick={onSignUp}>Don't have an account? Get Started</button>
      </nav>

      {/* Main Login Area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="glass-panel" style={{ width: '460px', maxWidth: '100%', padding: '36px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #CBD5E1' }}>
          
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Lock size={24} />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A' }}>Sign In to VulnWiz AI</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Enter your credentials to access your security workspace.
            </p>
          </div>

          {errorMessage && (
            <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={20} color="#991B1B" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px' }}>
                Work Email Address
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

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)' }}>
                  Password
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Password reset link dispatched to email!"); }} style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', textDecoration: 'none', fontWeight: 600 }}>
                  Forgot password?
                </a>
              </div>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember" style={{ cursor: 'pointer', color: 'var(--text-main)' }}>
                Remember me on this browser
              </label>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '14px', borderRadius: '8px', fontSize: '1rem', justifyContent: 'center', marginTop: '8px' }}>
              Sign In to Platform <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
