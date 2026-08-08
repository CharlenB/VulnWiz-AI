import React, { useState } from 'react';
import { 
  Building, 
  Users, 
  ShieldCheck, 
  History, 
  Plus, 
  CheckCircle2,
  Search,
  X,
  UserPlus,
  Mail,
  Copy,
  ExternalLink
} from 'lucide-react';
import type { Tenant, AuditLog, UserRole } from '../../types';
import { createInvitation } from '../../services/invitationService';
import { getCurrentUser } from '../../services/saasAuthService';

interface TenantSettingsViewProps {
  tenant: Tenant;
  auditLogs: AuditLog[];
  onUpdateTenant: (updatedTenant: Tenant) => void;
  onOpenRegisterModal?: () => void;
}

export const TenantSettingsView: React.FC<TenantSettingsViewProps> = ({
  tenant,
  auditLogs,
  onUpdateTenant,
  onOpenRegisterModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'rbac' | 'audit'>('profile');
  const [searchLog, setSearchLog] = useState<string>('');

  // Profile form
  const [tenantName, setTenantName] = useState(tenant.name);
  const [domain, setDomain] = useState(tenant.domain);
  const [industry, setIndustry] = useState(tenant.industry);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Users & Invite Modal state
  const [users, setUsers] = useState([
    { name: 'Sarah Connor', email: 'sarah.connor@acmefinancial.com', role: 'Security Analyst' as UserRole, status: 'Active', mfa: 'TOTP Enabled' },
    { name: 'Alex Vance', email: 'alex.vance@acmefinancial.com', role: 'Super Admin' as UserRole, status: 'Active', mfa: 'WebAuthn Security Key' },
    { name: 'Mark Redfield', email: 'mark.redfield@acmefinancial.com', role: 'Developer' as UserRole, status: 'Active', mfa: 'TOTP Enabled' },
    { name: 'Elena Fisher', email: 'elena.fisher@acmefinancial.com', role: 'Executive Viewer' as UserRole, status: 'Active', mfa: 'Email Magic Link' },
  ]);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [inviteName, setInviteName] = useState<string>('');
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Security Analyst');
  const [inviteMfa, setInviteMfa] = useState<boolean>(true);

  // Invitation Success & Magic Link Dispatch state
  const [inviteSuccessMessage, setInviteSuccessMessage] = useState<string | null>(null);
  const [copiedLinkSuccess, setCopiedLinkSuccess] = useState<boolean>(false);
  const [lastInvitedUser, setLastInvitedUser] = useState<{
    name: string;
    email: string;
    role: UserRole;
    inviteLink: string;
  } | null>(null);
  const [showInviteSuccessModal, setShowInviteSuccessModal] = useState<boolean>(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTenant({
      ...tenant,
      name: tenantName,
      domain,
      industry,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleInviteUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    const currentUser = getCurrentUser();
    const inviterName = currentUser?.fullName || 'Super Admin';
    const inviterEmail = currentUser?.email || `admin@${tenant.domain}`;

    const { invitation, inviteUrl } = createInvitation({
      inviterName,
      inviterEmail,
      tenantId: tenant.id,
      tenantName: tenant.name,
      inviteeEmail: inviteEmail,
      role: inviteRole,
    });

    const newUser = {
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      status: 'Pending' as const,
      mfa: inviteMfa ? 'TOTP Enabled' : 'Disabled',
    };

    setUsers(prev => [newUser, ...prev]);
    setLastInvitedUser({
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      inviteLink: inviteUrl,
    });

    setShowInviteModal(false);
    setShowInviteSuccessModal(true);
    setInviteSuccessMessage(`Invitation email & Magic Link dispatched to ${inviteEmail}! Token created: ${invitation.token}`);

    setInviteName('');
    setInviteEmail('');
  };

  const filteredLogs = auditLogs.filter(l => 
    l.user.toLowerCase().includes(searchLog.toLowerCase()) ||
    l.action.toLowerCase().includes(searchLog.toLowerCase()) ||
    l.details.toLowerCase().includes(searchLog.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Multi-Tenant & Security Audit Administration
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Manage corporate subscription tenant profile, Role-Based Access Control (RBAC), and WORM audit logs.
        </p>
      </div>

      {/* Sub tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveSubTab('profile')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'profile' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
            color: activeSubTab === 'profile' ? 'var(--accent-cyan)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Building size={16} /> Tenant Organization Profile
        </button>
        <button
          onClick={() => setActiveSubTab('rbac')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'rbac' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
            color: activeSubTab === 'rbac' ? 'var(--accent-cyan)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Users size={16} /> User Management & RBAC
        </button>
        <button
          onClick={() => setActiveSubTab('audit')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'audit' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
            color: activeSubTab === 'audit' ? 'var(--accent-cyan)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <History size={16} /> System Audit Trail Logs
        </button>
      </div>

      {/* SUB TAB 1: PROFILE */}
      {activeSubTab === 'profile' && (
        <div className="glass-panel" style={{ padding: '24px', maxWidth: '600px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Organization Details</h2>
          
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                Organization Legal Name
              </label>
              <input
                type="text"
                value={tenantName}
                onChange={e => setTenantName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#FFFFFF', border: '1px solid var(--accent-purple)', color: 'var(--accent-purple)', fontWeight: 600, fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                Corporate Domain
              </label>
              <input
                type="text"
                value={domain}
                onChange={e => setDomain(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#FFFFFF', border: '1px solid var(--accent-purple)', color: 'var(--accent-purple)', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                Industry Vertical
              </label>
              <input
                type="text"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#FFFFFF', border: '1px solid var(--accent-purple)', color: 'var(--accent-purple)', fontWeight: 600, fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div style={{ background: 'linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%)', padding: '14px', borderRadius: '8px', border: '1px solid #DDD6FE' }}>
              <strong style={{ fontSize: '0.875rem', color: 'var(--accent-purple)' }}>Subscription Plan: {tenant.plan}</strong>
              <div style={{ fontSize: '0.775rem', color: '#475569', marginTop: '4px', lineHeight: 1.4 }}>
                Includes Unlimited Scanning, AI Analyst Engine, Row-Level Tenant Isolation, and 24/7 Support.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button type="submit" className="btn-primary">
                  Save Tenant Settings
                </button>
                {savedSuccess && (
                  <span style={{ color: 'var(--accent-green)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={16} /> Saved!
                  </span>
                )}
              </div>

              {onOpenRegisterModal && (
                <button type="button" className="btn-secondary" onClick={onOpenRegisterModal} style={{ borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }}>
                  <Plus size={16} /> Register New Tenant (Model A)
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* SUB TAB 2: RBAC */}
      {activeSubTab === 'rbac' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          {/* Success Banner Alert Toast */}
          {inviteSuccessMessage && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#DCFCE7',
              border: '1px solid #86EFAC',
              color: '#166534',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#166534" />
                <span>{inviteSuccessMessage}</span>
              </div>
              <button
                onClick={() => setInviteSuccessMessage(null)}
                style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Authorized Team Members & Roles</h2>
            <button className="btn-primary" onClick={() => setShowInviteModal(true)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <UserPlus size={14} /> Invite User
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px' }}>User Name</th>
                <th style={{ padding: '12px' }}>Email Address</th>
                <th style={{ padding: '12px' }}>RBAC Role</th>
                <th style={{ padding: '12px' }}>MFA Status</th>
                <th style={{ padding: '12px' }}>Account Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.2)' }}>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--accent-green)', fontSize: '0.8rem' }}>
                    <ShieldCheck size={14} style={{ display: 'inline', marginRight: '4px' }} /> {u.mfa}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-green">{u.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite User Modal Popup */}
      {showInviteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px',
        }}>
          <div className="glass-panel" style={{ width: '480px', maxWidth: '100%', padding: '24px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 800 }}>
                <UserPlus size={20} color="var(--accent-purple)" /> Invite Team Member
              </div>
              <button onClick={() => setShowInviteModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleInviteUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                  User Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Vance"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid var(--border-color)', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                  Work Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. alex.vance@company.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid var(--border-color)', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                  Assigned RBAC Role *
                </label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as UserRole)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid var(--border-color)', color: 'var(--text-main)', outline: 'none' }}
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Security Analyst">Security Analyst</option>
                  <option value="Client Admin">Client Admin</option>
                  <option value="Developer">Developer</option>
                  <option value="Executive Viewer">Executive Viewer</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  id="mfa-checkbox"
                  checked={inviteMfa}
                  onChange={e => setInviteMfa(e.target.checked)}
                />
                <label htmlFor="mfa-checkbox" style={{ cursor: 'pointer', color: 'var(--text-main)' }}>
                  Mandate Multi-Factor Authentication (MFA / TOTP)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <CheckCircle2 size={16} /> Send Invitation Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invitation Magic Link Dispatched Modal */}
      {showInviteSuccessModal && lastInvitedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: '20px',
        }}>
          <div className="glass-panel" style={{ width: '520px', maxWidth: '100%', padding: '28px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={20} color="#166534" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>Invitation Email Dispatched!</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Onboarding link generated for {lastInvitedUser.name}</span>
                </div>
              </div>
              <button onClick={() => setShowInviteSuccessModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Recipient: <strong style={{ color: 'var(--text-main)' }}>{lastInvitedUser.name} ({lastInvitedUser.email})</strong></div>
                <div style={{ color: 'var(--text-muted)' }}>Assigned RBAC Role: <strong style={{ color: 'var(--accent-purple)' }}>{lastInvitedUser.role}</strong></div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                  Onboarding Magic Link (Expires in 48h):
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={lastInvitedUser.inviteLink}
                    style={{ flex: 1, padding: '10px', borderRadius: '6px', background: '#EDE9FE', border: '1px solid var(--accent-purple)', color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)', fontSize: '0.775rem', outline: 'none' }}
                  />
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      navigator.clipboard.writeText(lastInvitedUser.inviteLink);
                      setCopiedLinkSuccess(true);
                      setTimeout(() => setCopiedLinkSuccess(false), 2500);
                    }}
                    style={{ padding: '8px 14px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                  >
                    <Copy size={14} /> {copiedLinkSuccess ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
                💡 An invitation email has been dispatched via SMTP. You can also manually copy and send the Magic Link above directly to the user.
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => {
                    window.location.href = lastInvitedUser.inviteLink;
                  }}
                  style={{ borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
                >
                  <ExternalLink size={14} /> Test Open Link (Simulate Recipient)
                </button>
                <button type="button" className="btn-primary" onClick={() => setShowInviteSuccessModal(false)}>
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 3: AUDIT LOGS */}
      {activeSubTab === 'audit' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Security Audit Trail (WORM Log)</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Immutable record of all security scans, finding edits, and AI generation requests.</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#090D16', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 10px', width: '260px' }}>
              <Search size={14} color="var(--text-dim)" />
              <input
                type="text"
                placeholder="Filter logs..."
                value={searchLog}
                onChange={e => setSearchLog(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.8rem', width: '100%', outline: 'none' }}
              />
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px' }}>Timestamp (UTC)</th>
                <th style={{ padding: '10px' }}>Actor</th>
                <th style={{ padding: '10px' }}>Action</th>
                <th style={{ padding: '10px' }}>Log Details</th>
                <th style={{ padding: '10px' }}>Client IP</th>
                <th style={{ padding: '10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.3)' }}>
                  <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{l.timestamp}</td>
                  <td style={{ padding: '10px', fontWeight: 600 }}>{l.user}</td>
                  <td style={{ padding: '10px' }}>
                    <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{l.action}</span>
                  </td>
                  <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{l.details}</td>
                  <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{l.ip}</td>
                  <td style={{ padding: '10px' }}>
                    <span className={`badge badge-${l.status === 'SUCCESS' ? 'green' : 'critical'}`} style={{ fontSize: '0.65rem' }}>
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
