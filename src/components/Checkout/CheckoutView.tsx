import React from 'react';
import { AlertCircle, ArrowLeft, Lock } from 'lucide-react';
import type { UserAccount } from '../../types';

interface CheckoutViewProps {
  user: UserAccount;
  onPaymentSuccess: () => void;
  onBackToPricing: () => void;
}

/**
 * A payment page must never collect card data without a PCI-compliant provider.
 * This deliberately fails closed until Stripe Checkout + a signed webhook exist.
 */
export const CheckoutView: React.FC<CheckoutViewProps> = ({ onBackToPricing }) => (
  <main className="secure-notice-page">
    <section className="glass-panel secure-notice" aria-labelledby="checkout-unavailable-title">
      <div className="secure-notice-icon" aria-hidden="true"><Lock size={28} /></div>
      <h1 id="checkout-unavailable-title">Secure checkout is not configured</h1>
      <p>
        Payment collection is disabled until this application is connected to a PCI-compliant
        payment provider through server-side PaymentIntents and verified webhooks.
      </p>
      <div className="secure-notice-warning" role="alert">
        <AlertCircle size={18} aria-hidden="true" /> No card number, expiry date, or CVV is collected by this application.
      </div>
      <button type="button" className="btn-primary" onClick={onBackToPricing}>
        <ArrowLeft size={16} aria-hidden="true" /> Return to pricing
      </button>
    </section>
  </main>
);
