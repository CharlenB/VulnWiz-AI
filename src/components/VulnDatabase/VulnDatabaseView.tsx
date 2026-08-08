import React, { useState, useEffect } from 'react';
import { Database, Search, ShieldAlert, BookOpen, ExternalLink, X, Flame, Zap, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import type { NvdVulnIntel } from '../../types';
import { searchVulnerabilityIntelLive, OWASP_TOP_10_DESCRIPTIONS } from '../../services/vulnDbService';

export const VulnDatabaseView: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'nvd' | 'owasp'>('nvd');
  const [kevOnlyFilter, setKevOnlyFilter] = useState<boolean>(false);
  const [selectedCve, setSelectedCve] = useState<NvdVulnIntel | null>(null);

  const [results, setResults] = useState<NvdVulnIntel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedSource, setFeedSource] = useState<string>('Connecting to Live Databases...');
  const [totalKevCount, setTotalKevCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const timer = setTimeout(() => {
      searchVulnerabilityIntelLive(query, kevOnlyFilter)
        .then(res => {
          if (isMounted) {
            setResults(res.results);
            setFeedSource(res.source);
            setTotalKevCount(res.totalKevCount);
            setLoading(false);
          }
        })
        .catch(err => {
          console.error('Failed to query vulnerability intelligence:', err);
          if (isMounted) setLoading(false);
        });
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query, kevOnlyFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Vulnerability Intelligence Hub
            <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(0, 242, 254, 0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(0, 242, 254, 0.3)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={12} /> Live API Connected
            </span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Real-time threat feed integration with CISA Known Exploited Vulnerabilities (KEV), NVD, OWASP, and MITRE ATT&CK.
          </p>
        </div>

        {/* Live Feed Status Pill */}
        <div className="glass-panel" style={{ padding: '8px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.08)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981', animation: 'pulse 2s infinite' }}></span>
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{feedSource}</span>
          {totalKevCount > 0 && (
            <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, fontSize: '0.7rem' }}>
              {totalKevCount} Active Exploits Tracked
            </span>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', flexWrap: 'wrap' }}>
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
          <Database size={16} /> CISA KEV & NVD CVE Database
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
          {/* Controls Bar */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search Input */}
            <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
              <Search size={18} color="var(--accent-cyan)" />
              <input
                type="text"
                placeholder="Search live CVEs (e.g. CVE-2024-3094, Log4j, Linux, XZ Utils)..."
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
              {loading && <RefreshCw size={16} className="spin" color="var(--accent-cyan)" />}
            </div>

            {/* Filter Pill: CISA KEV Actively Exploited */}
            <button
              onClick={() => setKevOnlyFilter(!kevOnlyFilter)}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: kevOnlyFilter ? '1px solid #EF4444' : '1px solid var(--border-color)',
                background: kevOnlyFilter ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.03)',
                color: kevOnlyFilter ? '#EF4444' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <Flame size={16} color={kevOnlyFilter ? '#EF4444' : 'var(--text-muted)'} />
              CISA KEV (Actively Exploited Only)
            </button>
          </div>

          {/* Intel Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            {results.map(intel => (
              <div
                key={intel.cveId}
                className="glass-panel"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  border: intel.isExploitedInWild ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
                  boxShadow: intel.isExploitedInWild ? '0 0 15px rgba(239, 68, 68, 0.1)' : 'none',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '1.05rem' }}>
                        {intel.cveId}
                      </span>
                      {intel.sourceFeed === 'CISA KEV' && (
                        <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', fontWeight: 700, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                          CISA KEV
                        </span>
                      )}
                    </div>
                    <span className={`badge badge-${intel.severity}`}>
                      {intel.cvssScore} {intel.severity.toUpperCase()}
                    </span>
                  </div>

                  {intel.isExploitedInWild && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, marginBottom: '10px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                      <Flame size={14} /> EXPLOITED IN THE WILD (ACTIVE THREAT)
                    </div>
                  )}

                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px', lineHeight: 1.4 }}>{intel.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
                    {intel.description}
                  </p>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><strong>CWE / Type:</strong> {intel.cwe}</div>
                    <div><strong>MITRE ATT&CK:</strong> <code style={{ color: 'var(--accent-cyan)' }}>{intel.mitreTechnique}</code></div>
                  </div>
                </div>

                <button
                  className="btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '0.8rem', justifyContent: 'center', marginTop: '6px' }}
                  onClick={() => setSelectedCve(intel)}
                >
                  View Threat Intelligence <ExternalLink size={14} />
                </button>
              </div>
            ))}
          </div>

          {results.length === 0 && !loading && (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <ShieldAlert size={36} color="var(--accent-cyan)" style={{ marginBottom: '12px' }} />
              <h3>No matching vulnerabilities found</h3>
              <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>Try searching by CVE ID (e.g. CVE-2024-3094) or software component name.</p>
            </div>
          )}
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
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px',
        }}>
          <div className="glass-panel" style={{ width: '640px', maxWidth: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{selectedCve.cveId}</h2>
                <span className={`badge badge-${selectedCve.severity}`}>{selectedCve.cvssScore} CVSS</span>
              </div>
              <button onClick={() => setSelectedCve(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {selectedCve.isExploitedInWild && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#EF4444', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <AlertTriangle size={18} /> CISA Known Exploited Vulnerability Catalog Entry
                </div>
                <div>This vulnerability is actively exploited by threat actors in the wild. Priority patching is required.</div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedCve.title}</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>{selectedCve.description}</p>
              
              <div style={{ background: '#070B14', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><strong>Published/Added:</strong> {selectedCve.publishedDate}</div>
                <div><strong>Source Feed:</strong> {selectedCve.sourceFeed || 'Live Database'}</div>
                <div><strong>CWE Definition:</strong> {selectedCve.cwe}</div>
                <div><strong>MITRE ATT&CK:</strong> {selectedCve.mitreTechnique}</div>
              </div>

              {selectedCve.cisaRequiredAction && (
                <div style={{ background: 'rgba(0, 242, 254, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(0, 242, 254, 0.3)' }}>
                  <strong style={{ color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <CheckCircle size={16} /> CISA Mandated Remediation Action:
                  </strong>
                  <div style={{ color: 'var(--text-main)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    {selectedCve.cisaRequiredAction}
                  </div>
                  {selectedCve.cisaDueDate && (
                    <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#EF4444', fontWeight: 700 }}>
                      Remediation Due Date: {selectedCve.cisaDueDate}
                    </div>
                  )}
                </div>
              )}

              <div>
                <strong style={{ display: 'block', marginBottom: '6px' }}>Affected Software Packages & Systems:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedCve.affectedSoftware.map((s, i) => (
                    <span key={i} className="badge badge-low" style={{ fontSize: '0.78rem' }}>{s}</span>
                  ))}
                </div>
              </div>

              <div>
                <strong style={{ display: 'block', marginBottom: '6px' }}>External References & Advisories:</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {selectedCve.references.map((ref, idx) => (
                    <a key={idx} href={ref} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                      {ref} <ExternalLink size={12} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn-primary" onClick={() => setSelectedCve(null)}>
                Close Threat Intelligence Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

