import React, { useState } from 'react';
import { Database, Search, ShieldAlert, BookOpen, ExternalLink, X } from 'lucide-react';
import type { NvdVulnIntel } from '../../types';
import { searchVulnerabilityIntel, OWASP_TOP_10_DESCRIPTIONS } from '../../services/vulnDbService';

export const VulnDatabaseView: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'nvd' | 'owasp'>('nvd');
  const [selectedCve, setSelectedCve] = useState<NvdVulnIntel | null>(null);

  const results = searchVulnerabilityIntel(query);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Vulnerability Intelligence Hub
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Real-time threat feed integration with National Vulnerability Database (NVD), OWASP, CWE, and MITRE ATT&CK.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('nvd')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'nvd' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
            color: activeTab === 'nvd' ? 'var(--accent-cyan)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Database size={16} /> NVD CVE / CWE Intelligence Database
        </button>
        <button
          onClick={() => setActiveTab('owasp')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'owasp' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
            color: activeTab === 'owasp' ? 'var(--accent-cyan)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <BookOpen size={16} /> OWASP Top 10 Security Taxonomy
        </button>
      </div>

      {activeTab === 'nvd' ? (
        <>
          {/* Search bar */}
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Search size={18} color="var(--accent-cyan)" />
            <input
              type="text"
              placeholder="Search CVE (e.g. CVE-2024-3094), software name, or CWE..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.9rem',
                width: '100%',
                outline: 'none',
              }}
            />
          </div>

          {/* Intel Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {results.map(intel => (
              <div key={intel.cveId} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '1rem' }}>
                      {intel.cveId}
                    </span>
                    <span className={`badge badge-${intel.severity}`}>
                      {intel.cvssScore} {intel.severity.toUpperCase()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>{intel.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
                    {intel.description}
                  </p>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><strong>CWE Definition:</strong> {intel.cwe}</div>
                    <div><strong>MITRE ATT&CK:</strong> <code style={{ color: 'var(--accent-cyan)' }}>{intel.mitreTechnique}</code></div>
                  </div>
                </div>

                <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', justifyContent: 'center' }} onClick={() => setSelectedCve(intel)}>
                  View CVE Intel Details <ExternalLink size={14} />
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* OWASP TOP 10 Cards */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {Object.entries(OWASP_TOP_10_DESCRIPTIONS).map(([cat, info]) => (
            <div key={cat} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} color="var(--accent-cyan)" />
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>{cat}</span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{info.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{info.description}</p>
              <div style={{ background: '#070B14', padding: '10px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: 'var(--accent-green)' }}>Recommended Mitigation:</strong>
                <div style={{ color: 'var(--text-main)', marginTop: '2px' }}>{info.mitigation}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CVE Detail Modal */}
      {selectedCve && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px',
        }}>
          <div className="glass-panel" style={{ width: '600px', maxWidth: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{selectedCve.cveId}</h2>
                <span className={`badge badge-${selectedCve.severity}`}>{selectedCve.cvssScore} CVSS</span>
              </div>
              <button onClick={() => setSelectedCve(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedCve.title}</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>{selectedCve.description}</p>
              <div style={{ background: '#070B14', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div><strong>Published Date:</strong> {selectedCve.publishedDate}</div>
                <div><strong>CWE:</strong> {selectedCve.cwe}</div>
                <div><strong>OWASP Category:</strong> {selectedCve.owasp}</div>
                <div><strong>MITRE ATT&CK:</strong> {selectedCve.mitreTechnique}</div>
              </div>

              <div>
                <strong>Affected Software Packages:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {selectedCve.affectedSoftware.map((s, i) => (
                    <span key={i} className="badge badge-low">{s}</span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn-primary" onClick={() => setSelectedCve(null)}>
                Close Intelligence Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
