import React, { useState } from 'react';
import { Bell, User, Building, ChevronDown, CheckCircle2, Plus, LogOut } from 'lucide-react';
import type { Tenant, UserRole } from '../types';
import { MOCK_TENANTS } from '../services/storage';

interface NavbarProps {
  tenant: Tenant;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onTenantChange: (tenant: Tenant) => void;
  onOpenRegisterModal?: () => void;
  onSignOut?: () => void;
  notificationCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  tenant,
  currentRole,
  onRoleChange,
  onTenantChange,
  onOpenRegisterModal,
  onSignOut,
  notificationCount,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const roles: UserRole[] = [
    'Super Admin',
    'Security Analyst',
    'Client Admin',
    'Developer',
    'Executive Viewer',
  ];

  return (
    <header style={{
      height: '68px',
      background: '#FFFFFF',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: '0 2px 10px rgba(124, 58, 237, 0.04)',
    }}>
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img
          src="/vulnwiz_logo_transparent.png"
          alt="VulnWiz AI Official Logo"
          style={{
            height: '46px',
            width: 'auto',
            objectFit: 'contain',
            mixBlendMode: 'multiply',
          }}
        />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              VulnWiz <span style={{ color: 'var(--accent-purple)' }}>AI</span>
            </span>
            <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>PRO SaaS</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Smart Security Solution
          </span>
        </div>
      </div>

      {/* Center Multi-Tenant Switcher */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowTenantDropdown(!showTenantDropdown)}
          style={{
            background: '#F8FAFC',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Building size={14} color="var(--accent-purple)" />
          <span style={{ color: 'var(--text-muted)' }}>Tenant:</span>
          <strong style={{ color: 'var(--text-main)' }}>{tenant.name}</strong>
          <span className="badge badge-green" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>
            {tenant.plan}
          </span>
          <ChevronDown size={14} color="var(--text-dim)" />
        </button>

        {showTenantDropdown && (
          <div className="glass-panel" style={{
            position: 'absolute',
            left: 0,
            top: '44px',
            width: '320px',
            padding: '8px',
            zIndex: 50,
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', padding: '6px 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Switch Active Organization Tenant
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {MOCK_TENANTS.map(t => {
                const isSelected = tenant.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      onTenantChange(t);
                      setShowTenantDropdown(false);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: isSelected ? '#EDE9FE' : 'transparent',
                      border: isSelected ? '1px solid var(--accent-purple)' : '1px solid transparent',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? 'var(--accent-purple)' : 'var(--text-main)' }}>
                        {t.name}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>
                        {t.domain} • Score: <strong style={{ color: t.securityScore >= 80 ? 'var(--accent-green)' : 'var(--severity-high)' }}>{t.securityScore}/100</strong>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={16} color="var(--accent-purple)" />}
                  </div>
                );
              })}
            </div>

            {onOpenRegisterModal && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => {
                    setShowTenantDropdown(false);
                    onOpenRegisterModal();
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px dashed var(--accent-purple)',
                    background: '#EDE9FE',
                    color: 'var(--accent-purple)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Plus size={14} /> Register New Tenant (Model A)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Role Switcher & Notifications & User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Role Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <span style={{ color: 'var(--text-dim)' }}>Role:</span>
            <strong style={{ color: 'var(--accent-purple)' }}>{currentRole}</strong>
            <ChevronDown size={14} />
          </button>

          {showRoleDropdown && (
            <div className="glass-panel" style={{
              position: 'absolute',
              right: 0,
              top: '44px',
              width: '200px',
              padding: '8px',
              zIndex: 50,
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', padding: '4px 8px' }}>
                Switch User View Mode
              </div>
              {roles.map(r => (
                <div
                  key={r}
                  onClick={() => {
                    onRoleChange(r);
                    setShowRoleDropdown(false);
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: currentRole === r ? '#EDE9FE' : 'transparent',
                    color: currentRole === r ? 'var(--accent-purple)' : 'var(--text-main)',
                  }}
                >
                  <span>{r}</span>
                  {currentRole === r && <CheckCircle2 size={14} color="var(--accent-purple)" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            style={{
              background: '#F8FAFC',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-main)',
              position: 'relative',
            }}
          >
            <Bell size={18} color="var(--text-muted)" />
            {notificationCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--accent-red)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {notificationCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="glass-panel" style={{
              position: 'absolute',
              right: 0,
              top: '46px',
              width: '280px',
              padding: '12px',
              zIndex: 50,
            }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Security Alerts</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)' }}>Real-time</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ padding: '8px', borderRadius: '6px', background: '#FEE2E2', borderLeft: '3px solid var(--accent-red)', fontSize: '0.75rem' }}>
                  <strong style={{ color: '#991B1B' }}>Critical Vulnerability Discovered</strong>
                  <div style={{ color: '#7F1D1D' }}>CVE-2024-3094 on DMZ Server</div>
                </div>
                <div style={{ padding: '8px', borderRadius: '6px', background: '#EDE9FE', borderLeft: '3px solid var(--accent-purple)', fontSize: '0.75rem' }}>
                  <strong style={{ color: '#6D28D9' }}>Scan Completed Successfully</strong>
                  <div style={{ color: '#4C1D95' }}>Customer Portal OWASP Active Scan</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
          }}>
            <User size={18} color="#FFFFFF" />
          </div>

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="btn-secondary"
              title="Sign Out of Account"
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                color: 'var(--accent-red)',
                borderColor: '#FCA5A5',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
