import React from 'react';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import type { UserAccount } from '../../types';

interface LoginViewProps {
  onLoginSuccess: (user: UserAccount) => void;
  onRedirectToCheckout: (user: UserAccount) => void;
  onBackToLanding: () => void;
  onSignUp: () => void;
}

/** Password collection is intentionally unavailable until server-side auth exists. */
export const LoginView: React.FC<LoginViewProps> = ({ onBackToLanding }) => (
  <main className="secure-notice-page">
    <section className="glass-panel secure-notice" aria-labelledby="login-unavailable-title">
      <div className="secure-notice-icon" aria-hidden="true"><LockKeyhole size={28} /></div>
      <h1 id="login-unavailable-title">Sign-in is not configured</h1>
      <p>
        This preview does not collect or store passwords. Enable sign-in only after a server-side identity provider,
        secure session lifecycle, rate limiting, and tenant authorization have been deployed.
      </p>
      <button type="button" className="btn-primary" onClick={onBackToLanding}>
        <ArrowLeft size={16} aria-hidden="true" /> Return to preview
      </button>
    </section>
  </main>
);
