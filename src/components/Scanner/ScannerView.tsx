import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  ShieldCheck, 
  Play, 
  Terminal as TerminalIcon, 
  FileSignature, 
  X
} from 'lucide-react';
import type { Asset, ScanJob, ScanType, Vulnerability } from '../../types';
import { createScanJob, generateScanFindings } from '../../services/scannerEngine';

interface ScannerViewProps {
  assets: Asset[];
  onScanCompleted: (job: ScanJob, findings: Vulnerability[]) => void;
  initialAssetToScan?: Asset | null;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  assets,
  onScanCompleted,
  initialAssetToScan,
}) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    initialAssetToScan ? initialAssetToScan.id : assets[0]?.id || ''
  );
  const [scanType, setScanType] = useState<ScanType>('active_owasp');
  
  // Authorization modal
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authorizerName, setAuthorizerName] = useState<string>('Sarah Connor (CISO / Security Director)');
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);

  // Active Job State
  const [currentJob, setCurrentJob] = useState<ScanJob | null>(null);
  const [scanDiscoveredFindings, setScanDiscoveredFindings] = useState<Vulnerability[]>([]);

  const selectedAsset = assets.find(a => a.id === selectedAssetId) || assets[0];

  const handleStartScanRequest = () => {
    if (scanType === 'passive_posture') {
      // Safe assessment - trigger immediately
      launchScanJob('Automated System Audit', 'PASSIVE-AUTO-SIGNATURE-001');
    } else {
      // Requires explicit authorized testing approval
      setShowAuthModal(true);
    }
  };

  const launchScanJob = (authName: string, signatureHash: string) => {
    if (!selectedAsset) return;
    setShowAuthModal(false);

    const job = createScanJob(selectedAsset, scanType, authName, signatureHash);
    job.status = 'running';
    setCurrentJob(job);
    setScanDiscoveredFindings([]);
  };

  // Simulate scanning phases in terminal
  useEffect(() => {
    if (!currentJob || currentJob.status !== 'running') return;

    const timer = setInterval(() => {
      setCurrentJob(prev => {
        if (!prev) return null;
        const newProgress = Math.min(100, prev.progress + 15);
        let phase = prev.currentPhase;
        let newLogs = [...prev.logs];

        const timestamp = new Date().toLocaleTimeString();

        if (newProgress === 15) {
          phase = 'Port & TLS Cipher Enumeration...';
          newLogs.push(`[${timestamp}] [PORT] Probing TCP ports 22, 80, 443, 3306, 6379, 8080...`);
          newLogs.push(`[${timestamp}] [TLS] Validating TLS 1.2/1.3 Handshake & Cryptographic Ciphers...`);
        } else if (newProgress === 45) {
          phase = 'OWASP Top 10 Injection & Header Analysis...';
          newLogs.push(`[${timestamp}] [OWASP] Injecting SQLi & XSS payload patterns into dynamic query endpoints...`);
          newLogs.push(`[${timestamp}] [HEADER] Inspecting HSTS, CSP, X-Frame-Options, X-Content-Type-Options...`);
        } else if (newProgress === 75) {
          phase = 'API Authorization & Rate Limiting Assessment...';
          newLogs.push(`[${timestamp}] [API] Testing Bearer JWT signature validation & CORS Origin restrictions...`);
          newLogs.push(`[${timestamp}] [CLOUD] Audit S3 bucket policy & IAM public exposure boundaries...`);
        } else if (newProgress >= 100) {
          phase = 'Scan Finished - Synthesizing Findings...';
          newLogs.push(`[${timestamp}] [COMPLETE] Scan job finished cleanly. 0 critical errors encountered.`);
          
          // Generate findings
          const findings = generateScanFindings(selectedAsset, scanType);
          setScanDiscoveredFindings(findings);
          onScanCompleted({ ...prev, status: 'completed', progress: 100, findingsDiscovered: findings.length }, findings);

          return {
            ...prev,
            progress: 100,
            status: 'completed',
            currentPhase: phase,
            logs: newLogs,
            findingsDiscovered: findings.length,
          };
        }

        return {
          ...prev,
          progress: newProgress,
          currentPhase: phase,
          logs: newLogs,
        };
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [currentJob?.status]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Vulnerability Scanning Engine
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Execute authorized security assessments, OWASP Top 10 checks, infrastructure port scanning, and cloud posture audits.
        </p>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Left Config Panel */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radar size={20} color="var(--accent-cyan)" /> Configure Security Scan
          </h2>

          {/* Asset Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
              Select Target Asset *
            </label>
            <select
              value={selectedAssetId}
              onChange={e => setSelectedAssetId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: '#090D16',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontWeight: 600,
                outline: 'none',
              }}
            >
              {assets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.target}) - {a.type.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Target Summary Card */}
          {selectedAsset && (
            <div style={{
              background: '#070B14',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '0.8rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Target Endpoint:</span>
                <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{selectedAsset.target}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Asset Owner:</span>
                <span style={{ color: 'var(--text-muted)' }}>{selectedAsset.owner}</span>
              </div>
            </div>
          )}

          {/* Scan Type Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
              Assessment Methodology
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'passive_posture', title: 'Safe Assessment (Passive Posture)', desc: 'Banner grabbing, HTTP headers, TLS ciphers. No active payloads.' },
                { id: 'active_owasp', title: 'OWASP Top 10 Active Application Scan', desc: 'SQLi, XSS, CSRF, Auth flaws, Sensitive Data Exposure. (Requires Auth)' },
                { id: 'infra_port_ssl', title: 'Infrastructure Port & Service Scan', desc: 'Open port discovery (SSH, SSL, RDP, MySQL), service version audit.' },
                { id: 'api_security', title: 'API Security & Authorization Audit', desc: 'REST/gRPC endpoint evaluation, CORS, rate-limiting & JWT validation.' },
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setScanType(opt.id as ScanType)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: scanType === opt.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                    background: scanType === opt.id ? 'rgba(0, 242, 254, 0.08)' : 'rgba(30, 41, 59, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: scanType === opt.id ? 'var(--accent-cyan)' : 'var(--text-main)' }}>
                    {opt.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    {opt.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            onClick={handleStartScanRequest}
            disabled={currentJob?.status === 'running'}
          >
            <Play size={16} /> Launch Security Scan
          </button>
        </div>

        {/* Right Live Scan Execution Terminal */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TerminalIcon size={20} color="var(--accent-green)" /> Scan Terminal Execution Log
            </h2>
            {currentJob && (
              <span className={`badge badge-${currentJob.status === 'completed' ? 'green' : 'cyan'}`}>
                {currentJob.status.toUpperCase()} ({currentJob.progress}%)
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {currentJob && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                <span>Phase: {currentJob.currentPhase}</span>
                <span>{currentJob.progress}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#1E293B', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${currentJob.progress}%`, height: '100%', background: 'linear-gradient(90deg, #00F2FE, #4FACFE)', transition: 'width 0.4s ease' }} />
              </div>
            </div>
          )}

          {/* Terminal Console View */}
          <div className="terminal-window" style={{ minHeight: '260px' }}>
            {currentJob ? (
              currentJob.logs.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))
            ) : (
              <div style={{ color: 'var(--text-dim)', textAlign: 'center', paddingTop: '80px' }}>
                [STANDBY] Select target asset and click "Launch Security Scan" to begin assessment.
              </div>
            )}
          </div>

          {/* Discovered Findings Notification Banner */}
          {currentJob?.status === 'completed' && scanDiscoveredFindings.length > 0 && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--accent-red)',
              borderRadius: '8px',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <strong style={{ color: '#FCA5A5', fontSize: '0.9rem' }}>
                  ⚠️ Scan Completed: {scanDiscoveredFindings.length} Vulnerabilities Discovered
                </strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  New findings added to Vulnerability Lifecycle & AI Security Analyst pipeline.
                </div>
              </div>
              <span className="badge badge-critical">ACTION REQUIRED</span>
            </div>
          )}
        </div>
      </div>

      {/* Scope Authorization & Legal Agreement Modal */}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px',
        }}>
          <div className="glass-panel" style={{ width: '560px', maxWidth: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSignature size={22} color="var(--accent-cyan)" /> Authorized Testing Scope Agreement
              </h2>
              <button onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '0.8rem',
              color: '#FCA5A5',
              marginBottom: '16px',
            }}>
              <strong>CRITICAL SECURITY MANDATE:</strong> Per VulnWiz AI Security Rule 3, active scanning requires explicit written authorization from the system owner. Unauthorized security testing is illegal under the Computer Fraud and Abuse Act (CFAA) and international cybersecurity laws.
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
              <div><strong>Target Scope:</strong> <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{selectedAsset?.target}</span></div>
              <div><strong>Methodology:</strong> {scanType.toUpperCase()} Active Vulnerability Assessment</div>
              <div><strong>Organization:</strong> Acme Financial Security Inc.</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                Authorized Officer Name & Title *
              </label>
              <input
                type="text"
                value={authorizerName}
                onChange={e => setAuthorizerName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  background: '#090D16',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '20px' }}>
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptedTerms}
                onChange={e => setAcceptedTerms(e.target.checked)}
                style={{ marginTop: '3px' }}
              />
              <label htmlFor="acceptTerms" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                I confirm that I am authorized to order security assessments against target endpoint <code style={{ color: 'var(--accent-cyan)' }}>{selectedAsset?.target}</code>, and I approve generating a cryptographic audit certificate for this scan execution.
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn-secondary" onClick={() => setShowAuthModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                disabled={!acceptedTerms || !authorizerName}
                onClick={() => launchScanJob(authorizerName, `SIG-${Date.now()}-SHA256`)}
                style={{ opacity: (!acceptedTerms || !authorizerName) ? 0.5 : 1 }}
              >
                <ShieldCheck size={16} /> Sign & Authorize Scan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
