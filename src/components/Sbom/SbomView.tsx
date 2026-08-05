import React, { useState } from 'react';
import { Package, ShieldAlert, CheckCircle2, Search } from 'lucide-react';
import type { SbomPackage } from '../../types';
import { INITIAL_SBOM_PACKAGES } from '../../services/storage';

export const SbomView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [packages] = useState<SbomPackage[]>(INITIAL_SBOM_PACKAGES);

  const filtered = packages.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.ecosystem.toLowerCase().includes(query.toLowerCase()) ||
    p.assetName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Software Bill of Materials (SBOM) & Supply Chain Security
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Continuous inventory of open-source libraries, packages, licenses, and supply-chain vulnerabilities across target assets.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Audited Packages</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{packages.length}</div>
        </div>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Vulnerable Dependencies</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--severity-critical)' }}>
            {packages.filter(p => p.status === 'vulnerable').length}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Patches Available</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
            {packages.filter(p => p.status === 'patch_available').length}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Verified Secure</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-green)' }}>
            {packages.filter(p => p.status === 'secure').length}
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={18} color="var(--accent-cyan)" />
        <input
          type="text"
          placeholder="Search package name, ecosystem (npm, PyPI, Go), or license..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.9rem', width: '100%', outline: 'none' }}
        />
      </div>

      {/* Package Table */}
      <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px' }}>Package / Component</th>
              <th style={{ padding: '12px' }}>Ecosystem</th>
              <th style={{ padding: '12px' }}>Installed Version</th>
              <th style={{ padding: '12px' }}>Recommended Patch</th>
              <th style={{ padding: '12px' }}>License</th>
              <th style={{ padding: '12px' }}>Target Asset</th>
              <th style={{ padding: '12px' }}>Supply Chain Risk</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.3)' }}>
                <td style={{ padding: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={16} color="var(--accent-cyan)" />
                    {p.name}
                  </div>
                </td>
                <td style={{ padding: '12px' }}>
                  <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{p.ecosystem}</span>
                </td>
                <td style={{ padding: '12px', fontFamily: 'var(--font-mono)' }}>{p.version}</td>
                <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>
                  {p.fixedVersion || 'Up to date'}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-dim)', fontSize: '0.75rem' }}>{p.license}</td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{p.assetName}</td>
                <td style={{ padding: '12px' }}>
                  {p.status === 'vulnerable' ? (
                    <span className="badge badge-critical">
                      <ShieldAlert size={12} /> {p.cveId}
                    </span>
                  ) : p.status === 'patch_available' ? (
                    <span className="badge badge-high">PATCH READY</span>
                  ) : (
                    <span className="badge badge-green">
                      <CheckCircle2 size={12} /> SECURE
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
