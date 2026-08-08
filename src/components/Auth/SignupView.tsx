import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import type { BillingCycle, TenantPlan } from '../../types';

interface SignupViewProps {
  selectedPlan: TenantPlan;
  billingCycle: BillingCycle;
  onSignupSuccess: () => void;
  onBackToPricing: () => void;
  onSignIn: () => void;
}

/** Registration must be implemented by the server-side identity service. */
export const SignupView: React.FC<SignupViewProps> = ({ onBackToPricing }) => (
  <main className="secure-notice-page">
    <section className="glass-panel secure-notice" aria-labelledby="registration-unavailable-title">
      <div className="secure-notice-icon" aria-hidden="true"><ShieldCheck size={28} /></div>
      <h1 id="registration-unavailable-title">Account registration is not configured</h1>
      <p>
        To protect customer credentials and tenant data, this preview does not accept registration details.
        Registration will require verified email, secure password hashing, rate limiting, and server-side tenant provisioning.
      </p>
      <button type="button" className="btn-primary" onClick={onBackToPricing}>
        <ArrowLeft size={16} aria-hidden="true" /> Return to pricing
      </button>
    </section>
  </main>
);
