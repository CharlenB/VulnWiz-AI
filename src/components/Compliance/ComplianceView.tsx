import React, { useState } from 'react';
import { Award, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ComplianceRequirement } from '../../types';
import { INITIAL_COMPLIANCE_REQUIREMENTS } from '../../services/storage';

export const ComplianceView: React.FC = () => {
  const [selectedStandard, setSelectedStandard] = useState<string>('all');
  const [requirements] = useState<ComplianceRequirement[]>(INITIAL_COMPLIANCE_REQUIREMENTS);

  const filtered = requirements.filter(r => selectedStandard === 'all' || r.standard === selectedStandard);
  
  const passed = requirements.filter(r => r.status === 'PASSED').length;
  const total = requirements.length;
  const compliancePct = Math.round((passed / total) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Regulatory Compliance Readiness Engine
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Map vulnerability assessment findings directly to PCI-DSS v4.0, SOC 2, ISO 27001, HIPAA, and NIST SP 800-53 security controls.
          </p>
        </div>

        {/* Readiness Badge */}
        <div className="glass-panel" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Compliance Audit Readiness</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: compliancePct >= 80 ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
              {compliancePct}% Passed
            </div>
          </div>
          <Award size={32} color="var(--accent-cyan)" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['all', 'PCI-DSS v4.0', 'SOC 2 Type II', 'ISO 27001:2022', 'HIPAA Security Rule'].map(std => (
          <button
            key={std}
            onClick={() => setSelectedStandard(std)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              background: selectedStandard === std ? 'rgba(0, 242, 254, 0.15)' : 'rgba(30, 41, 59, 0.4)',
              color: selectedStandard === std ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            {std}
          </button>
        ))}
      </div>

      {/* Control Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {filtered.map(req => (
          <div key={req.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{req.standard}</span>
                <span className={`badge badge-${req.status === 'PASSED' ? 'green' : 'critical'}`}>
                  {req.status === 'PASSED' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                  {req.status}
                </span>
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '0.9rem', marginBottom: '4px' }}>
                {req.controlId}: {req.controlTitle}
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {req.description}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-dim)' }}>Linked Failing Findings:</span>
              <strong style={{ color: req.relatedVulnCount > 0 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                {req.relatedVulnCount} Open Issues
              </strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
