import React, { useState } from 'react';
import { Globe, Search, Plus, CheckCircle2, RefreshCw } from 'lucide-react';
import type { DiscoveredSubdomain, Asset } from '../../types';

interface EasmViewProps {
  onImportAsset: (asset: Asset) => void;
}

export const INITIAL_SUBDOMAINS: DiscoveredSubdomain[] = [
  {
    id: 'easm-01',
    subdomain: 'vpn.acmefinancial.com',
    ipAddress: '198.51.100.89',
    source: 'Certificate Transparency',
    httpStatus: 200,
    tlsIssuer: 'DigiCert TLS RSA SHA256',
    isMonitored: false,
    discoveredDate: '2026-08-05 14:00',
  },
  {
    id: 'easm-02',
    subdomain: 'dev-portal.acmefinancial.com',
    ipAddress: '198.51.100.90',
    source: 'DNS Passive Recon',
    httpStatus: 403,
    tlsIssuer: "Let's Encrypt Authority X3",
    isMonitored: false,
    discoveredDate: '2026-08-05 14:02',
  },
  {
    id: 'easm-03',
    subdomain: 'staging-api.acmefinancial.com',
    ipAddress: '198.51.100.91',
    source: 'Certificate Transparency',
    httpStatus: 200,
    tlsIssuer: 'Cloudflare Inc ECC CA-3',
    isMonitored: false,
    discoveredDate: '2026-08-05 14:05',
  },
  {
    id: 'easm-04',
    subdomain: 'legacy-billing.acmefinancial.com',
    ipAddress: '198.51.100.92',
    source: 'WHOIS Records',
    httpStatus: 200,
    tlsIssuer: 'Sectigo RSA Domain Validation',
    isMonitored: false,
    discoveredDate: '2026-08-05 14:10',
  },
];

export const EasmView: React.FC<EasmViewProps> = ({ onImportAsset }) => {
  const [rootDomain, setRootDomain] = useState('acmefinancial.com');
  const [subdomains, setSubdomains] = useState<DiscoveredSubdomain[]>(INITIAL_SUBDOMAINS);
  const [isScanning, setIsScanning] = useState(false);
  const [query, setQuery] = useState('');

  const handleRunRecon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootDomain) return;

    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const newSub: DiscoveredSubdomain = {
        id: `easm-${Date.now()}`,
        subdomain: `shadow-admin.${rootDomain}`,
        ipAddress: '198.51.100.99',
        source: 'Certificate Transparency',
        httpStatus: 200,
        tlsIssuer: "Let's Encrypt",
        isMonitored: false,
        discoveredDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      setSubdomains(prev => [newSub, ...prev]);
    }, 1500);
  };

  const handleImport = (sub: DiscoveredSubdomain) => {
    const newAsset: Asset = {
      id: `ast-${Date.now().toString().slice(-4)}`,
      name: `Discovered: ${sub.subdomain}`,
      target: `https://${sub.subdomain}`,
      type: 'web',
      owner: 'EASM Auto-Discovered',
      techStack: ['TLS 1.3', sub.tlsIssuer.slice(0, 15)],
      criticality: 'high',
      lastScanDate: 'Not scanned',
      vulnerabilityCounts: { critical: 0, high: 0, medium: 0, low: 0 },
      status: 'active',
    };
    onImportAsset(newAsset);

    setSubdomains(prev => prev.map(s => s.id === sub.id ? { ...s, isMonitored: true } : s));
  };

  const filtered = subdomains.filter(s => s.subdomain.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          External Attack Surface Management (EASM) & Passive Recon
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Automated subdomain discovery, Certificate Transparency log monitoring, and Shadow IT asset detection.
        </p>
      </div>

      {/* Root Domain Search Input */}
      <form onSubmit={handleRunRecon} className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#FFFFFF', border: '1px solid var(--accent-purple)', borderRadius: '8px', padding: '10px 14px', flex: 1, minWidth: '280px' }}>
          <Globe size={18} color="var(--accent-purple)" />
          <input
            type="text"
            placeholder="Enter corporate root domain (e.g. acmefinancial.com)..."
            value={rootDomain}
            onChange={e => setRootDomain(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-purple)', fontWeight: 600, fontSize: '0.9rem', width: '100%', outline: 'none' }}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={isScanning}>
          <RefreshCw size={16} className={isScanning ? 'pulse-active' : ''} />
          {isScanning ? 'Enumerating Subdomains...' : 'Run Passive Recon Sweep'}
        </button>
      </form>

      {/* Subdomains Table */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            Discovered Subdomains ({filtered.length})
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', border: '1px solid var(--accent-purple)', borderRadius: '6px', padding: '6px 12px', width: '260px' }}>
            <Search size={14} color="var(--accent-purple)" />
            <input
              type="text"
              placeholder="Filter subdomains..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-purple)', fontWeight: 600, fontSize: '0.8rem', width: '100%', outline: 'none' }}
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px' }}>Subdomain Target</th>
              <th style={{ padding: '12px' }}>IP Address</th>
              <th style={{ padding: '12px' }}>Recon Source</th>
              <th style={{ padding: '12px' }}>HTTP Status</th>
              <th style={{ padding: '12px' }}>TLS Certificate Issuer</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Asset Monitoring</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(sub => (
              <tr key={sub.id} style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.3)' }}>
                <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  https://{sub.subdomain}
                </td>
                <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{sub.ipAddress}</td>
                <td style={{ padding: '12px' }}>
                  <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{sub.source}</span>
                </td>
                <td style={{ padding: '12px' }}>
                  <span className={`badge badge-${sub.httpStatus === 200 ? 'green' : 'low'}`} style={{ fontSize: '0.7rem' }}>
                    HTTP {sub.httpStatus}
                  </span>
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{sub.tlsIssuer}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  {sub.isMonitored ? (
                    <span className="badge badge-green">
                      <CheckCircle2 size={12} /> MONITORED
                    </span>
                  ) : (
                    <button
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => handleImport(sub)}
                    >
                      <Plus size={12} /> Import to Inventory
                    </button>
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
