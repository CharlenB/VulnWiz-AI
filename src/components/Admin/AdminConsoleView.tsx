import React, { useState } from 'react';
import { 
  Search, 
  UserX, 
  UserCheck
} from 'lucide-react';
import type { UserAccount, AccountStatus } from '../../types';
import { getUsers, updateUserAccountStatus, getPaymentRecords } from '../../services/saasAuthService';

export const AdminConsoleView: React.FC = () => {
  const [usersList, setUsersList] = useState<UserAccount[]>(getUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const payments = getPaymentRecords();

  const handleStatusChange = (userId: string, status: AccountStatus) => {
    const updated = updateUserAccountStatus(userId, status);
    setUsersList(updated);
  };

  const activeCount = usersList.filter(u => u.status === 'ACTIVE').length;
  const pendingCount = usersList.filter(u => u.status === 'PENDING_PAYMENT').length;
  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

  const filteredUsers = usersList.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <span className="badge badge-purple" style={{ fontSize: '0.75rem', marginBottom: '6px' }}>
          SaaS Owner Admin Control Panel
        </span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Subscriber & Revenue Administration
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Manage customer SaaS accounts, Stripe payment subscriptions, MRR analytics, and access suspensions.
        </p>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700 }}>TOTAL REVENUE GENERATED</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-purple)', marginTop: '4px' }}>
            ${totalRevenue.toLocaleString()} USD
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 600 }}>Stripe Processing Live</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700 }}>ACTIVE SUBSCRIBERS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-green)', marginTop: '4px' }}>
            {activeCount} Enterprise Orgs
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Paying customers</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700 }}>PENDING PAYMENT ACCOUNTS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-amber)', marginTop: '4px' }}>
            {pendingCount} Accounts
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Awaiting Stripe checkout</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700 }}>TOTAL ACCOUNTS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', marginTop: '4px' }}>
            {usersList.length} Customers
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Multi-tenant RLS</div>
        </div>
      </div>

      {/* Customer Subscriber List Table */}
      <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Customer Accounts & Subscriptions</h2>
          
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search company or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 10px 8px 36px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid var(--border-color)', fontSize: '0.825rem', outline: 'none' }}
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px' }}>Company & User</th>
              <th style={{ padding: '12px' }}>Email Address</th>
              <th style={{ padding: '12px' }}>Subscription Plan</th>
              <th style={{ padding: '12px' }}>Cycle</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.2)' }}>
                <td style={{ padding: '12px' }}>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>{u.companyName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{u.fullName} ({u.role})</div>
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{u.email}</td>
                <td style={{ padding: '12px' }}><span className="badge badge-purple">{u.selectedPlan}</span></td>
                <td style={{ padding: '12px', textTransform: 'capitalize' }}>{u.billingCycle}</td>
                <td style={{ padding: '12px' }}>
                  <span className={`badge ${u.status === 'ACTIVE' ? 'badge-green' : u.status === 'PENDING_PAYMENT' ? 'badge-amber' : 'badge-critical'}`}>
                    {u.status}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {u.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handleStatusChange(u.id, 'SUSPENDED')}
                        className="btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--accent-red)', borderColor: '#FCA5A5' }}
                      >
                        <UserX size={12} /> Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(u.id, 'ACTIVE')}
                        className="btn-primary"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      >
                        <UserCheck size={12} /> Activate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
