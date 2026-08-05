import React, { useState } from 'react';
import { 
  CreditCard, 
  Download, 
  CheckCircle2, 
  Calendar,
  Zap
} from 'lucide-react';
import type { UserAccount, TenantPlan } from '../../types';
import { getPaymentRecords } from '../../services/saasAuthService';

interface BillingViewProps {
  user: UserAccount;
  onUpdatePlan: (newPlan: TenantPlan) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  user,
  onUpdatePlan,
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const payments = getPaymentRecords();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Subscription & Billing Management
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Manage your enterprise SaaS subscription plan, payment methods, and invoice history.
        </p>
      </div>

      {/* Top Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {/* Active Plan Card */}
        <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>
            CURRENT SUBSCRIPTION PLAN
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-purple)', marginTop: '6px' }}>
            {user.selectedPlan}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Billed {user.billingCycle === 'annual' ? 'Annually (20% Savings)' : 'Monthly'}
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
            <button className="btn-primary" onClick={() => setShowUpgradeModal(true)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <Zap size={14} /> Upgrade Plan
            </button>
          </div>
        </div>

        {/* Account Status Card */}
        <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>
            ACCOUNT STATUS
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-green)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={24} /> {user.status}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Multi-Tenant RLS Vault Active
          </div>
        </div>

        {/* Renewal Date Card */}
        <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>
            NEXT RENEWAL DATE
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={22} color="var(--accent-purple)" /> Sept 1, 2026
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Auto-renew enabled via Stripe
          </div>
        </div>
      </div>

      {/* Payment Method Section */}
      <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>Payment Method on File</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CreditCard size={24} color="var(--accent-purple)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Visa ending in 4242</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Expires 12/2028 • Default Payment Method</div>
            </div>
          </div>
          <button className="btn-secondary" onClick={() => alert("Redirecting to Stripe Customer Portal...")} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            Update Card
          </button>
        </div>
      </div>

      {/* Invoice History Table */}
      <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Invoice & Payment History</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px' }}>Transaction ID</th>
              <th style={{ padding: '12px' }}>Date</th>
              <th style={{ padding: '12px' }}>Plan</th>
              <th style={{ padding: '12px' }}>Amount</th>
              <th style={{ padding: '12px' }}>Payment Method</th>
              <th style={{ padding: '12px' }}>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.2)' }}>
                <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{p.transactionId}</td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{p.createdAt}</td>
                <td style={{ padding: '12px' }}><span className="badge badge-purple">{p.plan}</span></td>
                <td style={{ padding: '12px', fontWeight: 700 }}>${p.amount.toLocaleString()} USD</td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{p.paymentMethod}</td>
                <td style={{ padding: '12px' }}>
                  <button 
                    onClick={() => alert(`Downloading PDF Invoice ${p.transactionId}.pdf...`)}
                    className="btn-secondary" 
                    style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Download size={12} /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Danger Zone: Cancel Subscription */}
      <div className="glass-panel" style={{ padding: '24px', background: '#FFF5F5', borderRadius: '12px', border: '1px solid #FECDD3' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#991B1B', marginBottom: '8px' }}>Cancel Subscription</h2>
        <p style={{ fontSize: '0.85rem', color: '#7F1D1D', marginBottom: '14px' }}>
          Canceling will restrict your security scanning features at the end of your current billing period.
        </p>
        <button 
          onClick={() => alert("Subscription cancellation request logged. Your access will remain active until the end of your billing cycle.")}
          style={{ padding: '8px 16px', borderRadius: '6px', background: '#DC2626', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.825rem', cursor: 'pointer' }}
        >
          Cancel Subscription
        </button>
      </div>

      {/* Upgrade Plan Modal */}
      {showUpgradeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '480px', padding: '28px', background: '#FFFFFF', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Select Upgrade Tier</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Standard Pro', 'Corporate Security', 'Enterprise MSSP'].map((pl) => (
                <button
                  key={pl}
                  onClick={() => {
                    onUpdatePlan(pl as TenantPlan);
                    setShowUpgradeModal(false);
                    alert(`Plan updated to ${pl}!`);
                  }}
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    border: user.selectedPlan === pl ? '2px solid var(--accent-purple)' : '1px solid var(--border-color)',
                    background: user.selectedPlan === pl ? '#EDE9FE' : '#F8FAFC',
                    fontWeight: 700,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  {pl} {user.selectedPlan === pl && '(Current Plan)'}
                </button>
              ))}
            </div>
            <button className="btn-secondary" onClick={() => setShowUpgradeModal(false)} style={{ marginTop: '16px', width: '100%' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
