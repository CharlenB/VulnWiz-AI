import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  ShieldCheck, 
  FileSpreadsheet
} from 'lucide-react';
import type { Tenant, Vulnerability, Asset } from '../../types';

interface ReportGeneratorViewProps {
  tenant: Tenant;
  vulnerabilities: Vulnerability[];
  assets: Asset[];
}

export const ReportGeneratorView: React.FC<ReportGeneratorViewProps> = ({
  tenant,
  vulnerabilities,
  assets,
}) => {
  const [reportType, setReportType] = useState<'executive' | 'technical'>('executive');
  const [includeEvidence, setIncludeEvidence] = useState<boolean>(true);
  const [includeCodeFixes, setIncludeCodeFixes] = useState<boolean>(true);

  const criticals = vulnerabilities.filter(v => v.severity === 'critical');
  const highs = vulnerabilities.filter(v => v.severity === 'high');
  const mediums = vulnerabilities.filter(v => v.severity === 'medium');
  const lows = vulnerabilities.filter(v => v.severity === 'low');

  const handleDownloadPdf = () => {
    const element = document.getElementById('report-document-sheet');
    if (!element) return;

    const filename = `vulnwiz-executive-report-${tenant.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;

    const runHtml2Pdf = () => {
      const opt = {
        margin: [0.3, 0.3, 0.3, 0.3],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      (window as any).html2pdf().set(opt).from(element).save();
    };

    if ((window as any).html2pdf) {
      runHtml2Pdf();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => {
        runHtml2Pdf();
      };
      script.onerror = () => {
        // Fallback: If offline or CDN blocked, generate an HTML report blob download directly
        const blob = new Blob([`
          <!DOCTYPE html>
          <html>
          <head>
            <title>VulnWiz AI Executive Report</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #0F172A; }
              h1 { color: #7C3AED; }
              .badge { padding: 4px 8px; border-radius: 4px; font-weight: bold; }
              .critical { background: #FEE2E2; color: #991B1B; }
            </style>
          </head>
          <body>
            ${element.innerHTML}
          </body>
          </html>
        `], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vulnwiz-executive-report-${tenant.name.toLowerCase().replace(/\s+/g, '-')}.html`;
        a.click();
      };
      document.body.appendChild(script);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const headers = 'CVE ID,Severity,CVSS Score,Title,Asset Target,Status,Discovered Date\n';
    const rows = vulnerabilities.map(v => 
      `"${v.cveId || v.id}","${v.severity}",${v.cvssScore},"${v.title.replace(/"/g, '""')}","${v.assetName}","${v.status}","${v.discoveredDate}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vulnwiz-technical-report-${tenant.name.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
  };

  const handleDownloadJson = () => {
    const data = {
      tenant,
      generatedAt: new Date().toISOString(),
      summary: {
        totalAssets: assets.length,
        totalVulnerabilities: vulnerabilities.length,
        securityScore: tenant.securityScore,
        severityCounts: {
          critical: criticals.length,
          high: highs.length,
          medium: mediums.length,
          low: lows.length,
        },
      },
      vulnerabilities,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vulnwiz-report-${tenant.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Export Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Security Report Generator
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Generate executive summaries for board review and technical vulnerability exports for engineering teams.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={handleDownloadJson}>
            <Download size={16} /> JSON Export
          </button>
          <button className="btn-secondary" onClick={handleDownloadCsv}>
            <FileSpreadsheet size={16} /> Technical CSV
          </button>
          <button className="btn-secondary" onClick={handlePrintPdf}>
            <Printer size={16} /> Print / Browser PDF
          </button>
          <button className="btn-primary" onClick={handleDownloadPdf}>
            <Download size={16} /> Download Executive PDF
          </button>
        </div>
      </div>

      {/* Options & Preview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Left Options Panel */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Report Customization</h3>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
              Report Type
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setReportType('executive')}
                className={reportType === 'executive' ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Executive Summary
              </button>
              <button
                onClick={() => setReportType('technical')}
                className={reportType === 'technical' ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Technical Findings
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
              Included Sections
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={includeEvidence} onChange={e => setIncludeEvidence(e.target.checked)} />
                Proof of Concept Evidence Logs
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={includeCodeFixes} onChange={e => setIncludeCodeFixes(e.target.checked)} />
                AI Production Code Remediation Snippets
              </label>
            </div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
            <strong style={{ color: 'var(--accent-purple)' }}>Report Metadata:</strong>
            <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
              Organization: {tenant.name}<br />
              Generated Date: {new Date().toLocaleDateString()}<br />
              Classification: STRICTLY CONFIDENTIAL
            </div>
          </div>
        </div>

        {/* Right Pristine White PDF / Document Interactive Previewer */}
        <div id="report-document-sheet" className="glass-panel" style={{
          padding: '36px',
          gridColumn: 'span 2',
          background: '#FFFFFF',
          border: '1px solid #CBD5E1',
          boxShadow: '0 10px 40px rgba(124, 58, 237, 0.08)',
          color: '#0F172A',
        }}>
          {/* Printable Document Sheet Container */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Report Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid var(--accent-purple)', paddingBottom: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>
                  <ShieldCheck size={32} color="var(--accent-purple)" /> VulnWiz AI Assessment Report
                </div>
                <div style={{ fontSize: '0.875rem', color: '#475569', marginTop: '4px', fontWeight: 500 }}>
                  {reportType === 'executive' ? 'C-Level Executive Security Summary' : 'Full Technical Vulnerability Audit'}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.825rem', color: '#475569', lineHeight: 1.5 }}>
                <div><strong>Client:</strong> {tenant.name}</div>
                <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                <div><strong>Security Rating:</strong> <span style={{ color: 'var(--accent-purple)', fontWeight: 800, fontSize: '0.95rem' }}>{tenant.securityScore}/100</span></div>
              </div>
            </div>

            {/* Executive Summary Narrative */}
            {reportType === 'executive' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px', color: 'var(--accent-purple)' }}>
                    Executive Risk Overview
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#1E293B', lineHeight: 1.6 }}>
                    During the recent automated continuous assessment sweep across <strong>{assets.length} core digital assets</strong>, VulnWiz AI identified <strong>{vulnerabilities.length} active vulnerabilities</strong>. Of these, <strong style={{ color: '#DC2626' }}>{criticals.length} critical findings</strong> pose an immediate risk of unauthenticated remote access and customer data exposure.
                  </p>
                </div>

                {/* KPI Metrics Table */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', textAlign: 'center' }}>
                  <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', padding: '14px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#991B1B' }}>{criticals.length}</div>
                    <div style={{ fontSize: '0.75rem', color: '#7F1D1D', fontWeight: 600 }}>Critical Risks</div>
                  </div>
                  <div style={{ background: '#FFEDD5', border: '1px solid #FDBA74', padding: '14px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#9A3412' }}>{highs.length}</div>
                    <div style={{ fontSize: '0.75rem', color: '#7C2D12', fontWeight: 600 }}>High Risks</div>
                  </div>
                  <div style={{ background: '#FEF3C7', border: '1px solid #FDE047', padding: '14px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#92400E' }}>{mediums.length}</div>
                    <div style={{ fontSize: '0.75rem', color: '#78350F', fontWeight: 600 }}>Medium Risks</div>
                  </div>
                  <div style={{ background: '#DBEAFE', border: '1px solid #93C5FD', padding: '14px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1E40AF' }}>{lows.length}</div>
                    <div style={{ fontSize: '0.75rem', color: '#1E3A8A', fontWeight: 600 }}>Low Risks</div>
                  </div>
                </div>
              </div>
            )}

            {/* Findings Detail List */}
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', color: 'var(--accent-purple)' }}>
                Top Priority Remediation Matrix
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {vulnerabilities.map(v => (
                  <div key={v.id} style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={`badge badge-${v.severity}`}>{v.cvssScore} {v.severity.toUpperCase()}</span>
                        <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>{v.title}</strong>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 600 }}>{v.cveId || v.id}</span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                      <strong>Target:</strong> {v.assetName} (<code style={{ color: 'var(--accent-purple)' }}>{v.affectedUrlOrPort}</code>)
                    </div>

                    {includeEvidence && (
                      <div style={{ fontSize: '0.8rem', color: '#334155', background: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                        <strong style={{ color: '#0F172A' }}>Proof of Concept:</strong> <code style={{ color: '#2563EB', fontFamily: 'var(--font-mono)' }}>{v.proofOfConcept}</code>
                      </div>
                    )}

                    {includeCodeFixes && v.codeFixSnippet && (
                      <pre style={{
                        background: '#F1F5F9',
                        border: '1px solid #CBD5E1',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        color: '#4C1D95',
                        fontSize: '0.8rem',
                        fontFamily: 'var(--font-mono)',
                        overflowX: 'auto',
                      }}>
                        {v.codeFixSnippet}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
