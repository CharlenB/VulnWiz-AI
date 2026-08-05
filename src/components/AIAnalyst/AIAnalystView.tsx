import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  ShieldCheck, 
  Copy, 
  Check, 
  FileText, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import type { Vulnerability, Asset } from '../../types';
import { generateAiAnalysis, generateAiChatResponse } from '../../services/aiAnalystService';
import type { AiAnalysisResult } from '../../services/aiAnalystService';

interface AIAnalystViewProps {
  vulnerabilities: Vulnerability[];
  assets: Asset[];
  selectedVulnForAi?: Vulnerability | null;
}

export const AIAnalystView: React.FC<AIAnalystViewProps> = ({
  vulnerabilities,
  assets,
  selectedVulnForAi,
}) => {
  const [activeTab, setActiveTab] = useState<'deep_dive' | 'chat'>('deep_dive');
  
  // Deep dive selection
  const [selectedVulnId, setSelectedVulnId] = useState<string>(
    selectedVulnForAi ? selectedVulnForAi.id : vulnerabilities[0]?.id || ''
  );
  
  const currentVuln = vulnerabilities.find(v => v.id === selectedVulnId) || vulnerabilities[0];
  const currentAsset = assets.find(a => a.id === currentVuln?.assetId);

  // Analysis result
  const [analysis, setAnalysis] = useState<AiAnalysisResult | null>(null);
  const [analysisTab, setAnalysisTab] = useState<'technical' | 'executive' | 'scenario' | 'code'>('technical');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Chat interface state
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'bot'; text: string; time: string }[]>([
    {
      sender: 'bot',
      text: '🤖 Welcome to **VulnWiz AI Virtual Security Analyst**. I am trained on OWASP ASVS, NIST SP 800-53, NVD CVE feeds, and MITRE ATT&CK frameworks. How can I assist with your risk remediation today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [userQuery, setUserQuery] = useState<string>('');

  useEffect(() => {
    if (selectedVulnForAi) {
      setSelectedVulnId(selectedVulnForAi.id);
    }
  }, [selectedVulnForAi]);

  useEffect(() => {
    if (currentVuln) {
      setAnalysis(generateAiAnalysis(currentVuln, currentAsset));
    }
  }, [selectedVulnId]);

  const handleCopyCode = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis.codeFix);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = { sender: 'user' as const, text: userQuery, time };
    setChatMessages(prev => [...prev, newMsg]);
    const q = userQuery;
    setUserQuery('');

    // Generate AI response
    setTimeout(() => {
      const responseText = generateAiChatResponse(q, vulnerabilities);
      setChatMessages(prev => [...prev, { sender: 'bot', text: responseText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              AI Security Analyst Assistant
            </h1>
            <span className="badge badge-cyan">
              <Sparkles size={12} /> AI Powered
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Automated technical explanations, executive risk translation, attack scenario generation, and secure code fixes.
          </p>
        </div>

        {/* Guardrail badge */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '0.75rem',
          color: 'var(--accent-green)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <ShieldCheck size={16} /> Grounding: OWASP & NVD Verified • Autonomous Exploitation Disabled
        </div>
      </div>

      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('deep_dive')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'deep_dive' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
            color: activeTab === 'deep_dive' ? 'var(--accent-cyan)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Bot size={16} /> Finding Deep Dive Analyzer
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'chat' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
            color: activeTab === 'chat' ? 'var(--accent-cyan)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Sparkles size={16} /> Interactive AI Analyst Chat
        </button>
      </div>

      {/* TAB 1: DEEP DIVE ANALYZER */}
      {activeTab === 'deep_dive' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* Left Selection */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Select Vulnerability Finding</h3>
            
            <select
              value={selectedVulnId}
              onChange={e => setSelectedVulnId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: '#F8FAFC',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontWeight: 600,
                outline: 'none',
              }}
            >
              {vulnerabilities.map(v => (
                <option key={v.id} value={v.id}>
                  [{v.severity.toUpperCase()}] {v.cveId || v.id} - {v.title.slice(0, 35)}...
                </option>
              ))}
            </select>

            {currentVuln && (
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-dim)' }}>CVSS Score:</span>
                  <span className={`badge badge-${currentVuln.severity}`}>{currentVuln.cvssScore} {currentVuln.severity}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Category:</span>
                  <span style={{ color: 'var(--text-muted)' }}>{currentVuln.owaspCategory || currentVuln.category}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-dim)' }}>MITRE Technique:</span>
                  <span style={{ color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)' }}>{currentVuln.mitreTechnique}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Asset:</span>
                  <span style={{ color: 'var(--text-muted)' }}>{currentVuln.assetName}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Analysis Output Panel */}
          <div className="glass-panel" style={{ padding: '24px', gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {analysis && (
              <>
                {/* Sub-tab navigation */}
                <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', overflowX: 'auto' }}>
                  {[
                    { id: 'technical', label: 'Technical Explanation' },
                    { id: 'executive', label: 'Executive Summary (C-Level)' },
                    { id: 'scenario', label: 'Attack Scenario' },
                    { id: 'code', label: 'Remediation & Code Fix' },
                  ].map(st => (
                    <button
                      key={st.id}
                      onClick={() => setAnalysisTab(st.id as any)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        background: analysisTab === st.id ? 'var(--accent-cyan)' : 'transparent',
                        color: analysisTab === st.id ? '#060913' : 'var(--text-muted)',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                {/* Sub-tab content */}
                {analysisTab === 'technical' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    <div>
                      <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '6px', fontSize: '0.95rem' }}>AI Technical Analysis</h4>
                      <p style={{ color: 'var(--text-muted)' }}>{analysis.technicalExplanation}</p>
                    </div>
                    <div style={{ background: '#070B14', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <strong style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Priority Assignment Rationale:</strong>
                      <div style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', marginTop: '4px' }}>{analysis.riskPrioritizationReason}</div>
                    </div>
                    <div>
                      <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '6px', fontSize: '0.85rem' }}>Compliance Standard Impact</h4>
                      <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {analysis.complianceImpact.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {analysisTab === 'executive' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.05) 100%)',
                      borderLeft: '4px solid var(--accent-cyan)',
                      padding: '16px',
                      borderRadius: '8px',
                    }}>
                      <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={18} color="var(--accent-cyan)" /> Executive Business Briefing
                      </h4>
                      <p style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{analysis.executiveSummary}</p>
                    </div>
                  </div>
                )}

                {analysisTab === 'scenario' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <h4 style={{ color: 'var(--accent-red)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={18} /> Simulated Exploitation Sequence
                    </h4>
                    <pre style={{
                      background: '#04070D',
                      color: '#FCA5A5',
                      padding: '16px',
                      borderRadius: '8px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.825rem',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {analysis.attackScenario}
                    </pre>
                  </div>
                )}

                {analysisTab === 'code' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <h4 style={{ color: 'var(--accent-green)', fontSize: '0.95rem', marginBottom: '8px' }}>
                        Recommended Step-by-Step Remediation
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {analysis.stepByStepRemediation.map((step, idx) => (
                          <div key={idx}>{step}</div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>Production Security Patch Snippet:</strong>
                        <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={handleCopyCode}>
                          {copiedCode ? <Check size={14} color="var(--accent-green)" /> : <Copy size={14} />}
                          {copiedCode ? 'Copied!' : 'Copy Code'}
                        </button>
                      </div>
                      <pre style={{
                        background: '#04070D',
                        border: '1px solid rgba(0, 242, 254, 0.3)',
                        padding: '16px',
                        borderRadius: '8px',
                        color: '#38BDF8',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.825rem',
                        overflowX: 'auto',
                        lineHeight: 1.5,
                      }}>
                        {analysis.codeFix}
                      </pre>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE AI CHAT */}
      {activeTab === 'chat' && (
        <div className="glass-panel" style={{ height: '600px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
          {/* Message History */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: msg.sender === 'user' ? 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)' : 'rgba(30, 41, 59, 0.8)',
                    color: msg.sender === 'user' ? '#060913' : 'var(--text-main)',
                    border: msg.sender === 'bot' ? '1px solid var(--border-color)' : 'none',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}
                >
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                  <div style={{
                    fontSize: '0.65rem',
                    marginTop: '6px',
                    textAlign: 'right',
                    opacity: 0.7,
                  }}>
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <input
              type="text"
              placeholder="Ask AI Analyst: e.g. 'How do I fix SQL injection in Node.js?' or 'Summarize critical risks'..."
              value={userQuery}
              onChange={e => setUserQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                background: '#F8FAFC',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '12px 20px' }}>
              <Send size={16} /> Ask AI
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
