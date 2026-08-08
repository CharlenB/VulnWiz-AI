import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, LockKeyhole } from 'lucide-react';
import type { UserAccount } from '../../types';
import { authenticateUser } from '../../services/saasAuthService';

interface LoginViewProps {
  onLoginSuccess: (user: UserAccount) => void;
  onRedirectToCheckout: (user: UserAccount) => void;
  onBackToLanding: () => void;
  onSignUp: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onBackToLanding, onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result = await authenticateUser(email, password);
    setIsSubmitting(false);
    if (!result.success || !result.user) {
      setError(result.error || 'Unable to sign in.');
      return;
    }
    onLoginSuccess(result.user);
  };

  return (
    <main className="secure-notice-page">
      <section className="glass-panel secure-notice" aria-labelledby="login-title">
        <div className="secure-notice-icon" aria-hidden="true"><LockKeyhole size={28} /></div>
        <h1 id="login-title">Sign in</h1>
        <p>Use your VulnWiz workspace account. Workspace access is verified from your Supabase tenant membership.</p>
        {error && <div className="secure-notice-warning" role="alert"><AlertCircle size={18} aria-hidden="true" />{error}</div>}
        <form onSubmit={submit} className="auth-form">
          <label htmlFor="login-email">Work email</label>
          <input id="login-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required />
          <label htmlFor="login-password">Password</label>
          <input id="login-password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required />
          <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign in securely'}</button>
        </form>
        <div className="auth-actions">
          <button type="button" className="btn-secondary" onClick={onBackToLanding}><ArrowLeft size={16} aria-hidden="true" /> Return to preview</button>
          <button type="button" className="btn-secondary" onClick={onSignUp}>Create account</button>
        </div>
      </section>
    </main>
  );
};
