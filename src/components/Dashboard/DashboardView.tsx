import React from 'react';
import { 
  ShieldAlert, 
  Server, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight, 
  Radar, 
  FileCheck,
  Bot
} from 'lucide-react';
import type { Tenant, Vulnerability, Asset } from '../../types';
import type { NavTab } from '../Sidebar';

interface DashboardViewProps {
  tenant: Tenant;
  vulnerabilities: Vulnerability[];
  assets: Asset[];
  onNavigate: (tab: NavTab) => void;
  onSelectVuln: (vuln: Vulnerability) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tenant,
  vulnerabilities,
  assets,
  onNavigate,
  onSelectVuln,
}) => {
  const criticals = vulnerabilities.filter(v => v.severity === 'critical');
  const highs = vulnerabilities.filter(v => v.severity === 'high');
  const mediums = vulnerabilities.filter(v => v.severity === 'medium');
  const lows = vulnerabilities.filter(v => v.severity === 'low');

  const total = vulnerabilities.length || 1;
  const criticalPct = Math.round((criticals.length / total) * 100);
  const highPct = Math.round((highs.length / total) * 100);
  const mediumPct = Math.round((mediums.length / total) * 100);
  const lowPct = Math.round((lows.length / total) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner & Quick Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Enterprise Security Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Real-time threat exposure monitoring, continuous vulnerability management, and AI risk insights.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" onClick={() => onNavigate('scanner')}>
            <Radar size={16} />
            Start Authorized Scan
          </button>
          <button className="btn-secondary" onClick={() => onNavigate('reports')}>
            <FileCheck size={16} />
            Executive Report PDF
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
      }}>
        {/* Security Score Card */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>
              Security Posture Score
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '4px' }}>
              {tenant.securityScore}<span style={{ fontSize: '1.25rem', color: 'var(--text-dim)' }}>/100</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent-green)', marginTop: '4px' }}>
              <TrendingUp size={14} />
              +{tenant.securityScore - tenant.previousScore} pts vs last month
            </div>
          </div>
          <div className="gauge-container" style={{ width: '80px', height: '80px' }}>
            <svg width="80" height="80" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1E293B" strokeWidth="10" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="url(#cyanGradient)"
                strokeWidth="10"
                strokeDasharray="251"
                strokeDashoffset={251 - (251 * tenant.securityScore) / 100}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
              <defs>
                <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00F2FE" />
                  <stop offset="100%" stopColor="#4FACFE" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Monitored Assets */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>
              Monitored Assets
            </span>
            <Server size={18} color="var(--accent-blue)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{assets.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            {assets.filter(a => a.type === 'web').length} Web • {assets.filter(a => a.type === 'api').length} API • {assets.filter(a => a.type === 'infrastructure').length} Infra • {assets.filter(a => a.type === 'cloud').length} Cloud
          </div>
        </div>

        {/* Total Findings */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>
              Open Vulnerabilities
            </span>
            <AlertTriangle size={18} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{vulnerabilities.length}</div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
            <span className="badge badge-critical">{criticals.length} Critical</span>
            <span className="badge badge-high">{highs.length} High</span>
          </div>
        </div>

        {/* AI Remediation Velocity */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>
              AI SLA Compliance
            </span>
            <Bot size={18} color="var(--accent-purple)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-green)' }}>92%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Avg Remediation Time: 1.8 Days (24h Critical Target)
          </div>
        </div>
      </div>

      {/* Severity Breakdown Bar & Asset Exposure Distribution */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px',
      }}>
        {/* Severity Distribution */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
            Vulnerability Severity Distribution
          </h3>

          {/* Stacked Progress Bar */}
          <div style={{
            height: '24px',
            width: '100%',
            borderRadius: '6px',
            overflow: 'hidden',
            display: 'flex',
            marginBottom: '16px',
            background: '#1E293B',
          }}>
            <div style={{ width: `${criticalPct}%`, background: 'var(--severity-critical)' }} title="Critical" />
            <div style={{ width: `${highPct}%`, background: 'var(--severity-high)' }} title="High" />
            <div style={{ width: `${mediumPct}%`, background: 'var(--severity-medium)' }} title="Medium" />
            <div style={{ width: `${lowPct}%`, background: 'var(--severity-low)' }} title="Low" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.825rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--severity-critical)' }} />
              <span>Critical: <strong>{criticals.length} ({criticalPct}%)</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--severity-high)' }} />
              <span>High: <strong>{highs.length} ({highPct}%)</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--severity-medium)' }} />
              <span>Medium: <strong>{mediums.length} ({mediumPct}%)</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--severity-low)' }} />
              <span>Low: <strong>{lows.length} ({lowPct}%)</strong></span>
            </div>
          </div>
        </div>

        {/* Asset Risk Heatmap Preview */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
            Top Exposed Assets Risk Heatmap
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {assets.slice(0, 3).map(asset => (
              <div key={asset.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'transparent',
                borderBottom: '1px solid var(--border-color)',
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>{asset.name}</div>
                  <a 
                    href={asset.target} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ 
                      fontSize: '0.775rem', 
                      color: 'var(--accent-purple)', 
                      fontFamily: 'var(--font-mono)', 
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    {asset.target}
                  </a>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className="badge badge-critical">{asset.vulnerabilityCounts.critical} Crit</span>
                  <span className="badge badge-high">{asset.vulnerabilityCounts.high} High</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Immediate Attention: Critical Vulnerabilities Table */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={20} color="var(--accent-red)" />
              Critical Action Required (SLA 24-48 Hours)
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Highest risk vulnerabilities threatening core business systems
            </span>
          </div>
          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => onNavigate('vulnerabilities')}>
            View All Lifecycle Tickets <ArrowUpRight size={14} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px' }}>CVE / ID</th>
                <th style={{ padding: '12px' }}>Vulnerability Title</th>
                <th style={{ padding: '12px' }}>Target Asset</th>
                <th style={{ padding: '12px' }}>CVSS v3.1</th>
                <th style={{ padding: '12px' }}>Category</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>AI Action</th>
              </tr>
            </thead>
            <tbody>
              {criticals.concat(highs).slice(0, 4).map(vuln => (
                <tr key={vuln.id} style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.4)' }}>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                    {vuln.cveId || vuln.id}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{vuln.title}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{vuln.assetName}</td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge badge-${vuln.severity}`}>
                      {vuln.cvssScore} {vuln.severity.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-dim)' }}>{vuln.owaspCategory || vuln.category}</td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                      {vuln.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => {
                        onSelectVuln(vuln);
                        onNavigate('ai-analyst');
                      }}
                    >
                      <Bot size={12} color="var(--accent-cyan)" /> AI Analyze
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
