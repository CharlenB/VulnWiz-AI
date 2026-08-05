import React, { useState } from 'react';
import { 
  CreditCard, 
  Lock, 
  AlertCircle, 
  ShieldCheck, 
  RefreshCw
} from 'lucide-react';
import type { UserAccount } from '../../types';
import { processStripePayment } from '../../services/saasAuthService';

interface CheckoutViewProps {
  user: UserAccount;
  onPaymentSuccess: () => void;
  onBackToPricing: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  user,
  onPaymentSuccess,
  onBackToPricing,
}) => {
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [cardholderName, setCardholderName] = useState(user.fullName);
  const [billingZip, setBillingZip] = useState('90210');
  const [simulateFailure, setSimulateFailure] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPhase, setProcessingPhase] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Calculate pricing
  let baseMonthlyPrice = 499;
  if (user.selectedPlan === 'Corporate Security') baseMonthlyPrice = 1499;
  if (user.selectedPlan === 'Enterprise MSSP') baseMonthlyPrice = 3999;

  let planAmount = baseMonthlyPrice;
  if (user.billingCycle === 'annual') {
    planAmount = Math.round(baseMonthlyPrice * 12 * 0.8);
  }

  const taxAmount = 0; // Tax included
  const totalAmount = planAmount + taxAmount;

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);
    setIsProcessing(true);

    setProcessingPhase('Tokenizing credit card credentials via Stripe Elements (PCI-DSS Level 1)...');

    setTimeout(() => {
      setProcessingPhase('Dispatched Stripe Webhook (invoice.payment_succeeded)...');
    }, 800);

    setTimeout(() => {
      setProcessingPhase('Verifying transaction token & updating account status to ACTIVE...');
    }, 1500);

    setTimeout(() => {
      const result = processStripePayment(user, {
        cardNumber,
        expiry,
        cvv,
        cardholderName,
        billingZip,
        shouldSimulateFailure: simulateFailure,
      });

      setIsProcessing(false);

      if (!result.success) {
        setPaymentError(result.error || 'Your payment could not be completed. Please try again.');
        return;
      }

      // Payment successful!
      onPaymentSuccess();
    }, 2200);
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#0F172A', fontFamily: 'var(--font-sans)' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={onBackToPricing}>
          <img src="/vulnwiz_logo_transparent.png" alt="Logo" style={{ height: '42px', mixBlendMode: 'multiply' }} />
          <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>VulnWiz <span style={{ color: 'var(--accent-purple)' }}>AI</span></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', color: 'var(--accent-green)', fontWeight: 600 }}>
          <Lock size={16} /> 256-Bit SSL Encrypted Stripe Checkout
        </div>
      </nav>

      {/* Main Checkout Area */}
      <div style={{ flex: 1, maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '40px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '36px' }}>
          
          {/* Left Column: Payment Form */}
          <div className="glass-panel" style={{ padding: '32px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #CBD5E1' }}>
            <div style={{ marginBottom: '24px' }}>
              <span className="badge badge-purple" style={{ fontSize: '0.75rem', marginBottom: '8px' }}>Step 3 of 4: Stripe Payment Checkout</span>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A' }}>Complete Your Subscription</h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Status: <span style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>PENDING_PAYMENT</span> (Account creates after payment verification)
              </p>
            </div>

            {paymentError && (
              <div style={{ padding: '14px', borderRadius: '8px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '0.875rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={20} color="#991B1B" />
                <div>
                  <strong style={{ display: 'block' }}>Payment Failed</strong>
                  <span>{paymentError}</span>
                </div>
              </div>
            )}

            {isProcessing ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div className="pulse-active" style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RefreshCw size={32} color="var(--accent-purple)" className="spin" />
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>Processing Secure Payment...</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)', maxWidth: '420px' }}>
                  {processingPhase}
                </div>
              </div>
            ) : (
              <form onSubmit={handlePaySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px' }}>
                    Cardholder Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={cardholderName}
                    onChange={e => setCardholderName(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid var(--border-color)', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px' }}>
                    Card Number (Stripe Test Card Pre-filled)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <CreditCard size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid var(--border-color)', fontSize: '0.9rem', fontFamily: 'var(--font-mono)', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px' }}>
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={e => setExpiry(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid var(--border-color)', fontSize: '0.9rem', fontFamily: 'var(--font-mono)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px' }}>
                      CVC / CVV
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="123"
                      value={cvv}
                      onChange={e => setCvv(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid var(--border-color)', fontSize: '0.9rem', fontFamily: 'var(--font-mono)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px' }}>
                      Postal / ZIP
                    </label>
                    <input
                      type="text"
                      required
                      value={billingZip}
                      onChange={e => setBillingZip(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid var(--border-color)', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Developer Simulation Toggle */}
                <div style={{ padding: '12px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px', fontSize: '0.8rem', color: '#92400E', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="simulate-fail"
                    checked={simulateFailure}
                    onChange={e => setSimulateFailure(e.target.checked)}
                  />
                  <label htmlFor="simulate-fail" style={{ cursor: 'pointer', fontWeight: 600 }}>
                    Simulate Payment Failure (Test Failed Payment Handling)
                  </label>
                </div>

                <button type="submit" className="btn-primary" style={{ padding: '14px', borderRadius: '8px', fontSize: '1rem', justifyContent: 'center', marginTop: '8px' }}>
                  <Lock size={16} /> Pay ${totalAmount.toLocaleString()} & Activate Account
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="glass-panel" style={{ padding: '28px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #CBD5E1', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', color: '#0F172A' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>Plan: {user.selectedPlan}</span>
                <span style={{ fontWeight: 800, color: 'var(--accent-purple)' }}>${planAmount.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Billing Cycle:</span>
                <span>{user.billingCycle === 'annual' ? 'Annual (20% Savings)' : 'Monthly'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Account Holder:</span>
                <span>{user.companyName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Taxes:</span>
                <span>$0.00 (Included)</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem', fontWeight: 900, marginBottom: '24px' }}>
              <span>Total Due Now:</span>
              <span style={{ color: '#0F172A' }}>${totalAmount.toLocaleString()} USD</span>
            </div>

            <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.775rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--accent-green)', marginBottom: '4px' }}>
                <ShieldCheck size={16} /> Stripe Webhook Verification Guarantee
              </div>
              Your subscription is processed over Stripe Level 1 PCI-compliant infrastructure. Your card data is never stored on our servers.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
