import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Building, 
  ShieldCheck, 
  Key, 
  CheckCircle2, 
  Sparkles,
  Lock,
  Save
} from 'lucide-react';
import type { UserAccount } from '../../types';
import { getRolePermissions } from '../../services/rbacService';
import { setCurrentUser, saveUsers, getUsers, validateStrongPassword } from '../../services/saasAuthService';
import { PasswordRequirementsChecklist } from '../Auth/PasswordRequirementsChecklist';

interface UserProfileModalProps {
  user: UserAccount | null;
  onClose: () => void;
  onUpdateUser?: (updated: UserAccount) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  onClose,
  onUpdateUser,
}) => {
  // Fallback user details if guest/mock
  const activeUser: UserAccount = user || {
    id: 'usr-acme-admin-01',
    fullName: 'Charlen Baloukjy',
    email: 'charlen@acmefinancial.com',
    companyName: 'Acme Financial Security Inc.',
    role: 'Super Admin',
    industry: 'FinTech & Banking Services',
    companySize: '250-500',
    status: 'ACTIVE',
    createdAt: '2026-08-01 10:00:00',
    selectedPlan: 'Enterprise MSSP',
    billingCycle: 'annual',
    phone: '+1 (555) 234-8901',
  };

  const [fullName, setFullName] = useState(activeUser.fullName);
  const [phone, setPhone] = useState(activeUser.phone || '');
  const [industry, setIndustry] = useState(activeUser.industry || 'Technology & Financial Services');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Security password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const rolePerms = getRolePermissions(activeUser.role);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserAccount = {
      ...activeUser,
      fullName,
      phone,
      industry,
    };

    // Save to storage
    const users = getUsers();
    const idx = users.findIndex(u => u.id === activeUser.id);
    if (idx !== -1) {
      users[idx] = updated;
      saveUsers(users);
    }
    setCurrentUser(updated);

    if (onUpdateUser) {
      onUpdateUser(updated);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    const passwordVal = validateStrongPassword(newPassword);
    if (!passwordVal.isValid) {
      setPasswordError(`Password does not meet security requirements: ${passwordVal.errors.join(', ')}.`);
      return;
    }

    const updated: UserAccount = {
      ...activeUser,
      passwordHash: 'hashed_' + btoa(newPassword),
    };

    const users = getUsers();
    const idx = users.findIndex(u => u.id === activeUser.id);
    if (idx !== -1) {
      users[idx] = updated;
      saveUsers(users);
    }
    setCurrentUser(updated);

    setCurrentPassword('');
    setNewPassword('');
    setPasswordSuccess(true);
    setTimeout(() => setPasswordSuccess(false), 2500);
  };

  return (
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
      zIndex: 9999,
      padding: '20px',
    }}>
      <div 
        style={{
          width: '720px',
          maxWidth: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '32px',
          background: '#FFFFFF',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(124, 58, 237, 0.2), 0 0 20px rgba(0, 0, 0, 0.06)',
          position: 'relative',
          color: '#0F172A',
        }}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1.25rem',
            }}>
              {activeUser.fullName ? activeUser.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  {activeUser.fullName}
                </h2>
                <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                  {activeUser.status}
                </span>
              </div>
              <div style={{ fontSize: '0.825rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <Mail size={14} color="var(--accent-purple)" />
                <span>{activeUser.email}</span>
                <span>•</span>
                <Building size={14} color="var(--accent-purple)" />
                <strong style={{ color: '#0F172A' }}>{activeUser.companyName}</strong>
              </div>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              color: '#64748B',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              transition: 'all 0.2s',
            }}
          >
            ✕
          </button>
        </div>

        {/* User Summary Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%)',
          border: '1px solid #DDD6FE',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          <div>
            <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Assigned RBAC Role
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={18} color="var(--accent-purple)" />
              {activeUser.role}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Tenant Subscription
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={18} color="var(--accent-purple)" />
              {activeUser.selectedPlan || 'Enterprise MSSP'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Account Identifier
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)' }}>
              {activeUser.id}
            </div>
          </div>
        </div>

        {/* Profile Content Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Section 1: User Account & Contact Details */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="var(--accent-purple)" /> Personal & Professional Details
            </h3>

            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    background: '#FFFFFF',
                    border: '1px solid var(--accent-purple)',
                    color: 'var(--accent-purple)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Work Email Address
                </label>
                <input
                  type="email"
                  readOnly
                  disabled
                  value={activeUser.email}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    background: '#F1F5F9',
                    border: '1px solid #E2E8F0',
                    color: '#64748B',
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    cursor: 'not-allowed',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Phone Contact
                </label>
                <input
                  type="text"
                  placeholder="e.g. +1 (555) 234-8901"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    background: '#FFFFFF',
                    border: '1px solid var(--accent-purple)',
                    color: 'var(--accent-purple)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Industry Vertical
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    background: '#FFFFFF',
                    border: '1px solid var(--accent-purple)',
                    color: 'var(--accent-purple)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  <Save size={16} /> Save Profile Changes
                </button>
                {savedSuccess && (
                  <span style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={16} /> Profile updated!
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Section 2: Role Permissions Scoping */}
          <div style={{ background: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '18px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="var(--accent-purple)" /> Role Capabilities ({activeUser.role})
            </h4>
            <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '12px' }}>
              {rolePerms.description}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.775rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color={rolePerms.canAddAsset ? '#059669' : '#94A3B8'} />
                <span style={{ color: rolePerms.canAddAsset ? '#0F172A' : '#94A3B8', fontWeight: rolePerms.canAddAsset ? 600 : 400 }}>Register Assets</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color={rolePerms.canTriggerScan ? '#059669' : '#94A3B8'} />
                <span style={{ color: rolePerms.canTriggerScan ? '#0F172A' : '#94A3B8', fontWeight: rolePerms.canTriggerScan ? 600 : 400 }}>Trigger Scans</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color={rolePerms.canUpdateVulnStatus ? '#059669' : '#94A3B8'} />
                <span style={{ color: rolePerms.canUpdateVulnStatus ? '#0F172A' : '#94A3B8', fontWeight: rolePerms.canUpdateVulnStatus ? 600 : 400 }}>Update Vulnerabilities</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color={rolePerms.canManageTenant ? '#059669' : '#94A3B8'} />
                <span style={{ color: rolePerms.canManageTenant ? '#0F172A' : '#94A3B8', fontWeight: rolePerms.canManageTenant ? 600 : 400 }}>Tenant Administration</span>
              </div>
            </div>
          </div>

          {/* Section 3: Security & Password Update */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} color="var(--accent-purple)" /> Security & Credentials
            </h3>

            <form onSubmit={handleChangePassword} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#0F172A',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#0F172A',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <PasswordRequirementsChecklist password={newPassword} />
              </div>

              {passwordError && (
                <div style={{ gridColumn: '1 / -1', padding: '10px 12px', borderRadius: '6px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '0.8rem', fontWeight: 600 }}>
                  {passwordError}
                </div>
              )}

              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button type="submit" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  <Lock size={14} /> Update Password
                </button>
                {passwordSuccess && (
                  <span style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={16} /> Password updated successfully!
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Footer Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <button type="button" className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
