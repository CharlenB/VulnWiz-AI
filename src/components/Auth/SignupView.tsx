import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import type { BillingCycle, TenantPlan } from '../../types';
import { registerPendingUser, validateStrongPassword } from '../../services/saasAuthService';

interface SignupViewProps {
  selectedPlan: TenantPlan;
  billingCycle: BillingCycle;
  onBackToPricing: () => void;
  onSignIn: () => void;
}

export const SignupView: React.FC<SignupViewProps> = ({ selectedPlan, billingCycle, onBackToPricing, onSignIn }) => {
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isConfirmationPending, setIsConfirmationPending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const passwordResult = validateStrongPassword(password);
    if (!passwordResult.isValid) return setError(`Choose a password with ${passwordResult.errors.join(', ')}.`);
    if (password !== confirmation) return setError('Passwords do not match.');
    setIsSubmitting(true);
    const result = await registerPendingUser({ fullName, companyName, email, password, selectedPlan, billingCycle });
    setIsSubmitting(false);
    if (!result.success) return setError(result.error || 'Unable to create the account.');
    setIsConfirmationPending(true);
  };

  return (
    <main className="secure-notice-page">
      <section className="glass-panel secure-notice" aria-labelledby="signup-title">
        <div className="secure-notice-icon" aria-hidden="true"><ShieldCheck size={28} /></div>
        <h1 id="signup-title">{isConfirmationPending ? 'Confirm your email' : 'Create account'}</h1>
        <p>{isConfirmationPending
          ? `We sent a confirmation link to ${email}. Open it to verify your address, then return here to sign in.`
          : `${selectedPlan} · ${billingCycle} billing. Account access requires email confirmation.`}</p>
        {error && <div className="secure-notice-warning" role="alert"><AlertCircle size={18} aria-hidden="true" />{error}</div>}
        {isConfirmationPending && <div className="secure-notice-success" role="status">Your workspace will be created automatically once the account is registered. You cannot sign in until you confirm your email.</div>}
        {!isConfirmationPending && <form onSubmit={submit} className="auth-form">
          <label htmlFor="signup-name">Full name</label>
          <input id="signup-name" autoComplete="name" value={fullName} onChange={event => setFullName(event.target.value)} required />
          <label htmlFor="signup-company">Company</label>
          <input id="signup-company" autoComplete="organization" value={companyName} onChange={event => setCompanyName(event.target.value)} required />
          <label htmlFor="signup-email">Work email</label>
          <input id="signup-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required />
          <label htmlFor="signup-password">Password</label>
          <input id="signup-password" type="password" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} required />
          <label htmlFor="signup-confirmation">Confirm password</label>
          <input id="signup-confirmation" type="password" autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} required />
          <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Creating account…' : 'Create account'}</button>
        </form>
        }
        <div className="auth-actions"><button type="button" className="btn-secondary" onClick={onBackToPricing}><ArrowLeft size={16} aria-hidden="true" /> Pricing</button><button type="button" className="btn-secondary" onClick={onSignIn}>Sign in</button></div>
      </section>
    </main>
  );
};
