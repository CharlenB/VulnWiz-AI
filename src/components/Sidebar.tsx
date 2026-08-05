import React from 'react';
import { 
  LayoutDashboard, 
  Server, 
  Globe,
  Radar, 
  Bug, 
  Bot, 
  Database, 
  FileText, 
  Settings,
  Activity,
  Layers,
  Award
} from 'lucide-react';
import type { UserRole } from '../types';
import { isTabAllowedForRole, getRolePermissions } from '../services/rbacService';

export type NavTab = 
  | 'dashboard' 
  | 'assets' 
  | 'easm'
  | 'scanner' 
  | 'vulnerabilities' 
  | 'ai-analyst' 
  | 'database' 
  | 'sbom'
  | 'compliance'
  | 'reports' 
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  openCriticalsCount: number;
  currentRole: UserRole;
}

interface MenuSection {
  title: string;
  items: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, openCriticalsCount, currentRole }) => {
  const rolePerms = getRolePermissions(currentRole);

  const rawSections: MenuSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: <LayoutDashboard size={16} /> },
      ],
    },
    {
      title: 'ATTACK SURFACE',
      items: [
        { id: 'assets', label: 'Asset Inventory', icon: <Server size={16} /> },
        { id: 'easm', label: 'External Recon (EASM)', icon: <Globe size={16} /> },
        { id: 'scanner', label: 'Vulnerability Scanner', icon: <Radar size={16} /> },
      ],
    },
    {
      title: 'RISK & AI ANALYTICS',
      items: [
        { id: 'vulnerabilities', label: 'Lifecycle Management', icon: <Bug size={16} />, badge: openCriticalsCount },
        { id: 'ai-analyst', label: 'AI Security Analyst', icon: <Bot size={16} /> },
        { id: 'sbom', label: 'SBOM & Supply Chain', icon: <Layers size={16} /> },
      ],
    },
    {
      title: 'GOVERNANCE & REPORTS',
      items: [
        { id: 'compliance', label: 'Compliance Readiness', icon: <Award size={16} /> },
        { id: 'database', label: 'Threat Intel Hub', icon: <Database size={16} /> },
        { id: 'reports', label: 'Security Reports', icon: <FileText size={16} /> },
        { id: 'settings', label: 'Tenant & Audit Logs', icon: <Settings size={16} /> },
      ],
    },
  ];

  // Filter sections by current user role permissions
  const sections = rawSections.map(sec => ({
    ...sec,
    items: sec.items.filter(item => isTabAllowedForRole(item.id, currentRole))
  })).filter(sec => sec.items.length > 0);

  return (
    <aside style={{
      width: '260px',
      background: '#FFFFFF',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '16px 10px',
      height: 'calc(100vh - 68px)',
      position: 'sticky',
      top: '68px',
      boxShadow: '2px 0 10px rgba(124, 58, 237, 0.02)',
    }}>
      {/* Navigation List with Section Headers */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        overflowY: 'auto',
        paddingRight: '4px',
      }}>
        {/* Active Role Permission Banner */}
        <div style={{
          padding: '8px 10px',
          borderRadius: '6px',
          background: '#F8FAFC',
          border: '1px solid var(--border-color)',
          fontSize: '0.725rem',
          color: 'var(--text-dim)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong style={{ color: 'var(--text-main)', fontSize: '0.75rem' }}>Active RBAC Mode</strong>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: rolePerms.roleBadgeColor, background: '#EDE9FE', padding: '1px 6px', borderRadius: '4px' }}>
              {currentRole}
            </span>
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.2, marginTop: '2px' }}>
            {rolePerms.description}
          </div>
        </div>

        {sections.map((section, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{
              padding: '2px 10px',
              fontSize: '0.65rem',
              fontWeight: 800,
              color: 'var(--text-dim)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              {section.title}
            </div>

            {section.items.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: isActive ? 'linear-gradient(90deg, rgba(124, 58, 237, 0.12) 0%, rgba(99, 102, 241, 0.04) 100%)' : 'transparent',
                    color: isActive ? 'var(--accent-purple)' : 'var(--text-muted)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease-in-out',
                    borderLeft: isActive ? '3px solid var(--accent-purple)' : '3px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="badge badge-critical" style={{ padding: '1px 5px', fontSize: '0.6rem' }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Cyber System Telemetry Box */}
      <div className="glass-panel" style={{ padding: '12px', marginTop: '12px', background: '#F8FAFC' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.725rem', fontWeight: 600, color: 'var(--accent-green)' }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: 'var(--accent-green)',
              boxShadow: '0 0 8px var(--accent-green)',
            }} />
            ENGINE ONLINE
          </div>
          <Activity size={14} color="var(--accent-green)" />
        </div>
        <div style={{ fontSize: '0.675rem', color: 'var(--text-dim)', lineHeight: 1.3 }}>
          Continuous Worker: <strong style={{ color: 'var(--text-main)' }}>Idle</strong><br />
          Threat Feeds: <strong style={{ color: 'var(--text-main)' }}>NVD / OWASP Sync</strong>
        </div>
        <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-color)', fontSize: '0.625rem', color: 'var(--text-dim)', textAlign: 'center' }}>
          <div>Copyright © 2026 VulnWiz AI for LAU.AI</div>
          <div style={{ fontWeight: 700, color: 'var(--accent-purple)', marginTop: '1px' }}>Developed by Charlen Baloukjy</div>
        </div>
      </div>
    </aside>
  );
};
